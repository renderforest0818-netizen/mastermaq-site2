# Mastermaq Assistencia Tecnica — Site Institucional

Site institucional completo para a **Mastermaq Assistencia Tecnica**, servico autorizado de conserto de eletrodomesticos em Belo Horizonte/MG. Inclui homepage com scrollytelling, sistema de agendamento com geracao automatica de OS, portal do cliente, blog, e pagina dedicada VRF Hisense.

**CNPJ:** 19.955.560/0001-28
**Endereco:** R. Descalvado, 636A - Renascenca, BH/MG, 31130-610
**Telefone:** (31) 3422-5293 | **Email:** mastermaqassistencia@gmail.com

---

## Stack Tecnica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 (CRA + Craco) + Tailwind CSS 3 + Shadcn/UI (Radix) + Framer Motion |
| Backend | FastAPI (Python) + Motor (async MongoDB driver) |
| Banco | MongoDB (local ou Atlas) |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Fontes | Plus Jakarta Sans (headings) + IBM Plex Sans (body) |
| Icones | lucide-react |

---

## Estrutura do Projeto

```
/
├── backend/
│   ├── server.py              # API FastAPI completa (unico arquivo)
│   ├── requirements.txt       # Dependencias Python (pip freeze)
│   ├── .env                   # Variaveis de ambiente (MONGO_URL, DB_NAME, JWT_SECRET, CORS_ORIGINS)
│   └── .python-version        # 3.11.11
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Router + ScrollToTop + ProtectedRoute
│   │   ├── App.css            # Estilos globais (font-heading, scrollbar)
│   │   ├── index.css          # Tailwind imports + Google Fonts
│   │   ├── index.js           # Entry point
│   │   │
│   │   ├── components/
│   │   │   ├── Header.js      # Header branco com barra info (email, endereco, tel)
│   │   │   ├── Footer.js      # Footer branco (Seg-Sex 09:00-18:00)
│   │   │   ├── SchedulingModal.js  # Modal multi-step (marca→servico→form→OS)
│   │   │   ├── WhatsAppButton.js   # Botao fixo WhatsApp (verde escuro)
│   │   │   └── ui/            # ~47 componentes Shadcn/Radix
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Provider JWT (login, register, logout, refresh)
│   │   │
│   │   ├── lib/
│   │   │   ├── api.js          # Axios instance (baseURL = REACT_APP_BACKEND_URL/api)
│   │   │   └── utils.js        # cn() utility
│   │   │
│   │   └── pages/
│   │       ├── HomePage.js          # Homepage com scrollytelling (8 secoes)
│   │       ├── ServicesPage.js      # /servicos + /servicos/:slug
│   │       ├── VRFHisensePage.js    # /servicos/vrf-hisense (landing page dedicada)
│   │       ├── AboutPage.js         # /sobre
│   │       ├── ContactPage.js       # /contato (com Google Maps)
│   │       ├── BlogPage.js          # /blog
│   │       ├── BlogArticlePage.js   # /blog/:slug
│   │       ├── LoginPage.js         # /login
│   │       ├── RegisterPage.js      # /cadastro (2 etapas + ViaCEP)
│   │       └── PortalPage.js        # /minha-conta (OS, historico, perfil)
│   │
│   ├── public/
│   │   ├── images/
│   │   │   ├── assets/        # ~23 logos de marcas (PNG/SVG) + mastermaq-logo + whatsapp
│   │   │   ├── geladeiras/    # 11 fotos de geladeiras por marca
│   │   │   ├── trituradores/  # 1 foto (franke)
│   │   │   ├── vrf/           # ~60 fotos VRF Hisense (series, indoor, outdoor)
│   │   │   └── hero-bg.png    # Imagem de fundo hero (tambem usada na pag Sobre)
│   │   └── index.html
│   │
│   ├── .env                   # REACT_APP_BACKEND_URL
│   ├── package.json           # yarn, craco, dependencias
│   ├── tailwind.config.js
│   ├── craco.config.js        # Alias @/ → src/
│   └── yarn.lock
│
├── render.yaml                # Render Blueprint (backend + frontend)
├── DEPLOY_RENDER.md           # Guia completo de deploy
└── memory/
    ├── PRD.md                 # Product Requirements Document
    └── test_credentials.md    # Credenciais de teste
```

---

## Como Rodar Localmente

### Pre-requisitos
- Node.js 18+ e Yarn
- Python 3.11+
- MongoDB rodando local (ou Atlas)

### Backend

```bash
cd backend

# Criar .env
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=mastermaq_db
JWT_SECRET=qualquer-string-secreta-aqui
CORS_ORIGINS=http://localhost:3000
EOF

# Instalar e rodar
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

O backend:
- Cria automaticamente um admin no startup: `admin@mastermaq.com` / `mastermaq@2026`
- Cria 3 artigos de blog de exemplo
- Roda na porta 8001

### Frontend

```bash
cd frontend

