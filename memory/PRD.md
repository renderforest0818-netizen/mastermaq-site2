# Mastermaq Assistencia Tecnica - PRD

## Stack: React 19 (CRA+Craco) + Tailwind + Shadcn/UI + Framer Motion | FastAPI + MongoDB | JWT Auth | OpenAI GPT-5.2 + Whisper-1 via Emergent Universal Key

## Implementado (Iteracoes 1-13)
- Site institucional completo (home com scrollytelling, VRF Hisense dedicada, servicos, blog, portal, modal de agendamento)
- Auth JWT httpOnly + seeds admin + blog + CEP proxy

## Iteracao 14 (2026-04-19): Setup do ambiente
- Clone do repo + supervisor + seeds

## Iteracao 15 (2026-04-19): Bug CEP
- Mascara 00000-000, auto-lookup em 8 digitos, toast sucesso/erro, lookup no Portal

## Iteracao 16 (2026-04-21): Textos + Liebherr + Chat Mi
- Revisao de acentuacao em 14 arquivos (~250 palavras)
- "Autorizada Hisense" + remocao "sem compromisso" no VRF
- Marca Liebherr: card completo + AUTHORIZED_BRANDS
- Chat Mi (FAB azul sparkle): GPT-5.2 SSE, system prompt restritivo, persistencia MongoDB+localStorage, markdown, copiar, regenerar, parar, Enter/Shift+Enter

## Iteracao 17 (2026-04-22): Upload + STT + Feedback + Historico + Pre-agendamento + Persistencia
### 17a: Upload imagem + Mic STT + Feedback
- Backend: /api/chat/upload (5MB, jpg/png/webp), /api/chat/stt (Whisper-1 pt-BR, 10MB), /api/chat/feedback (up/down com session_id+context)
- Frontend MiChatWidget: botao paperclip + preview 56x56, botao mic com animacao pulse (MediaRecorder webm->STT->input),
  botoes 👍👎 no hover da mensagem assistant (1 voto por msg)
- ChatMessage agora suporta campo image (base64) enviado para GPT-5.2 como multimodal content
- Testado: upload 200, vision funcionando (identificou cor vermelha de imagem), feedback persistido, mic UI pronto

### 17b: Historico de conversas no portal
- Nova aba "Conversas" em /minha-conta com lista de sessoes (titulo + data + deletar) 
  e view de mensagens a direita (responsive: mobile shows ArrowLeft)
- Usa /api/chat/sessions (GET lista, GET/:id carrega, DELETE /:id)

### 17c: Pre-agendamento inline
- Backend: chat/stream emite evento type=suggest_schedule com extracao automatica de
  equipment (geladeira->geladeiras, split, vrf, etc) e brand (matching contra BRANDS)
  quando full_text contem 'ordem de servi' | 'visita tecnica' | 'agendar visita'
- Frontend: renderiza ScheduleCard inline (nao sobrepoe) com selects Equipamento/Marca/Servico/Garantia 
  + textarea defeito + botao "Criar OS"
  - Pre-preenche equipment/brand detectados
  - Logged in: POST /service-orders -> mostra OS-xxx card verde + mensagem assistente com link ao portal  
  - Nao logged in: card amarelo "Quase la!" com links para Entrar/Cadastrar
  - Rules: instalacao desabilitada (geladeiras, ar portatil, lava e seca, lavadoras), garantia 
    dentro bloqueada para marcas nao autorizadas
- Testado: geladeira Hisense -> card pre-preenchido -> OS-20260422-5319 criada, bubble verde + link portal

### 17d: Persistencia de login/perfil
- /auth/login e /auth/register agora retornam user COMPLETO (era bug: so retornava id/email/name/role)
- refresh_token max_age 7d -> 30d
- Todos os cookies com secure=True (HTTPS)
- lib/api.js: interceptor axios auto-refresh em 401 (exceto endpoints de auth), dedup de concurrent refresh
- Testado: cadastro -> perfil mostra todos os dados; logout -> login -> tudo restaurado; F5 -> sessao mantida

