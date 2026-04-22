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

## Credenciais: admin@mastermaq.com / mastermaq@2026

## Backlog P2 (baixa prioridade)
- SEO/Schema.org local BH/MG
- GSAP ScrollTrigger
- Password reset flow
- Dashboard analytics
- Integracao real email/WhatsApp para envio de OS (SendGrid/Twilio)
- Painel admin para gerenciar OS/blog no frontend
- Botao dentro do chat para abrir com o contexto pre-populado vindo de outras paginas
