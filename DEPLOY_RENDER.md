# Deploy Mastermaq no Render — Guia Completo

## Passo 1: Criar MongoDB Atlas (Gratuito)

1. Acesse https://cloud.mongodb.com
2. Crie uma conta gratuita (ou faca login)
3. Clique em **"Build a Database"**
4. Selecione **M0 (Free)** — Shared Cluster
5. Regiao: **AWS Sao Paulo (sa-east-1)** ou a mais proxima
6. Nome do cluster: `mastermaq`
7. Clique **"Create Cluster"**

### Configurar acesso:
8. Em **Database Access**, crie um usuario:
   - Username: `mastermaq_user`
   - Password: (anote a senha, ex: `SuaSenhaForte123!`)
   - Permissao: **Read and write to any database**

9. Em **Network Access**, adicione:
   - IP: `0.0.0.0/0` (permite acesso de qualquer IP — necessario para Render)

10. Em **Databases > Connect > Drivers**, copie a connection string:
    ```
    mongodb+srv://mastermaq_user:SuaSenhaForte123@mastermaq.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```

---

## Passo 2: Deploy do Backend (Web Service)

1. No Render (https://dashboard.render.com), clique **"New" > "Web Service"**
2. Conecte ao repositorio GitHub: `felp0946-stack/mastermaq-site`
3. Configure:
   - **Name:** `mastermaq-api`
   - **Region:** Oregon (US West) ou mais proxima
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. Em **Environment Variables**, adicione:
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | `mongodb+srv://mastermaq_user:SUASENHA@mastermaq.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
   | `DB_NAME` | `mastermaq_db` |
   | `JWT_SECRET` | (gere uma string aleatoria segura, ex: `mq-jwt-prod-2026-abc123xyz`) |
   | `CORS_ORIGINS` | `https://mastermaq-frontend.onrender.com,https://mastermaqassistencia.com.br` |
   | `PYTHON_VERSION` | `3.11.11` |

5. Clique **"Create Web Service"**
6. Aguarde o build e anote a URL do backend, ex: `https://mastermaq-api.onrender.com`

---

## Passo 3: Deploy do Frontend (Static Site)

1. No Render, clique **"New" > "Static Site"**
2. Conecte ao mesmo repositorio
3. Configure:
   - **Name:** `mastermaq-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn install && yarn build`
   - **Publish Directory:** `build`

4. Em **Environment Variables**, adicione:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://mastermaq-api.onrender.com` |

5. Em **Redirects/Rewrites** (para SPA routing):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**

6. Clique **"Create Static Site"**

---

## Passo 4: Configurar Dominio Personalizado (Opcional)

Se quiser usar `mastermaqassistencia.com.br`:

1. No Render, va ao servico frontend
2. Clique em **Settings > Custom Domains**
3. Adicione: `mastermaqassistencia.com.br`
4. No seu provedor de dominio, configure:
   - **CNAME:** `mastermaq-frontend.onrender.com`
5. Atualize o `CORS_ORIGINS` no backend para incluir o novo dominio

---

## Passo 5: Verificar

1. Acesse a URL do backend: `https://mastermaq-api.onrender.com/api/equipment/types`
   - Deve retornar JSON com 9 tipos de equipamentos
2. Acesse a URL do frontend: `https://mastermaq-frontend.onrender.com`
   - Deve carregar o site completo
3. Teste login: admin@mastermaq.com / mastermaq@2026

---

## Notas Importantes

- **Plano gratuito do Render:** O backend "dorme" apos 15min de inatividade. A primeira requisicao pode demorar ~30s para "acordar".
- **Para evitar isso:** Upgrade para o plano Starter ($7/mes) ou use um servico de ping (UptimeRobot) para manter o backend ativo.
- **MongoDB Atlas M0** e gratuito com 512MB de storage, suficiente para comecar.
- **JWT_SECRET** deve ser diferente do desenvolvimento. Use algo longo e aleatorio.
