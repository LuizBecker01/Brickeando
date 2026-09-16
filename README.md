# Brickeando

Marketplace de compra e venda com anúncios, chat e autenticação local/Google.

**Tecnologias:** Node.js, TypeScript, Express, Prisma, PostgreSQL, React, Vite e Axios.

## Requisitos

- Node.js 18+
- npm
- Acesso ao banco PostgreSQL compartilhado do projeto

## Configuração

O projeto já possui um banco compartilhado. Peça a `DATABASE_URL` ao responsável e crie `backend/.env`:

Não crie outro banco e não publique o arquivo `.env`.

Para ativar o mapa e a busca por área, crie também `frontend/.env`:

```env
VITE_GOOGLE_MAPS_API_KEY="sua-chave-do-Google-Maps"
```

Essa chave deve ter a Maps JavaScript API habilitada no Google Cloud. Sem ela, cadastro, categorias e os demais filtros continuam funcionando, mas o mapa não será exibido.

## Instalação e execução

No primeiro terminal:

```powershell
cd D:\Codes\Brickeando\backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

No segundo terminal:

```powershell
cd D:\Codes\Brickeando\frontend
npm install
npm run dev
```

API: `http://localhost:777`
Frontend: URL exibida pelo Vite, normalmente `http://localhost:5173`.

## Testes e build

```powershell
cd backend
npm test
npm run build

cd ..\frontend
npm run build
```

## Deploy no Render

O arquivo `render.yaml` configura dois serviços no Render:

- `brickeando-api`: Web Service Node.js com build TypeScript, Prisma Client e migrações antes da inicialização.
- `brickeando-web`: Static Site servido a partir de `frontend/dist`.

Na criação do Blueprint, informe as variáveis marcadas como `sync: false` no painel do Render. A API precisa de uma `DATABASE_URL` apontando para o PostgreSQL compartilhado, além de `JWT_SECRET` e `GOOGLE_CLIENT_ID`. No frontend, defina `VITE_API_URL` com a URL pública da API terminada em `/api` e configure as chaves do Google quando esses recursos forem usados.

O backend deve ser publicado como Web Service, e não como função serverless, porque o chat usa Socket.IO e mantém conexões WebSocket. Depois do deploy da API, use sua URL pública no `VITE_API_URL` do Static Site e faça um novo deploy do frontend.

## Autenticação

- Senha com 8+ caracteres, maiúscula, minúscula, número e caractere especial.
- Senhas protegidas com bcrypt e tokens JWT válidos por 1 dia.
- Criar, editar e excluir produtos exige autenticação.
- Editar e excluir exige ser o proprietário do produto.

## Rotas principais

| Método    | Rota                                      | Proteção           |
| --------- | ----------------------------------------- | ------------------ |
| GET       | `/api/products` e `/api/products/:id`     | Pública            |
| POST      | `/api/users/register`, `/api/users/login` | Pública            |
| POST      | `/api/users/google`                       | Pública            |
| GET       | `/api/users/me`                           | JWT                |
| POST      | `/api/products`                           | JWT                |
| PUT/PATCH | `/api/products/:id`                       | JWT + proprietário |
| DELETE    | `/api/products/:id`                       | JWT + proprietário |
