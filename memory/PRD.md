# Mastermaq Assistencia Tecnica - PRD / Model Context

## 1. Visao Geral do Projeto
Site institucional completo (Multi-page Application) para a Mastermaq Assistencia Tecnica — servico autorizado de reparo de eletrodomesticos em Belo Horizonte, MG. O foco e transmitir autoridade, confianca e agilidade com um fluxo de agendamento interativo e portal do cliente.

**URL Producao:** https://mastermaqassistencia.com.br
**CNPJ:** 19.955.560/0001-28
**Endereco:** R. Descalvado, 636A - Renascenca, BH/MG, 31130-610
**Telefone:** (31) 3422-5293
**Email:** mastermaqassistencia@gmail.com
**Horario:** Seg-Sex 09:00-18:00

## 2. Arquitetura Tecnica

### Stack
- **Frontend:** React 19 (CRA + Craco) + Tailwind CSS 3 + Shadcn/UI (Radix) + Framer Motion
- **Backend:** FastAPI (Python) + Motor (async MongoDB driver)
- **Banco:** MongoDB
- **Auth:** JWT (httpOnly cookies) + bcrypt
- **Fontes:** Outfit (headings) + Manrope (body) via Google Fonts
- **Icones:** lucide-react

### Estrutura de Arquivos
```
/app/
├── backend/
│   ├── server.py          # Unico arquivo backend (FastAPI + todas as rotas)
│   ├── .env               # MONGO_URL, DB_NAME, JWT_SECRET
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js         # Router principal + ScrollToTop + ProtectedRoute
│   │   ├── App.css         # Estilos globais (font-heading, scrollbar, selection)
│   │   ├── index.css       # Tailwind imports + CSS vars + Google Fonts
│   │   ├── index.js        # Entry point React
│   │   ├── components/
│   │   │   ├── Header.js         # Header branco com barra info (email, endereco, tel)
│   │   │   ├── Footer.js         # Footer branco com contatos
│   │   │   ├── SchedulingModal.js # Modal multi-step (marca logo > servico > form > OS)
│   │   │   ├── WhatsAppButton.js  # Botao fixo WhatsApp
│   │   │   └── ui/               # ~47 componentes Shadcn/Radix
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # Provider JWT (login, register, logout, refresh, updateProfile)
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   ├── api.js            # Axios instance (baseURL = REACT_APP_BACKEND_URL/api)
│   │   │   └── utils.js          # cn() utility
│   │   └── pages/
│   │       ├── HomePage.js       # Scrollytelling: Hero, Marcas, Autorizado, Equipamentos, Como Funciona, Diferenciais, Depoimentos, CTA
│   │       ├── ServicesPage.js   # /servicos e /servicos/:slug (detalhe com carrossel de produtos)
│   │       ├── AboutPage.js      # /sobre (historia, missao, valores, stats)
│   │       ├── ContactPage.js    # /contato (form + Google Maps iframe)
│   │       ├── BlogPage.js       # /blog (lista artigos do backend)
│   │       ├── BlogArticlePage.js # /blog/:slug
│   │       ├── LoginPage.js      # /login
│   │       ├── RegisterPage.js   # /cadastro (2 etapas + ViaCEP)
│   │       └── PortalPage.js     # /minha-conta (OS ativas, historico, perfil)
│   ├── public/
│   │   ├── images/
│   │   │   ├── assets/           # ~25 logos de marcas (PNG/SVG) + mastermaq-logo + whatsapp + qr-code
│   │   │   ├── geladeiras/       # 11 fotos de geladeiras por marca
│   │   │   ├── trituradores/     # 1 foto (franke)
│   │   │   └── hero-bg.png
│   │   └── index.html
│   ├── .env                 # REACT_APP_BACKEND_URL, WDS_SOCKET_PORT=443
│   ├── package.json         # yarn, craco, deps
│   ├── tailwind.config.js
│   └── craco.config.js      # Alias @/src, visual edits plugin
└── memory/
    ├── PRD.md               # Este documento
    └── test_credentials.md
```