# Criar .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Instalar e rodar
yarn install
yarn start
```

O frontend roda na porta 3000.

---

## Variaveis de Ambiente

### Backend (`backend/.env`)

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `MONGO_URL` | Connection string MongoDB | `mongodb://localhost:27017` ou `mongodb+srv://...` |
| `DB_NAME` | Nome do banco | `mastermaq_db` |
| `JWT_SECRET` | Chave secreta para tokens JWT | String aleatoria longa |
| `CORS_ORIGINS` | URLs permitidas (separadas por virgula) | `http://localhost:3000,https://seudominio.com` |

### Frontend (`frontend/.env`)

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `REACT_APP_BACKEND_URL` | URL base da API (sem /api) | `http://localhost:8001` ou `https://sua-api.onrender.com` |

---

## API Backend — Endpoints

### Auth
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro (2 etapas: email/senha + dados pessoais) |
| POST | `/api/auth/login` | Login (retorna cookies httpOnly) |
| POST | `/api/auth/logout` | Logout (limpa cookies) |
| GET | `/api/auth/me` | Usuario autenticado |
| POST | `/api/auth/refresh` | Renovar access token |
| PUT | `/api/auth/profile` | Atualizar perfil |

### Equipamentos e OS
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/equipment/types` | 9 tipos de equipamentos |
| GET | `/api/equipment/brands` | Marcas disponiveis |
| GET | `/api/equipment/rules` | Regras (instalacao desabilitada) |
| POST | `/api/service-orders` | Criar OS (gera numero automatico) |
| GET | `/api/service-orders` | Listar OS do usuario logado |
| GET | `/api/service-orders/:os` | Buscar OS por numero |

### Blog e Contato
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/blog` | Listar artigos |
| GET | `/api/blog/:slug` | Artigo por slug |
| POST | `/api/blog` | Criar artigo (admin) |
| POST | `/api/contact` | Enviar mensagem contato |
| GET | `/api/cep/:cep` | Proxy ViaCEP |

---

## Regras de Negocio

### Equipamentos (9 tipos)
Geladeiras, Trituradores, Lava e Seca, Lavadoras, Ar Condicionado Split, Ar Condicionado Portatil, VRF Hisense, Freezers, Coifas

### Instalacao Desabilitada Para:
Geladeiras, Ar Condicionado Portatil, Lava e Seca, Lavadoras

### Marcas Autorizadas (com selo):
HQ, Franke, Hisense, Gorenje, Bertazzoni, Lofra, Panasonic

### Garantia — "Dentro de garantia" bloqueado para marcas NAO autorizadas
Se o usuario selecionar uma marca que nao esta na lista de autorizadas, o radio button "Dentro da garantia" fica desabilitado com tooltip explicativo.

### Fluxo de Agendamento (Modal 4 etapas):
1. **Marca** — Grid de logos (grayscale → color hover, checkmark na selecionada)
2. **Servico** — Instalacao/Conserto (botoes limpos, sem cor forte)
3. **Formulario** — Modelo, serie, garantia, defeito
4. **Confirmacao** — OS gerada com numero, status, taxa de visita

### Cadastro (2 etapas):
1. Email, Senha, Confirmar Senha
2. Nome, Telefone (mascara), CEP (auto-fill ViaCEP), Endereco

---

## Paginas do Site