### Testing
- Testing agent iteration_11: 24/24 testes backend passaram

## Iteracao 21 (2026-04-23): CORS custom domain + Voz Mi natural + iPhone zoom fix

### 1. CORS para domínio custom `mastermaqassistencia.com`
- **Problema**: Frontend servido em `mastermaqassistencia.com` chamando backend em `eletro-master.emergent.host` → cross-origin com `withCredentials: true`. Backend estava respondendo `Access-Control-Allow-Origin: *` (pois `CORS_ORIGINS=*` forçava `allow_credentials=False`), navegador bloqueava.
- **Fix**: `backend/.env` `CORS_ORIGINS=https://mastermaqassistencia.com,https://www.mastermaqassistencia.com,https://eletro-master.emergent.host,https://eletro-master.preview.emergentagent.com,http://localhost:3000`
- **Cookies cross-site**: Todos os `set_cookie` em `server.py` migrados de `samesite="lax"` para `samesite="none"` (com `secure=True` mantido) — imprescindível para cookies httpOnly funcionarem entre domínios diferentes.
- Validação local: `curl` com `Origin: https://mastermaqassistencia.com` retorna `access-control-allow-origin: https://mastermaqassistencia.com` + `access-control-allow-credentials: true` ✅
- **Requer redeploy** para aplicar em produção.

