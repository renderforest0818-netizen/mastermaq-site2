# Mastermaq Assistência Técnica — PRD

## Original Problem Statement
Site institucional completo para Mastermaq (React 19 + FastAPI + MongoDB):
homepage com scrollytelling, sistema de agendamento com geração automática de
OS, portal do cliente, blog, landing VRF Hisense, IA "Mi" (texto + voz),
integração com sistema externo `mastermaq-systems` para sincronização de OS,
PWA + autenticação OAuth Google.

## Personas
- Cliente final: agenda visita, acompanha OS no portal, fala com a Mi.
- Atendente/Admin (`role=admin`): consulta/recolhe OS, resync com sistema externo.
- Sistema externo Mastermaq: envia updates via webhook autenticado por X-API-Key.

## Architecture
- Backend: `/app/backend/server.py` (FastAPI + Motor, ~1300 linhas)
- Frontend: `/app/frontend/src` (React 19, PWA via `public/sw.js`)
- Auth: JWT custom + Google OAuth (`/api/auth/google`)
- LLM: OpenAI GPT-5.2 / Whisper-1 / TTS via Emergent LLM Key
- Storage: MongoDB (`users`, `service_orders`, `service_order_events`,
  `blog_posts`, `chat_sessions`, etc.)

## Key Endpoints
- `POST /api/service-orders` — cria OS local + push externo em background
- `POST /api/external/webhook/status` — recebe updates do sistema externo
  (X-API-Key). Lookup robusto em `os_number` E `external_os_number`.
- `GET /api/service-orders/{os_number}/events` — timeline da OS (auth do dono ou admin)
- `POST /api/admin/service-orders/resync` — batch resync de OSs não sincronizadas
- `POST /api/auth/google` — login social via Google Identity
- `POST /api/chat/*` — Mi chat / voice (SSE streaming)

## Completed (latest first)
### 2026-05-19
- **Fix P0**: Webhook `/api/external/webhook/status` agora aceita o ID externo
  (ex.: `27677`) enviado tanto no campo `os_number` quanto em
  `external_os_number`. Lookup faz `$or` em ambos os campos. Testado via curl
  (5 cenários: external como os_number, interno, external explícito, 404, 401).

### Sessão anterior (resumo)
- CORS resolvido com `window.location.origin` em `frontend/src/lib/api.js`.
- Voice Mode (Mi) refatorado: sentence streaming, barge-in, VAD, SSML pt-BR.
- Hybrid SEO/Login gate no agendamento via `pendingSchedule.js`.
- `motor` adicionado a `requirements.txt` (resolveu 520 em produção).
- `phone` obrigatório no registro + `/api/admin/service-orders/resync`.
- Google OAuth 2.0 (login + signup).
- Substituição de "Agendar" → "Solicitar Orçamento"; fonte Surgena; imagens sem
  fundo; logo Gorenje; tela de confirmação de OS.
- PWA auto-update com cache invalidation (`sw.js` versionado).

## Backlog (prioridade)
### P1
- Painel Admin (UI) para gerenciar OSs e disparar resync manual.
- Tela "Alterar Senha" no portal do cliente (P2 originalmente, promovido).

### P2
- Refactor `server.py` → routers (`auth.py`, `orders.py`, `chat.py`, `webhooks.py`).
- Refactor `MiChatWidget.js` (>1000 linhas) separando UI/SSE/API.
- Testes pytest em `/app/backend/tests/`.

## Known Gotchas
- PWA: incrementar `VERSION` em `sw.js` quando mudar assets.
- Backend Supervisor: após `pip install`, sempre `pip freeze > requirements.txt`.
- ENV externas (`EXTERNAL_OS_API_URL`, `EXTERNAL_OS_API_KEY`,
  `REACT_APP_GOOGLE_CLIENT_ID`) são configuradas via aba Environment Variables
  na Emergent.

## Test Credentials
Ver `/app/memory/test_credentials.md`.
