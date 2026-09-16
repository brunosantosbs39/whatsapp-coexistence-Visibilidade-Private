# WhatsApp Coexistence — Vercel

Backend preparado para o fluxo WhatsApp Business App + Cloud API (Coexistence).

## Deploy

O projeto usa Express e Node 24.x, compatível com o deploy zero-config do Vercel.

1. Envie estes arquivos para um repositório GitHub.
2. No Vercel, importe o repositório.
3. Em **Project Settings → Environment Variables**, configure:
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_ACCESS_TOKEN`
   - `GRAPH_API_VERSION=v25.0`
4. Faça um novo deploy.
5. Teste `https://SEU-PROJETO.vercel.app/health`.

## Webhook

Callback:
`https://SEU-PROJETO.vercel.app/webhook/whatsapp`

O token usado no Meta Developers precisa ser exatamente o mesmo valor de
`WHATSAPP_VERIFY_TOKEN`.

## Importante

Este backend não realiza sozinho o Embedded Signup. A conexão do número
com o Meta/WhatsApp acontece pelo fluxo oficial de Embedded Signup/Coexistence,
que exige interação do administrador da conta.

Nunca coloque access tokens no código, no GitHub ou no corpo das requisições.
O backend usa `WHATSAPP_ACCESS_TOKEN` exclusivamente como variável de ambiente.

## Endpoints

- `GET /health`
- `GET /webhook/whatsapp`
- `POST /webhook/whatsapp`
- `POST /send-text`
- `POST /sync`
