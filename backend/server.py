from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import random
import string

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Helpers ──────────────────────────────────────────────────────────
def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_os_number():
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.digits, k=4))
    return f"OS-{date_part}-{random_part}"

# ── Pydantic Models ─────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: str = ""
    cep: str = ""
    address: str = ""
    number: str = ""
    neighborhood: str = ""
    city: str = ""
    state: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class ServiceOrderCreate(BaseModel):
    equipment_type: str
    brand: str
    service_type: str
    model: str = ""
    serial_number: str = ""
    warranty_status: str = ""
    defect_description: str = ""

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str

class BlogArticleCreate(BaseModel):
    title: str
    slug: str
    content: str
    summary: str = ""
    category: str = ""

# ── Static Data ──────────────────────────────────────────────────────
EQUIPMENT_TYPES = [
    {"id": "geladeiras", "name": "Geladeiras", "icon": "Snowflake"},
    {"id": "trituradores", "name": "Trituradores", "icon": "Cog"},
    {"id": "lava-e-seca", "name": "Lava e Seca", "icon": "Shirt"},
    {"id": "lavadoras", "name": "Lavadoras", "icon": "Droplets"},
    {"id": "ar-condicionado-split", "name": "Ar Condicionado Split", "icon": "Wind"},
    {"id": "ar-condicionado-portatil", "name": "Ar Condicionado Portatil", "icon": "AirVent"},
    {"id": "vrf-hisense", "name": "VRF Hisense", "icon": "Server"},
    {"id": "freezers", "name": "Freezers", "icon": "Thermometer"},
    {"id": "coifas", "name": "Coifas", "icon": "Fan"},
]

BRANDS = ["Panasonic", "Liebherr", "Bertazzoni", "Hisense", "Samsung", "LG", "Brastemp", "Electrolux", "Bosch", "Consul", "Midea", "Philco"]

INSTALLATION_DISABLED = ["geladeiras", "ar-condicionado-portatil", "lava-e-seca", "lavadoras"]

# ── Auth Endpoints ───────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response):
    email = data.email.lower().strip()
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "cep": data.cep,
        "address": data.address,
        "number": data.number,
        "neighborhood": data.neighborhood,
        "city": data.city,
        "state": data.state,
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax", max_age=2592000, path="/")
    full = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    full["_id"] = str(full["_id"])
    return full

@api_router.post("/auth/login")
async def login(data: LoginRequest, request: Request, response: Response):
    email = data.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked = attempt.get("locked_until")
        if locked and datetime.now(timezone.utc) < datetime.fromisoformat(locked):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax", max_age=2592000, path="/")
    full = await db.users.find_one({"_id": user["_id"]}, {"password_hash": 0})
    full["_id"] = str(full["_id"])
    return full

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        new_access = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=True, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.put("/auth/profile")
async def update_profile(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    allowed = ["name", "phone", "cep", "address", "number", "neighborhood", "city", "state"]
    update_data = {k: v for k, v in body.items() if k in allowed}
    if update_data:
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_data})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return updated

# ── Equipment ────────────────────────────────────────────────────────
@api_router.get("/equipment/types")
async def get_equipment_types():
    return EQUIPMENT_TYPES

@api_router.get("/equipment/brands")
async def get_brands():
    return BRANDS

@api_router.get("/equipment/rules")
async def get_rules():
    return {"installation_disabled": INSTALLATION_DISABLED}

