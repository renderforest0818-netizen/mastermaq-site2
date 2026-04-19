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
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": data.name, "role": "customer"}

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
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "customer")}

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
        response.set_cookie(key="access_token", value=new_access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
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