## 3. Backend (server.py) — API Completa

### Colecoes MongoDB
- `users` — email (unique), password_hash, name, phone, cep, address, role (customer/admin)
- `service_orders` — os_number (unique), user_id, equipment_type, brand, service_type, model, serial_number, warranty_status, defect_description, status, visit_fee
- `blog_articles` — title, slug (unique), content, summary, category, author, published
- `contact_messages` — name, email, phone, message
- `login_attempts` — identifier, count, locked_until (brute force)

### Endpoints
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro (retorna user + set cookies) |
| POST | /api/auth/login | Login com brute force protection |
| POST | /api/auth/logout | Limpa cookies |
| GET | /api/auth/me | Retorna user autenticado |
| POST | /api/auth/refresh | Renova access token |
| PUT | /api/auth/profile | Atualiza perfil (name, phone, cep, etc) |
| GET | /api/equipment/types | 9 tipos de equipamentos |
| GET | /api/equipment/brands | 12 marcas |
| GET | /api/equipment/rules | Regras (installation_disabled) |
| POST | /api/service-orders | Cria OS (gera os_number automatico) |
| GET | /api/service-orders | Lista OS do usuario logado |
| GET | /api/service-orders/:os | Busca OS por numero |
| GET | /api/blog | Lista artigos publicados |
| GET | /api/blog/:slug | Artigo por slug |
| POST | /api/blog | Cria artigo (admin only) |
| POST | /api/contact | Envia mensagem de contato |
| GET | /api/cep/:cep | Proxy ViaCEP |

### Seed (startup)
- Admin: admin@mastermaq.com / mastermaq@2026
- 3 artigos de blog

## 4. Regras de Negocio

### Equipamentos (9 tipos)
Geladeiras, Trituradores, Lava e Seca, Lavadoras, Ar Condicionado Split, Ar Condicionado Portatil, VRF Hisense, Freezers, Coifas

### Instalacao Desabilitada Para:
- Geladeiras
- Ar Condicionado Portatil
- Lava e Seca
- Lavadoras

### Marcas Autorizadas (8):
Hisense, Panasonic, Liebherr, Bertazzoni, Franke, Gorenje, Tecno, Lofra

### Fluxo de Agendamento (Modal 4 etapas):
1. Selecao de Marca (grid de logos, grayscale -> color hover, checkmark)
2. Tipo de Servico (Instalacao/Conserto — instalacao desabilitada para certos equip.)
3. Formulario de Conserto (modelo, serie, garantia, defeito)
4. Confirmacao (OS gerada, numero exibido, CTAs: Fechar / Acompanhar OS)

### Cadastro (2 etapas):
1. Email, Senha, Confirmar Senha
2. Nome, Telefone (mascara), CEP (auto-fill ViaCEP), Endereco completo

## 5. Design System

### Cores
- Primaria: Azul Marinho #1E3A8A
- Cobalt: #2563EB
- Acento: Vermelho #DC2626 (CTAs urgentes)
- Background: #FFFFFF, #F8FAFC, #F1F5F9
- Texto: #0F172A (primary), #475569 (secondary)
- Dark sections: #020617 (slate-950), #0F1D3D

### Tipografia
- Headings: Outfit (semibold, tracking-tight)
- Body: Manrope (regular, leading-relaxed)
- Overlines: 11px, bold, uppercase, tracking-[0.25em], text-blue-600

### Componentes
- Botoes: rounded-none (sharp edges, estilo Swiss)
- Cards: border border-slate-200, hover:-translate-y-1 hover:shadow-xl
- Inputs: border border-slate-300 rounded-none focus:ring-blue-600
- Header: Branco com barra info no topo (collapsa no scroll)
- Footer: Branco com icones azuis em bg-blue-50

### Principios
- Assimetria elegante (grids 5/7, 4/8, 7/5)
- Conectividade visual entre secoes
- Grayscale -> color hover em logos
- Microinteracoes (hover elevacao, accent lines, scale)
- Animacoes: framer-motion fadeUp, fadeLeft, fadeRight, stagger

