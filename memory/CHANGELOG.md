# CHANGELOG — Mastermaq

## 2026-05-19
### UX / Portal
- **OS card "Minha Conta"**: agora exibe o número da OS do sistema externo
  (ex.: `27676`) substituindo o número interno (`OS-2026...`) sempre que a
  sincronização externa já foi concluída. Fallback automático para o número
  interno enquanto o push externo estiver pendente.
- **Tela de confirmação no SchedulingModal**: passa a fazer polling do
  endpoint `/api/service-orders/{os}` por até ~20s (10x a cada 2s) para
  capturar o `external_os_number` retornado pela API externa em background
  e atualizar a tela em tempo real.
- **Mi Chatbot**: bolha de sucesso agora também usa o `external_os_number`
  quando disponível ao criar OS.

### Backend
- **Fix P0 webhook**: `POST /api/external/webhook/status` agora resolve a OS
  procurando o ID em ambos `os_number` E `external_os_number` (via `$or`),
  aceitando o ID externo (ex.: `27677`) enviado em qualquer um dos dois
  campos do payload.

### Assets
- Substituídas as imagens com remoção de fundo defeituosa:
  - `coifas/franke.png`
  - `lava-e-seca/{brastemp, hisense, lg}.png`
  - `lavadoras/{electrolux, gorenje, lg}.png`
- PWA `sw.js` versão bumped: `mm-v8` → `mm-v9` (force cache invalidation).