# ── Service Orders ───────────────────────────────────────────────────
@api_router.post("/service-orders", status_code=201)
async def create_service_order(data: ServiceOrderCreate, request: Request):
    user_id = None
    user_email = None
    user_name = None
    try:
        user = await get_current_user(request)
        user_id = user["_id"]
        user_email = user.get("email")
        user_name = user.get("name")
    except Exception:
        pass
    os_number = generate_os_number()
    order_doc = {
        "os_number": os_number,
        "user_id": user_id,
        "user_email": user_email,
        "user_name": user_name,
        "equipment_type": data.equipment_type,
        "brand": data.brand,
        "service_type": data.service_type,
        "model": data.model,
        "serial_number": data.serial_number,
        "warranty_status": data.warranty_status,
        "defect_description": data.defect_description,
        "status": "aguardando_confirmacao",
        "visit_fee": "A definir",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.service_orders.insert_one(order_doc)
    order_doc.pop("_id", None)
    return order_doc

@api_router.get("/service-orders")
async def list_service_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.service_orders.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/service-orders/{os_number}")
async def get_service_order(os_number: str):
    order = await db.service_orders.find_one({"os_number": os_number}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Service order not found")
    return order

# ── Blog ─────────────────────────────────────────────────────────────
@api_router.get("/blog")
async def list_articles():
    articles = await db.blog_articles.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return articles

@api_router.get("/blog/{slug}")
async def get_article(slug: str):
    article = await db.blog_articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/blog")
async def create_article(data: BlogArticleCreate, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    doc = {
        "title": data.title,
        "slug": data.slug,
        "content": data.content,
        "summary": data.summary,
        "category": data.category,
        "author": user.get("name", "Admin"),
        "published": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blog_articles.insert_one(doc)
    doc.pop("_id", None)
    return doc

# ── Contact ──────────────────────────────────────────────────────────
@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    doc = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Mensagem enviada com sucesso!", "data": doc}

# ── CEP Proxy ────────────────────────────────────────────────────────
@api_router.get("/cep/{cep}")
async def lookup_cep(cep: str):
    cep_clean = cep.replace("-", "").replace(".", "").strip()
    if len(cep_clean) != 8 or not cep_clean.isdigit():
        raise HTTPException(status_code=400, detail="CEP invalido")
    try:
        resp = requests.get(f"https://viacep.com.br/ws/{cep_clean}/json/", timeout=5)
        data = resp.json()
        if "erro" in data:
            raise HTTPException(status_code=404, detail="CEP nao encontrado")
        return data
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Servico de CEP indisponivel")

# ── Chat IA "Mi" ─────────────────────────────────────────────────────
import litellm
from fastapi.responses import StreamingResponse
import json as _json

MI_SYSTEM_PROMPT = """Voce e a "Mi", assistente virtual oficial da Mastermaq Assistencia Tecnica, em Belo Horizonte/MG.

IDENTIDADE DA EMPRESA:
- Nome: Mastermaq Assistencia Tecnica
- Endereco: R. Descalvado, 636A - Renascenca, BH/MG, 31130-610
- Telefone: (31) 3422-5293
- Email: mastermaqassistencia@gmail.com
- Horario: Seg-Sex, 09:00 as 18:00
- Experiencia: 30+ anos, 28.000+ clientes atendidos, 4.1 estrelas no Google

MARCAS AUTORIZADAS (credenciamento oficial):
HQ (Belmicro), Franke, Hisense, Gorenje, Bertazzoni, Lofra, Panasonic, Liebherr.
Tambem atendemos marcas gerais: Samsung, LG, Brastemp, Consul, Electrolux, Bosch, Midea, Philco, Tecno, Viking.

EQUIPAMENTOS:
Geladeiras, Trituradores, Lava e Seca, Lavadoras, Ar Condicionado Split, Ar Condicionado Portatil, VRF Hisense, Freezers, Coifas.

INSTALACAO NAO DISPONIVEL para: Geladeiras, Ar Condicionado Portatil, Lava e Seca, Lavadoras.

COMO VOCE DEVE AGIR:
1. Seja cordial, objetiva e use linguagem brasileira natural com acentuacao correta.
2. Ajude com: informacoes da empresa, marcas atendidas, horarios, agendamento, status de OS, duvidas gerais sobre o servico.
3. NUNCA forneca diagnostico tecnico de problema em eletrodomestico. Se o cliente descrever um defeito (ex: "geladeira nao gela", "lavadora vaza agua"), voce deve:
   - Reconhecer o problema com empatia (1 linha).
   - Explicar que diagnostico preciso so pode ser feito presencialmente por tecnico habilitado, por seguranca e eficacia.
   - Recomendar abertura de Ordem de Servico (OS) para visita tecnica.
   - Sugerir clicar em "Agendar Visita Tecnica" no site, ou ligar (31) 3422-5293, ou se logado, usar o portal "Minha Conta" > "Novo Agendamento".
4. Quando o cliente pedir agendamento, colete (se ele ainda nao informou): tipo de equipamento, marca, modelo, breve descricao do problema, e oriente a finalizar pelo modal de agendamento.
5. Responda em markdown quando fizer sentido (listas, negrito), mas seja sucinta (3-6 linhas de media).
6. Se perguntarem sobre assuntos fora do escopo (politica, entretenimento, codigo, etc), redirecione gentilmente: "Posso te ajudar com assuntos da Mastermaq - agendamento, marcas, horarios ou duvidas sobre nossos servicos."
7. Use emojis com parcimonia (no maximo 1 por resposta) e apenas quando realmente agregarem.

NUNCA:
- Nunca invente precos, prazos exatos ou garanta resultado de conserto.
- Nunca forneca passo-a-passo tecnico para o cliente consertar sozinho.
- Nunca cite concorrentes.
"""


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str
    image: Optional[str] = None  # base64 data URL (data:image/...;base64,...) for user messages with attached image


class ChatStreamRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: Optional[str] = None  # server-side session id for logged-in persistence


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None


class ChatFeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    message_idx: Optional[int] = None  # position in conversation
    rating: str  # "up" | "down"
    user_text: Optional[str] = ""
    assistant_text: str = ""
    comment: Optional[str] = ""


async def _get_user_optional(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


def _get_llm_api_key():
    return os.environ.get("EMERGENT_LLM_KEY", "")


def _get_proxy_base():
    # matches emergentintegrations logic
    base = os.environ.get("integration_proxy_url") or os.environ.get("INTEGRATION_PROXY_URL") or "https://integrations.emergentagent.com"
    return base.rstrip("/") + "/llm"


@api_router.post("/chat/sessions")
async def create_chat_session(payload: ChatSessionCreate, request: Request):
    user = await _get_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login necessario para persistir sessoes")
    doc = {
        "user_id": user["_id"],
        "title": (payload.title or "Nova conversa")[:120],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.chat_sessions.insert_one(doc)
    return {"id": str(res.inserted_id), "title": doc["title"], "created_at": doc["created_at"], "updated_at": doc["updated_at"]}


@api_router.get("/chat/sessions")
async def list_chat_sessions(request: Request):
    user = await _get_user_optional(request)
    if not user:
        return []
    cursor = db.chat_sessions.find({"user_id": user["_id"]}).sort("updated_at", -1).limit(50)
    out = []
    async for s in cursor:
        out.append({
            "id": str(s["_id"]),
            "title": s.get("title", "Conversa"),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
        })
    return out


@api_router.get("/chat/sessions/{session_id}")
async def get_chat_session(session_id: str, request: Request):
    user = await _get_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login necessario")
    try:
        sess = await db.chat_sessions.find_one({"_id": ObjectId(session_id), "user_id": user["_id"]})
    except Exception:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")
    if not sess:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")
    msgs_cursor = db.chat_messages.find({"session_id": session_id}).sort("created_at", 1)
    messages = []
    async for m in msgs_cursor:
        item = {"id": str(m["_id"]), "role": m["role"], "content": m["content"], "created_at": m.get("created_at")}
        if m.get("image"):
            item["image"] = m["image"]
        messages.append(item)
    return {"id": session_id, "title": sess.get("title"), "messages": messages}


@api_router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, request: Request):
    user = await _get_user_optional(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login necessario")
    try:
        res = await db.chat_sessions.delete_one({"_id": ObjectId(session_id), "user_id": user["_id"]})
    except Exception:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")
    await db.chat_messages.delete_many({"session_id": session_id})
    return {"deleted": res.deleted_count}


@api_router.post("/chat/stream")
async def chat_stream(payload: ChatStreamRequest, request: Request):
    user = await _get_user_optional(request)
    api_key = _get_llm_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key nao configurada")

    # Build messages with system prompt at start
    msgs = [{"role": "system", "content": MI_SYSTEM_PROMPT}]
    for m in payload.messages[-30:]:  # cap history
        if m.role not in ("user", "assistant"):
            continue
        if m.role == "user" and m.image:
            # Multimodal content for GPT-5.2 vision
            parts = []
            if m.content:
                parts.append({"type": "text", "text": m.content})
            parts.append({"type": "image_url", "image_url": {"url": m.image}})
            msgs.append({"role": "user", "content": parts})
        else:
            msgs.append({"role": m.role, "content": m.content})

    last_user = ""
    for m in reversed(payload.messages):
        if m.role == "user":
            last_user = m.content
            break

    # Persist user message immediately if logged-in session
    saved_session_id = None
    last_user_image = None
    for m in reversed(payload.messages):
        if m.role == "user":
            last_user_image = m.image
            break
    if user and payload.session_id:
        try:
            sess = await db.chat_sessions.find_one({"_id": ObjectId(payload.session_id), "user_id": user["_id"]})
            if sess:
                saved_session_id = payload.session_id
                user_doc = {
                    "session_id": saved_session_id,
                    "role": "user",
                    "content": last_user,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                if last_user_image:
                    user_doc["image"] = last_user_image
                await db.chat_messages.insert_one(user_doc)
                # if first user message and no real title, use first 60 chars
                if (sess.get("title") or "Nova conversa") == "Nova conversa" and last_user:
                    await db.chat_sessions.update_one({"_id": sess["_id"]}, {"$set": {"title": last_user[:60], "updated_at": datetime.now(timezone.utc).isoformat()}})
        except Exception as e:
            logger.warning(f"chat persist user err: {e}")

    async def event_gen():
        full_text = ""
        try:
            stream = litellm.completion(
                model="gpt-5.2",
                messages=msgs,
                api_key=api_key,
                api_base=_get_proxy_base(),
                custom_llm_provider="openai",
                stream=True,
                max_tokens=400,
            )
            for chunk in stream:
                try:
                    delta = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else None
                except Exception:
                    delta = None
                if delta:
                    full_text += delta
                    yield f"data: {_json.dumps({'type': 'delta', 'content': delta})}\n\n"
            # persist assistant response
            if saved_session_id and full_text:
                try:
                    await db.chat_messages.insert_one({
                        "session_id": saved_session_id,
                        "role": "assistant",
                        "content": full_text,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    })
                    await db.chat_sessions.update_one({"_id": ObjectId(saved_session_id)}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
                except Exception as e:
                    logger.warning(f"chat persist assistant err: {e}")

            # Detect schedule intent and emit a suggest_schedule event
            try:
                text_lower = (full_text + " " + last_user).lower()
                intent_keywords = [
                    "ordem de servi", "visita técnica", "visita tecnica",
                    "agendar visita", "abrir uma os", "abrir os",
                ]
                if any(k in text_lower for k in intent_keywords):
                    # Try to extract equipment + brand from last user message
                    EQ_MAP = {
                        "geladeira": "geladeiras",
                        "freezer": "freezers",
                        "lavadora": "lavadoras",
                        "lava e seca": "lava-e-seca",
                        "coifa": "coifas",
                        "ar condicionado split": "ar-condicionado-split",
                        "ar-condicionado split": "ar-condicionado-split",
                        "split": "ar-condicionado-split",
                        "ar portátil": "ar-condicionado-portatil",
                        "ar portatil": "ar-condicionado-portatil",
                        "vrf": "vrf-hisense",
                        "triturador": "trituradores",
                    }
                    BRANDS_LOWER = [b.lower() for b in BRANDS]
                    eq_id = None
                    for k, v in EQ_MAP.items():
                        if k in text_lower:
                            eq_id = v
                            break
                    # scan recent user messages too
                    recent_user_blob = " ".join([m.content for m in payload.messages if m.role == "user"][-3:]).lower()
                    brand = ""
                    for b in BRANDS_LOWER:
                        if b in recent_user_blob or b in text_lower:
                            brand = next(x for x in BRANDS if x.lower() == b)
                            break
                    yield f"data: {_json.dumps({'type': 'suggest_schedule', 'equipment': eq_id or '', 'brand': brand})}\n\n"
            except Exception as e:
                logger.warning(f"intent detect err: {e}")

            yield f"data: {_json.dumps({'type': 'done', 'content': full_text})}\n\n"
        except Exception as e:
            logger.error(f"chat stream err: {e}")
            yield f"data: {_json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
    })


# ── STT (Whisper-1) ──────────────────────────────────────────────────
from fastapi import UploadFile, File
import io

@api_router.post("/chat/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Transcribe an audio file to text using Whisper-1 via Emergent key."""
    api_key = _get_llm_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key nao configurada")

    data = await audio.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio muito grande (limite 10MB)")

    # Build a BytesIO that has a .name attribute so OpenAI/Whisper can infer format
    filename = audio.filename or "audio.webm"
    bio = io.BytesIO(data)
    bio.name = filename

    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        stt = OpenAISpeechToText(api_key=api_key)
        resp = await stt.transcribe(
            file=bio,
            model="whisper-1",
            response_format="json",
            language="pt",
            temperature=0.0,
        )
        text = getattr(resp, "text", None) or (resp.get("text") if isinstance(resp, dict) else None) or ""
        return {"text": text.strip()}
    except Exception as e:
        logger.error(f"stt err: {e}")
        raise HTTPException(status_code=500, detail=f"Falha na transcricao: {str(e)[:200]}")


# ── Image upload (returns base64 data URL to attach in chat) ─────────
@api_router.post("/chat/upload")
async def chat_upload_image(image: UploadFile = File(...)):
    """Accept an image and return a data URL (base64) usable by chat stream as multimodal input."""
    content_type = (image.content_type or "").lower()
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
    if content_type not in allowed:
        raise HTTPException(status_code=400, detail="Formato nao suportado. Use JPG, PNG, WEBP ou GIF.")
    data = await image.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Imagem muito grande (limite 5MB).")
    import base64 as _b64
    b64 = _b64.b64encode(data).decode("ascii")
    return {
        "data_url": f"data:{content_type};base64,{b64}",
        "size": len(data),
        "content_type": content_type,
    }


# ── Feedback 👍👎 ────────────────────────────────────────────────────
@api_router.post("/chat/feedback")
async def chat_feedback(body: ChatFeedbackRequest, request: Request):
    if body.rating not in ("up", "down"):
        raise HTTPException(status_code=400, detail="rating deve ser 'up' ou 'down'")
    user = await _get_user_optional(request)
    doc = {
        "user_id": user["_id"] if user else None,
        "session_id": body.session_id,
        "message_idx": body.message_idx,
        "rating": body.rating,
        "user_text": (body.user_text or "")[:2000],
        "assistant_text": (body.assistant_text or "")[:4000],
        "comment": (body.comment or "")[:500],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_feedback.insert_one(doc)
    return {"ok": True}


# ── Startup ──────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.service_orders.create_index("os_number", unique=True)
    await db.service_orders.create_index("user_id")
    await db.blog_articles.create_index("slug", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@mastermaq.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "mastermaq@2026")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin Mastermaq",
            "phone": "",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    # Seed blog articles
    count = await db.blog_articles.count_documents({})
    if count == 0:
        articles = [
            {
                "title": "Como Manter Sua Geladeira Funcionando Perfeitamente",
                "slug": "manter-geladeira-funcionando",
                "content": "A manutencao preventiva da sua geladeira e essencial para garantir seu funcionamento ideal e prolongar sua vida util.\n\n**1. Limpe as bobinas do condensador**\nAs bobinas acumulam poeira ao longo do tempo, forcando o motor a trabalhar mais. Limpe-as a cada 6 meses.\n\n**2. Verifique as borrachas de vedacao**\nBorrachas danificadas permitem a entrada de ar quente, aumentando o consumo de energia.\n\n**3. Mantenha a temperatura ideal**\nA temperatura recomendada e entre 3C e 5C para o refrigerador e -18C para o freezer.\n\n**4. Nao sobrecarregue**\nColocar muitos itens dificulta a circulacao de ar frio.\n\n**5. Faca manutencao periodica**\nAgende uma revisao anual com tecnicos especializados da Mastermaq.",
                "summary": "Dicas essenciais para manter sua geladeira funcionando com eficiencia e prolongar sua vida util.",
                "category": "Manutencao",
                "author": "Equipe Mastermaq",
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "title": "Quando Trocar o Filtro do Ar Condicionado Split",
                "slug": "trocar-filtro-ar-condicionado",
                "content": "O filtro do ar condicionado split e um componente crucial para a qualidade do ar e eficiencia do equipamento.\n\n**Por que trocar o filtro?**\nFiltros sujos reduzem a eficiencia do ar condicionado em ate 15%, aumentam o consumo de energia e podem causar problemas respiratorios.\n\n**Quando trocar?**\n- A cada 3 meses em ambientes residenciais\n- Mensalmente em ambientes com pets ou fumantes\n- Sempre que notar acumulo visivel de poeira\n\n**Sinais de que o filtro precisa ser trocado:**\n- Ar condicionado demora mais para resfriar o ambiente\n- Ruido excessivo durante o funcionamento\n- Cheiro desagradavel ao ligar\n- Aumento na conta de energia\n\nNa Mastermaq, realizamos a troca e higienizacao completa do seu ar condicionado.",
                "summary": "Saiba o momento certo de trocar o filtro do seu ar condicionado split.",
                "category": "Ar Condicionado",
                "author": "Equipe Mastermaq",
                "published": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                "updated_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
            },
            {
                "title": "5 Sinais de Que Sua Lava e Seca Precisa de Manutencao",
                "slug": "sinais-lava-seca-manutencao",
                "content": "Sua lava e seca e um dos equipamentos mais utilizados. Fique atento a estes sinais:\n\n**1. Ruidos estranhos durante o ciclo**\nBatidas, rangidos ou zumbidos podem indicar problemas nos rolamentos.\n\n**2. Roupas nao ficam secas**\nSe as roupas saem umidas apos o ciclo de secagem, pode haver problemas na resistencia.\n\n**3. Vazamentos de agua**\nMangueiras danificadas ou bomba com defeito sao causas comuns.\n\n**4. Cheiro de mofo ou queimado**\nMofo indica acumulo de umidade, enquanto cheiro de queimado pode ser sinal de problema eletrico.\n\n**5. Erro no painel**\nCodigos de erro sao alertas do sistema. Consulte o manual ou entre em contato com a Mastermaq.\n\nNao ignore esses sinais! Agende uma visita tecnica.",
                "summary": "Identifique os sinais de que sua lava e seca precisa de atencao tecnica.",
                "category": "Lava e Seca",
                "author": "Equipe Mastermaq",
                "published": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                "updated_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            },
        ]
        await db.blog_articles.insert_many(articles)
        logger.info("Blog articles seeded")

    # Write test credentials (only in development)
    try:
        os.makedirs("/app/memory", exist_ok=True)
        with open("/app/memory/test_credentials.md", "w") as f:
            f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n- PUT /api/auth/profile\n")
    except Exception:
        pass

app.include_router(api_router)

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
origins_list = [o.strip() for o in cors_origins.split(",") if o.strip()]
if "*" in origins_list:
    origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True if "*" not in origins_list else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