## 6. Homepage — Secoes (em ordem)
1. **Hero** — bg-slate-950, texto esquerda (7col), carrossel produtos direita (5col)
2. **Carrossel de Marcas** — Marquee horizontal, grayscale->color, 17 marcas
3. **Servico Autorizado** — 40/60 assimetrico, 8 marcas autorizadas com badges, tooltips, bloco credibilidade
4. **Equipamentos** — 40/60 assimetrico (titulo sticky esq, grid cards dir), 9 equipamentos
5. **Como Funciona** — bg-slate-950, 3 steps conectados, dot-grid texture
6. **Diferenciais** — 4/8 assimetrico, 6 cards com accent line hover
7. **Depoimentos** — 8 avaliacoes REAIS do Google (4.1 estrelas, 134 avaliacoes), featured quote 7col + grid 5col
8. **CTA Final** — bg-[#0F1D3D], stats grid (30+ anos, 28000+ clientes, 8+ marcas, 98% satisfacao)

## 7. Estatisticas Institucionais (usar em todo o site)
- **30+** Anos de Experiencia
- **28000+** Clientes Atendidos
- **8+** Marcas Autorizadas
- **98%** Satisfacao

## 8. Avaliacoes Google (reais)
Nota geral: 4.1 (134 avaliacoes)
1. Rose C Vieira — "Fui muito bem atendida por profissionais gabaritados! Minha Panasonic ficou maravilhosa!"
2. Rafael Lucas — "A empresa e muito seria e confiavel. Necessitei deles para dois reparos, e foram otimos!"
3. Felipe Porto Aires — "Consertaram minha geladeira Panasonic, servico honesto, rapido e o tecnico mostrou muita seguranca!"
4. Cristiano Reis de Paiva — "Excelente atendimento. Profissional extremamente gentil, educado e atencioso."
5. Marianna Keller — "Excelente profissional e atendimento rapido, indico."
6. Toca Espeto — "Atendimento muito bom. Resolveram meu problema prontamente, rapido e eficaz com preco justo!"
7. Rodrigo G. Amaral — "Acionei a Mastermaq porque a minha geladeira Electrolux estava gelando pouco, fui atendido no mesmo dia."
8. Juhh Costa — "Nelson um otimo atendente, muito atencioso e explicativo."

## 9. Backlog Priorizado

### P1 (Proximo)
- Painel Administrativo (gestao de OS: status, filtros, drag-drop pipeline)
- Admin Blog CRUD (criar/editar/excluir artigos)
- Pagina dedicada "Marcas Atendidas"
- Notificacoes por email (status OS)

### P2
- Fluxo de reset de senha
- Upload de fotos no formulario de conserto
- Mais imagens de produtos (lava-seca, AC, freezers, coifas)
- SEO meta tags por pagina
- Schema Markup JSON-LD

### P3
- Google Analytics
- Sitemap XML
- Push notifications
- Multi-language support
- Chat WhatsApp integrado com IA

## 10. Credenciais de Teste
- **Admin:** admin@mastermaq.com / mastermaq@2026
- **Backend .env:** MONGO_URL, DB_NAME, JWT_SECRET
- **Frontend .env:** REACT_APP_BACKEND_URL

## 11. Notas Importantes para o Proximo Agente
- NÃO usar a palavra "Premium" em nenhum lugar do site (foi substituida por "Autorizada")
- Logos devem SEMPRE manter cores originais (nunca usar brightness-0 invert)
- Header e Footer sao BRANCOS (tema claro)
- Horario de atendimento: Seg-Sex 09:00-18:00
- Stats: 30+ anos, 28000+ clientes, 8+ marcas autorizadas
- As imagens de produtos estao em /public/images/ (geladeiras, trituradores)
- Os logos das marcas estao em /public/images/assets/
- O CNPJ real e 19.955.560/0001-28
- A secao "Servico Autorizado" e critica para credibilidade — priorizar qualidade visual
