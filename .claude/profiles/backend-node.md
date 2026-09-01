# Perfil de stack: Backend / API (Node)

Use este perfil para serviços, APIs e automações sem interface visual.

## Stack
- **Runtime:** Node + TypeScript
- **Framework HTTP:** Fastify (ou Express; ou NestJS para projetos maiores)
- **Banco:** PostgreSQL via Prisma (ORM + migrações)
- **Validação:** Zod
- **Testes:** Vitest + Supertest
- **Gerenciador de pacotes:** pnpm

## Comandos
- Instalar: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Testes: `pnpm test`
- Migrações: `pnpm prisma migrate dev`

## Verificação (sem o usuário ler código)
- Rode a **suíte de testes** e mostre-a verde.
- Para endpoints, inclua no PR um **exemplo real de request → response** (curl/HTTPie) provando o comportamento.

## Deploy nos trilhos
- **Railway** ou **Render** (deploy a partir do repositório, com Postgres gerenciado e variáveis de ambiente pela UI). Fly.io como alternativa.