### Homepage (`/`)
8 secoes com scrollytelling:
1. **Hero** — Fundo escuro com iluminacao direcional (SVG arc + radial-gradient #004cff), carrossel de produtos, CTA + WhatsApp
2. **Carrossel de Marcas** — Marquee horizontal, 18 logos grayscale→color hover
3. **Servico Autorizado** — Layout 40/60, carrossel horizontal de 6 cards (HQ, Bertazzoni&Lofra, Gorenje, Hisense, Franke, Panasonic)
4. **Equipamentos** — Layout 40/60, grid de 9 cards com imagens/icones
5. **Como Funciona** — Fundo escuro, 3 steps conectados
6. **Diferenciais** — Chips compactos centralizados (6 itens)
7. **Depoimentos** — Grid 3-3-2, 8 avaliacoes REAIS do Google (4.1 estrelas, 134 avaliacoes)
8. **CTA Final** — Fundo escuro com glow, metricas 2x2

### VRF Hisense (`/servicos/vrf-hisense`)
Landing page de alta conversao estilo SaaS/Fizens:
- Hero com fundo claro, produto real, stats
- O que e VRF (3 cards)
- Features Hisense (4 cards com imagens)
- Carrossel de 8 series VRF reais
- Por que Mastermaq (3 blocos alternados imagem+texto)
- Stats, Como Funciona, FAQ, CTA Final

### Outras Paginas
- `/servicos` — Grid de 9 servicos
- `/servicos/:slug` — Detalhe com hero dark, carrossel de produtos (geladeiras), problemas comuns
- `/sobre` — Historia, missao, valores, stats
- `/contato` — Formulario + Google Maps iframe
- `/blog` — Lista artigos do backend
- `/blog/:slug` — Artigo individual
- `/login` — Email/senha
- `/cadastro` — 2 etapas + ViaCEP
- `/minha-conta` — Portal do cliente (OS ativas, historico, perfil, modal de agendamento)

---

## Design System

### Cores
- Background dark: `#080e1a`, `#060d18`, `#030014`
- Azul iluminacao: `#004cff`
- Azul botoes: `#2563EB` (blue-600)
- Vermelho CTA: `#DC2626` (red-600)
- Texto: `#0F172A` (slate-900), `#475569` (slate-500)
- Background claro: `#FFFFFF`, `#F8FAFC`, `#F1F5F9`

### Tipografia
- Headings: **Plus Jakarta Sans** (bold, tracking-tight ou tracking-wide)
- Body: **IBM Plex Sans** (regular, leading-relaxed)
- Overlines: 11px, bold, uppercase, tracking-[0.25em] ou [0.3em], text-blue-600

### Componentes
- Bordas sharp (sem rounded)
- Cards: `border border-slate-200`, hover com `-translate-y-1` e `shadow-md`
- Animacoes: `fadeUp` (opacity 0→1, y 20→0), `cubic-bezier(0.22, 1, 0.36, 1)`

### Iluminacao Hero (IMPORTANTE)
A hero usa iluminacao direcional em camadas SEM blur difuso:
- **Fundo**: `radial-gradient` multi-camada com luz concentrada at 95% 0%
- **SVG Arc**: Ellipse com stroke gradiente (#004cff, opacity 0.6→0)
- **Drop-shadow no produto**: `drop-shadow(0 0 25px rgba(0,76,255,0.3))`
- **Radial atras do produto**: rgba(0,76,255,0.15)
- **Floor reflection**: radial-gradient sutil no bottom

### Palavras Proibidas
- ❌ "Premium" — substituir por "Autorizada" ou "de alto padrao"
- Usar "produto" em vez de "equipamento"

---

## Estatisticas Institucionais (usar em todo o site)
- **30+** Anos de Experiencia
- **28000+** Clientes Atendidos
- **8+** Marcas Autorizadas
- **98%** Satisfacao

---

## Avaliacoes Google (dados reais)
**Nota:** 4.1 | **Total:** 134 avaliacoes

1. Rose C Vieira — "Fui muito bem atendida por profissionais gabaritados!"
2. Rafael Lucas — "A empresa e muito seria e confiavel."
3. Felipe Porto Aires — "Servico honesto, rapido e o tecnico mostrou muita seguranca!"
4. Cristiano Reis de Paiva — "Excelente atendimento. Profissional extremamente gentil."
5. Marianna Keller — "Excelente profissional e atendimento rapido."
6. Toca Espeto — "Atendimento rapido e eficaz com preco justo!"
7. Rodrigo G. Amaral — "Fui atendido no mesmo dia."
8. Juhh Costa — "Nelson um otimo atendente, muito atencioso."

---

## Credenciais de Teste
- **Admin:** admin@mastermaq.com / mastermaq@2026
- **Role:** admin

---

## Deploy

Veja o arquivo `DEPLOY_RENDER.md` para instrucoes completas de deploy no Render + MongoDB Atlas.

**Resumo rapido:**
1. MongoDB Atlas (gratuito M0) — criar cluster e copiar connection string
2. Backend no Render: Web Service, Root Dir = `backend`, Python 3.11
3. Frontend no Render: Static Site, Root Dir = `frontend`, Build = `yarn install && yarn build`
4. Configurar variaveis de ambiente em ambos

---

## Dependencias Principais

### Backend
- fastapi, uvicorn, motor, pymongo, bcrypt, pyjwt, python-dotenv, requests

### Frontend
- react, react-router-dom, axios, framer-motion, react-fast-marquee
- @radix-ui/* (shadcn components), tailwindcss, lucide-react, sonner
- embla-carousel-react, craco (build config com alias @/)

---

## Notas para o Proximo Agente

1. **Todas as rotas frontend comecam com `/api`** no backend — o frontend usa `REACT_APP_BACKEND_URL/api/...`
2. **O CRA usa Craco** (nao react-scripts puro) para suportar o alias `@/` → `src/`
3. **Shadcn components** estao em `src/components/ui/` — importar com `@/components/ui/...`
4. **MongoDB IDs** — sempre excluir `_id` nas projecoes ou converter para string antes de retornar JSON
5. **JWT cookies** sao httpOnly — o frontend nao tem acesso direto ao token, tudo via cookies
6. **ViaCEP proxy** — o backend faz proxy em `/api/cep/:cep` para evitar CORS no frontend
7. **Imagens** estao em `public/images/` — referenciar como `/images/...` no codigo
8. **A pagina VRF** (`VRFHisensePage.js`) e renderizada pelo `ServicesPage.js` quando slug = `vrf-hisense`
9. **ScrollToTop** esta no `App.js` — reseta scroll ao navegar entre paginas
10. **O header** tem uma barra de info no topo que colapsa no scroll
