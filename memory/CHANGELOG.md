# CHANGELOG — Mastermaq

## 2026-06-30 (later)
### Hero
- Imagem de fundo da hero substituída pela arte enviada (FIFA Copa do Mundo
  2026 — estádio + troféu). **Aviso jurídico registrado**: marca FIFA é
  protegida; uso comercial não-licenciado pode gerar notificação extrajudicial.
  Backup do fundo original salvo em `/app/frontend/public/images/hero-bg-original.png`.
- Exposição da imagem aumentada: opacity `0.06` → `0.18`.

### Lava Louças
- Adicionadas 13 imagens de marcas em `/app/frontend/public/images/lava-loucas/`:
  Bertazzoni, Brastemp, Consul, Electrolux, Franke, Gorenje, Hisense, HQ, LG,
  Panasonic, Samsung, Tecno, Viking.
- `HomePage.js`: Lava Louças agora tem `hasImage: true` no grid principal e
  galeria completa em `PRODUCT_CATEGORIES`.
- `ServicesPage.js`: card e página de detalhe agora exibem imagem real e
  carousel de marcas atendidas.

### Modal de OS — Outras marcas (free text)
- `SchedulingModal.js`: novo botão "**Outras marcas**" (tracejado) no grid
  de marcas. Ao clicar, abre input livre onde o cliente digita o nome da
  marca (ex.: Fischer, Continental, Esmaltec…). Validação: ≥2 caracteres.
- `MiChatWidget.js` (Mi): dropdown "Outras Marcas" agora abre input de
  texto livre (antes selecionava automaticamente a primeira marca não-autorizada).
- Marcas custom não recebem opção de garantia (regra de negócio existente:
  apenas marcas autorizadas têm warranty).
- E2E testado: OS criada com `brand="Fischer"` sincronizou no sistema
  externo (recebeu `external_os_number=27723`).

### PWA
- Service Worker bumped: `mm-v10` → `mm-v12`.

---

## 2026-06-30
### Novas categorias de serviços
Adicionadas 6 novas categorias (Lava Louças, Forno Elétrico, Microondas,
Frigobar, Máquina de Gelo, Cervejeira) — front + back + endpoint
`/api/equipment/types`. Detalhes na versão anterior.

---

## 2026-05-19
### UX / Portal
- OS card "Minha Conta" exibe `external_os_number` quando disponível.
- SchedulingModal faz polling de `/api/service-orders/{os}` até receber o
  número externo.
- Mi Chatbot atualizado para usar `external_os_number`.

### Backend
- Fix P0 webhook: lookup por `os_number` OU `external_os_number` (via `$or`).

### Assets
- Substituídas imagens com remoção de fundo defeituosa.
