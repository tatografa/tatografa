# Reps Club

Plataforma onde personal trainers montam treinos e alunos executam esses treinos
na academia, registrando carga e repetições série por série.

Duas interfaces num só projeto Next.js: **app do aluno** (web mobile-first, PWA)
e **painel do personal** (web desktop). Interface toda em português do Brasil.

A fonte de verdade do produto é o pacote de handoff (`01-produto-e-decisoes.md`
a `08-piloto-e-gtm.md`). Este README cobre só como rodar e como o código está
organizado.

---

## Estado: fase 0 concluída

O que existe hoje:

- Projeto Next.js 16 (App Router) + TypeScript + Tailwind v4.
- Tokens de design do doc 04 configurados como tokens semânticos.
- Schema do Supabase com as 10 tabelas da fase 0 e RLS em todas.
- Catálogo com 117 exercícios carregado em `exercises_catalog`.
- Cadastro e login do personal por e-mail e senha, com `/painel` protegido.
- Componentes base: `Button`, `Input`, `Card`, `Badge`.

O que **não** existe ainda (fase 1 em diante): convite de aluno, montagem de
treino, execução, histórico, app do aluno, feed, reavaliação, agenda.

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com o projeto Supabase
npm run dev                  # http://localhost:3000
```

### Variáveis do projeto de desenvolvimento

Projeto Supabase `reps-club-dev`, região `sa-east-1` (São Paulo). A chave
publicável é feita para viver no navegador — não é segredo.

```
NEXT_PUBLIC_SUPABASE_URL=https://ygrlqrrguwhqqufcdbyb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xz-zWCmNMBeCd2fFWSembw_wBKg7-G7
```

### Confirmação de e-mail no desenvolvimento

Por padrão o Supabase exige confirmar o e-mail antes do primeiro login, e o
SMTP embutido é limitado (poucos envios por hora). Para testar sem esperar
e-mail, desligue em **Authentication → Sign In / Providers → Email → Confirm
email** no painel do Supabase do projeto de desenvolvimento.

Com a confirmação desligada, `/cadastro` já devolve sessão e cai direto no
`/painel`. Com ela ligada, o cadastro mostra a tela "Confirme seu e-mail" e o
link do e-mail chega em `/auth/confirmar`. Os dois caminhos funcionam.

Em produção a confirmação fica **ligada**, com SMTP próprio (fase 4).

### Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

---

## Estrutura

```
app/
  (marketing)/         landing pública (placeholder até a fase 4)
  (auth)/              cadastro, login e recuperação de senha do personal
  (personal)/painel/   painel do personal (desktop)
  auth/confirmar/      chegada dos links enviados por e-mail
components/
  ui/                  design system: Button, Input, Card, Badge
lib/
  supabase/            clientes de navegador, servidor e proxy
  auth/                sessão, ações e tradução de erros
  queries/             acesso a dados tipado (vazio até a fase 1)
  domain/              regras de negócio puras (vazio até a fase 2)
supabase/migrations/   schema versionado, aplicado em ordem
types/database.ts      tipos gerados do schema — não editar à mão
proxy.ts               renova a sessão e desvia quem não está logado
```

Regra: **regra de negócio mora em `lib/domain/`, não em componente.** Cálculo
de recorde pessoal, volume, sequência de dias — função pura, testável sem banco.

---

## Autenticação

**Personal:** e-mail e senha. Ao criar conta, um gatilho no banco cria a linha
em `trainers` (migration `0003`). O gatilho olha `role: "personal"` nos
metadados do usuário — é o que separa personal de aluno na mesma tabela de auth.

**Aluno:** link mágico (fase 1). O convite leva a `/convite/[token]`.

Duas camadas, com papéis distintos:

| Camada | Arquivo | O que faz |
|---|---|---|
| Otimista | `proxy.ts` | Renova a sessão e desvia quem não está logado antes de renderizar |
| Autoritativa | `lib/auth/session.ts` | Confirma a linha em `trainers`. É aqui que a permissão é decidida |

O proxy nunca decide permissão. A checagem que vale é a existência da linha em
`trainers`, não um campo de metadado — metadado o próprio usuário edita.

---

## Banco e regras de acesso

Migrations em `supabase/migrations/`, aplicadas em ordem numérica.

| Migration | O que faz |
|---|---|
| `0001_schema_inicial` | Enums, 10 tabelas, índices |
| `0002_rls` | RLS em todas as tabelas + funções auxiliares |
| `0003_trigger_novo_personal` | Cria a linha em `trainers` no cadastro |
| `0004_catalogo_exercicios` | Carrega os 117 exercícios (idempotente) |
| `0005_helpers_em_schema_privado` | Tira os helpers de RLS da API pública |

A regra que não pode falhar: **nunca um aluno vê dado de aluno de outro
personal, nem um personal vê aluno que não é dele.** Verificado com três
usuários simulados (dois personais e uma aluna) antes de fechar a fase 0.

Os helpers de travessia (`can_read_workout`, `trainer_of`, …) vivem no schema
`private`, que o PostgREST não publica. Se algum for movido para `public`, ele
vira endpoint RPC — não faça isso.

Para regerar os tipos depois de uma migration:

```bash
npx supabase gen types typescript --project-id <ref> > types/database.ts
```

---

## Decisões técnicas registradas

| Assunto | Escolha | Porquê |
|---|---|---|
| Tipografia | Inter em toda a UI, JetBrains Mono nos papéis mono | Decisão do Otávio; o doc 04 deixava em aberto |
| Login social | Fora da v1 | Escopo dos docs 01 e 07; entra depois sem retrabalho |
| Tailwind | v4, tokens em `@theme` | Sem `tailwind.config`; tokens ficam junto do CSS |
| Estado no servidor | Server Components + Server Actions | Sem biblioteca de dados até a execução do treino pedir (fase 1) |
| Validação | zod nas Server Actions, `noValidate` no form | A validação nativa do navegador fala o idioma do navegador |
| Cliente Supabase | `@supabase/ssr` com cookies | Sessão validada no servidor a cada requisição |
| Middleware | `proxy.ts` | Next 16 renomeou `middleware` para `proxy` |
| Projeto de produção | Ainda não criado | Criar junto com o primeiro deploy, para não ocupar slot à toa |