### 2. Voz da Mi mais natural
- `POST /api/chat/tts`:
  - Modelo: `tts-1` → `tts-1-hd` (prosódia muito mais natural)
  - Voz padrão: `coral` → `nova` (pronúncia limpa em pt-BR, sem sotaque americano)
  - Nova função `_sanitize_tts_text`: remove markdown (**, _, ~, `, #, >, bullets), links, blocos de código, emojis/pictographs — a TTS não lê mais literal "asterisco" nem pausa em tokens estranhos.
  - Garante pontuação final para prosódia natural.
- Frontend `VoiceMode.js`: voice `coral` → `nova`.
- Teste: TTS retorna 195KB mp3 OK para texto de exemplo.

### 3. iPhone zoom fix
- `src/index.css`: media query mobile (<=768px) força `input, textarea, select { font-size: 16px !important; }` — iOS não dá mais zoom automático ao focar inputs do chat Mi ou qualquer formulário.

### Webhook de status externo (guia)
- Endpoint `POST /api/external/webhook/status` com `X-API-Key: mastermaq_ext_2024_secure`.
- Body: `{ os_number | external_os_number, status, technician?, scheduled_for?, notes?, event_type? }`
- Status aceitos: `Aguardando Análise A.T | Aberta Call-Center | Em Andamento | Concluído | Cancelado`
- Guia completo entregue em conversa para integração externa.

## Iteracao 22 (2026-04-24): Same-origin CORS + AuthGate + Webhook fire-and-forget + regras Bertazzoni/Lofra/Panasonic + PWA install

### 1. CORS/CSP: same-origin API calls
- `src/lib/api.js`: nova função `resolveBackendUrl()` — em qualquer host != localhost, usa `window.location.origin`. Frontend agora chama `mastermaqassistencia.com/api/*` (mesmo domínio) em vez de `eletro-master.emergent.host/api/*`. Isso elimina 100% o bloqueio CORS com `credentials: include`, independente de qual domínio o usuário acessar.
- `VoiceMode.js` e `MiChatWidget.js` agora importam `BACKEND_URL` do `lib/api`.

### 2. AuthGate: site fechado para visitantes não logados
- `App.js`: novo componente `AuthGate` que bloqueia acesso a todas as rotas, redirecionando para `/login`. Rotas públicas: `/login`, `/cadastro`, `/esqueci-senha`, `/vrf-hisense` (landing B2B).
- Nova rota `/vrf-hisense` adicionada ao router.

### 3. ScheduleCard do MI: paridade com SchedulingModal + novas regras
- Novo conjunto `WARRANTY_BLOCKED_BRANDS = {Bertazzoni, Lofra, Panasonic}` aplicado em ambos os modais (`SchedulingModal.js` + `MiChatWidget.js`). Essas marcas são autorizadas para serviço, mas não aceitam atendimento em garantia — opção "Dentro da garantia" fica bloqueada com tooltip explicativo.
- Combobox de marcas no chat Mi: agora só exibe marcas autorizadas (HQ, Franke, Hisense, Gorenje, Bertazzoni, Lofra, Panasonic, Liebherr). Demais marcas agrupadas sob a opção "Outras Marcas" que, ao ser selecionada, adota a primeira marca não-autorizada disponível e exibe hint informando que o atendimento será apenas fora da garantia.

### 4. Card VRF Hisense na seção "Atendimento Expresso"
- Removida imagem errada (unidade VRF) do card "Ar Condicionado Split" em `HomePage.js` e `ServicesPage.js`.
- Card "VRF Hisense" agora usa a mesma imagem `/images/vrf/vrf-hero-product.png` (Home + Services).

### 5. Botão "Instalar App" (PWA)
- Novo componente `InstallPWAButton.js` — captura evento `beforeinstallprompt`, mostra botão (variantes desktop/mobile) e esconde automaticamente após instalação (`appinstalled`) ou se já está rodando como PWA (standalone).
- Integrado no `Header.js` tanto no desktop quanto no mobile.
- Ícones PWA regenerados a partir do novo avatar Mi (menina com multímetro): 192/512/maskable + apple-touch 180 + favicon 32. Service Worker version bump `mm-v5 → mm-v6` força refresh do cache em produção após redeploy.

### 6. Webhook status + fire-and-forget OS
- Backend: nova função `_sync_order_to_external()` como background task. `POST /api/service-orders` agora retorna imediatamente a OS criada localmente e o push para a API externa (Mastermaq Systems) é feito via `BackgroundTasks`, não bloqueando a resposta.
- `PortalPage.js`: polling automático de `/service-orders` a cada 30s (apenas quando aba está visível) + refetch em `visibilitychange`. Status enviados pelo webhook externo agora refletem no portal do cliente sem F5.
- Validação E2E: criar OS (instantâneo) → `POST /external/webhook/status` com novo status → listagem de OS retorna status atualizado.

### Tests
- Backend curl E2E: login 200, POST OS retorna OS-... em <1s, webhook /external/webhook/status retorna matched+modified=1, GET /service-orders lista com status atualizado.
- Frontend Playwright: visitante anônimo redirecionado pra /login ✅, card VRF com imagem, Split sem imagem ✅.

## Credenciais: admin@mastermaq.com / mastermaq@2026

## Backlog P2 (baixa prioridade)
- SEO/Schema.org local BH/MG
- GSAP ScrollTrigger
- Password reset flow
- Dashboard analytics
- Integracao real email/WhatsApp para envio de OS (SendGrid/Twilio)
- Painel admin para gerenciar OS/blog no frontend
- Botao dentro do chat para abrir com o contexto pre-populado vindo de outras paginas

## Iteracao 18 (2026-04-22): Integracao API externa + Validacoes + UX Mobile + Avatar Mi
### Integracao externa Mastermaq Systems
- Backend /api/service-orders faz POST para EXTERNAL_OS_API_URL com X-API-Key
- Payload: customer_name, phone1, address, number, neighborhood, city, state, cep, email, 
  product (nome do equipamento), brand, model, serial_number, reported_defect, observations, 
  service_type mapeado (Conserto/Orcamento/Instalacao/Manutencao)
- Guarda external_os_number, external_status, external_sync_ok, external_sync_error no doc local
- Nao falha criacao local se externo estiver down (graceful fallback)
- NOTA: Endpoint externo atualmente retornando 404 - integracao pronta, aguardando API remota responder

### Validacoes obrigatorias (modal + chat Mi)
- Modelo, Defeito, Tipo de servico, Garantia: obrigatorios
- Numero de serie: obrigatorio SO QUANDO dentro_garantia
- Modal: instalacao agora tambem passa pelo form (mesmo padrao)
- Toasts explicativos para cada validacao
- Chat Mi ScheduleCard: mesma regra

### Tooltips explicativos (TooltipProvider do Shadcn)
- Icone Info (?) ao lado de Modelo e Numero de Serie no modal
- Desktop: hover | Mobile: tap
- Explica o que e e onde encontrar (variacao por tipo de produto)

### Conteudo VRF
- Removido "500+ Projetos VRF" do stats (agora 3 colunas: Anos/Pecas/Suporte)
- Ar-Condicionado Split agora usa /images/vrf/vrf-hero-product.png

### UX Mobile (nao altera desktop)
- Nova componente DragScroller: drag + swipe nativo, scroll-behavior smooth, scrollbar hidden
- Brand bar: Marquee -> DragScroller com duplicacao de logos
- Testimonials: grid mantido em sm+; carrossel horizontal (85vw cards) em <sm com hint "arraste"
- Diferenciais: chips em sm+; grid 3-cols x 2-rows (6 cards) em <sm
- VRF CTA "Receba um projeto personalizado": flex-col no <sm, telefone quebra em linha nova com whitespace-nowrap

### Avatar oficial Mi (imagem enviada pelo usuario)
- /images/assets/mi-avatar.webp (56KB)
- FAB: circular (rounded-full) com img object-cover + scale hover
- Header do chat: avatar 9x9 com border branco
- Card de pre-agendamento: avatar 7x7
- Remocao do icone Sparkles em todos esses pontos (mantido no welcome message se aplicavel)

## Iteracao 19 (2026-04-23): Auto-scroll + VoiceMode + IntersectionObserver + Prompt agendamento por data

### Feature 1: Brand carousel auto-scroll + manual interaction
- DragScroller agora suporta autoScroll com RAF, loop seamless (conteudo duplicado), 
  autoScrollSpeed configuravel, resumeDelay para retomar apos interacao
- Pausa em: mousedown/touchstart, wheel, hover. Retoma apos 2.5s sem interacao
- Teste E2E: auto-scroll 188->279, hover pausa 282->282, retoma 323->396 OK

### Feature 2: Prompt Mi para agendamento por data
- MI_SYSTEM_PROMPT item 5 adicionado: quando user pede data especifica, Mi sempre diz que
  equipe vai verificar disponibilidade dos tecnicos + organizar roteiro logistico,
  atendimento pode variar por localizacao e agenda, contato para confirmar.
  Em linguagem natural ("Anotei sua preferencia..."), nunca prometendo data garantida.

### Feature 3: Voice Mode (ChatGPT Voice-like)
- Backend: POST /api/chat/tts (tts-1, voice=coral feminina/delicada, mp3)
- Frontend: VoiceMode.js overlay dentro do modal chat
- VAD nativo via Web Audio API AnalyserNode + RMS (nao depende de libs externas):
  - Listening: RMS > 0.018 inicia captura; silencio > 850ms termina turno
  - MIN_SPEECH_MS=400 (ignora blips), BARGE_IN_MIN_MS=250
- Pipeline: MediaRecorder -> STT (/chat/stt) -> LLM stream (/chat/stream) -> TTS (/chat/tts) -> Audio play
- Barge-in: se usuario fala durante TTS, aborta audio + stream e reinicia captura
- UI: orb animado com scale baseado em level, avatar Mi central, transcricao user/Mi, estados
  "Ouvindo/Processando/Respondendo", barra de nivel
- Transcript final e adicionado ao chat log do texto (sincronizado)

### Feature 4: Brand logos color-on-scroll
- Componente BrandLogoItem.js usa IntersectionObserver
- Quando logo entra no viewport (threshold 0.55, rootMargin -10% lateral),
  remove grayscale/opacity com transition 500ms
- Nao depende mais de clique/hover para colorir
- Teste: 6 logos ativas simultaneamente no viewport desktop

### Tests
- Playwright E2E: auto-scroll, pause/resume, IntersectionObserver color, voice button+overlay - todos PASS
- Backend TTS: curl retornou mp3 20KB valido

## Iteracao 20 (2026-04-23): Color-on-scroll + botao voz + pre-OS proativa + URL externa + avatar mobile + PWA + webhooks

### Color-on-scroll (ao inves de sempre colorido)
- Brand bar top: grayscale por default; colore no hover OU durante user-scroll (drag/wheel)
  DragScroller seta data-user-scrolling=1 por 1.2s apos interacao; BrandLogoItem observa via MutationObserver + IntersectionObserver
- Servico Autorizado: mesmos padrao em auth-cards-scroll (CSS: [data-user-scrolling] filter: grayscale(0))

### Botao voz (substituindo mic+waves)
- Removido Waves do header do chat + Mic do input row + STT button "mi-mic"
- Adicionado botao circular azul com VoiceBarsIcon (SVG animado: 5 barras verticais brancas)
  data-testid="mi-voice-btn" ao lado do paperclip — abre direto o VoiceMode
- Removidas states recording/transcribing e funcoes start/stopRecording

### Pre-OS proativa
- Backend /chat/stream: detecta tambem problem_keywords (nao liga, nao gela, parou, vazando, ruido, defeito...) alem de intent_keywords
- Evento suggest_schedule agora inclui defect_hint (ultima msg user) e flag proactive
- Frontend ScheduleCard mostra titulo "Vamos abrir a OS?" + texto explicativo quando proactive=true
  e ja preenche textarea Defeito com o hint

### URL externa atualizada (PRODUCAO)
- EXTERNAL_OS_API_URL = https://mastermaq-systems.emergent.host/api/external/service-orders
- Integracao funcionando 100% — teste real criou EXT-2604230122AEDE
- Status inicial local: "Aguardando Analise A.T" (em vez de aguardando_confirmacao)
- Frontend StatusBadge mapeia ambos ("Aguardando Analise A.T" / "Aberta Call-Center" / "Em Andamento" / "Concluido" / "Cancelado") + legacy

### Avatar mobile no header
- Header.js: md:hidden mostra botao circular com inicial do nome (ou User icon se nao logado)
  ao lado do botao burger. Clicar leva a /minha-conta (ou /login)
- testid: mobile-avatar-btn | mobile-login-btn

### PWA completo (instalavel + offline + auto-update)
- /public/manifest.json: nome, display=standalone, theme_color=#2563eb, icons 192/512 + maskable
- /public/sw.js: VERSION-based cache, Network-First para docs, SWR para assets, bypass /api/*
  skipWaiting + clients.claim + controllerchange reload (uma vez)
- /src/lib/registerServiceWorker.js: registro com auto-update a cada 30min + on visibilitychange
- index.html: manifest link, apple-touch-icon, mobile-web-app-capable=yes, theme-color=#2563eb
- Icones PWA: gerados do Mi avatar (192, 512, maskable 192/512, apple-touch 180)
  Background #2563eb (azul) para maskable safe-zone

### Webhooks para status externo
- POST /api/external/webhook/status (auth via X-API-Key)
  Body: {os_number OU external_os_number, status, technician, scheduled_for, notes, event_type}
  Atualiza a OS + grava em service_order_events
- GET /api/service-orders/{os}/events (auth JWT dono/admin) — polling fallback
  Retorna current_status + lista de eventos

### Teste E2E
- External sync OK: EXT-... recebido | Webhook matched+modified=1 | Polling retorna eventos ordenados
- SW ativo: navigator.serviceWorker.getRegistrations() retorna ativo com scope /
- Mobile avatar detectado | Voice btn (novo) detectado | Waves/Mic antigos removidos
