@AGENTS.md

# Reps Club

> CLAUDE.md do produto, no formato do Maverick Solo Builder (`.claude/metodo/`).
> Curto de propósito: é lido em toda sessão e em todo card. Estratégia longa vive
> em `docs/` e só é lida quando um card apontar para ela.

## Visão

Plataforma onde **personal trainers montam treinos** e **alunos executam na academia**,
registrando carga e repetições série por série. O valor está no histórico: o aluno vê a
própria evolução por exercício, o personal vê o que o aluno de fato fez.

Dois produtos, um sistema, um projeto Next.js:

| Papel | Interface | Contexto de uso |
|---|---|---|
| Aluno | Web mobile-first (PWA) | Celular, na academia, entre séries, internet ruim |
| Personal | Web desktop | Computador, sentado, montando treinos |

Interface inteira em **português do Brasil**.

## Git e ambientes

- **Repositório:** `github.com/tatografa/tatografa`
- **Branch de trabalho atual:** `claude/reps-club-fase-0-aebdup`.
  _Desvio consciente da lei 1 do método:_ as sessões deste projeto são abertas com uma
  branch designada pelo harness. Enquanto isso valer, ela faz o papel da branch de
  milestone. Não trocar de branch sem o Otávio pedir.
- **Preview/homologação:** ainda não há Vercel conectada. Validação hoje é local
  (`npm run dev`) mais evidência no commit.
- **Produção:** ainda não publicada.

## Stack

Perfil: `web-nextjs` (`.claude/profiles/web-nextjs.md`), com três desvios deliberados —
o perfil descreve o caminho padrão, e mudar isso agora seria reescrever a Fase 0 sem
ganho de produto:

| Perfil diz | Aqui é | Motivo |
|---|---|---|
| pnpm | **npm** | Projeto nasceu com npm; trocar não entrega nada ao usuário |
| shadcn/ui | **Componentes próprios** em `components/ui/` | Doc 04 define um design system próprio; shadcn traria outro |
| Tokens DTCG + Style Dictionary | **Tailwind v4 `@theme`** em `app/globals.css` | Alvo único (web); build de tokens multiplataforma é peso sem uso |

- **Framework:** Next.js 16 (App Router) + TypeScript. **Não é o Next que você conhece** —
  `proxy.ts` no lugar de `middleware.ts`, APIs de request assíncronas. Ler
  `node_modules/next/dist/docs/` antes de escrever código.
- **Banco e auth:** Supabase (Postgres + Auth + Storage), RLS em todas as tabelas.
- **Estilo:** Tailwind CSS v4.
- **Validação:** zod v4 (a API de mensagem mudou: `error`, não `errorMap`).
- **Ícones:** lucide-react.

## Milestones

Fatias verticais do `docs/plan/milestones.md`. Todo milestone é validável pelo Otávio.

| # | Fase | Entrega | Status |
|---|---|---|---|
| M0 | Fase 0 · Fundação | Conta de personal, login, `/painel` protegido | validado |
| M1 | Fase 1 · Fatia vertical | Convite → treino → execução → histórico | em andamento |
| M2 | Fase 2 · Utilidade contínua | Macrotreino, PRs, progresso, painel completo | planejado |
| M3 | Fase 3 · Social e reavaliação | Feed, fotos, reavaliação física | planejado (cortável) |
| M4 | Fase 4 · Pronto para o piloto | PWA, estados vazios/erro, e-mails, termos | planejado |

## Design System

**Fonte de verdade do design.** Nada de cor ou espaçamento mágico — tudo sai dos tokens.
Hex solto em componente reprova na revisão.

- **Tokens:** `app/globals.css`, bloco `@theme`. Marca, tema claro, tema escuro
  (execução do treino), semânticas, tipografia, raios, sombras.
- **Componentes base:** `components/ui/` — Button, Input, Card, Badge, Dialog,
  EscolhaCards. Exportados por `components/ui/index.ts`.
- **Utilitário `eyebrow`:** label mono maiúsculo, definido em `globals.css`.
- **Tipografia:** Inter na interface toda; JetBrains Mono só em eyebrow, label, badge e timer.
- **Referência visual:** os `.dc.html` do handoff são referência, não código. Reconstruir
  em React, nunca copiar o HTML.

## Convenções de código

- **Regra de negócio fica em `lib/domain/`**, como função pura, testável sem banco.
  Cálculo de PR, volume, streak, semana do macrotreino, duração estimada.
- **Acesso a dado fica em `lib/queries/`**, tipado, com `import "server-only"`.
- **Nada de N+1.** Buscar em lote e agrupar em memória, mesmo com poucos registros.
- **Autorização de verdade mora no layout** (`requireTrainer()`, `requireStudent()`),
  não no `proxy.ts` — o proxy é otimista, só evita render à toa.
- **Nunca confiar em metadado de usuário para papel.** Metadado é editável pelo próprio
  usuário; a checagem é a existência da linha em `trainers` / `students`.
- **Helper de RLS vive no schema `private`.** O PostgREST publica como RPC toda função de
  `public`; helper de autorização exposto é superfície de ataque sem ganho.
- **Server Action valida com zod** e devolve `errosPorCampo` para o formulário. Todo
  formulário leva `noValidate` — a validação nativa do navegador aparece em inglês.
- **Comentário explica o porquê, não o quê.** Em português.
- **Segredo nunca vai ao git.** `.env.local` é ignorado; `.env.example` é o template.

## Memória e handoffs

- **Aprendizados:** `docs/LEARNINGS.md` — ler antes de codar; curar ao fim do milestone.
- **Handoffs:** `docs/handoffs/<feature>.md` — contrato de dado que a tela consome.

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build
```

Migrations em `supabase/migrations/`, aplicadas pelo MCP do Supabase. Depois de mudar o
schema, regerar `types/database.ts`.

## Verificação

Provar que funciona sem o Otávio ler código:

1. `npm run typecheck && npm run lint && npm run build` — os três limpos.
2. Lógica de banco (RLS, gatilho, constraint) testada por SQL, incluindo os casos de burla.
3. Interface conferida no navegador, com screenshot dos estados: vazio, erro, carregando, sucesso.
4. **Limite conhecido deste ambiente remoto:** o host do Supabase é bloqueado pela política
   de rede (403 no CONNECT). Fluxo que depende de sessão real só é validável na máquina do
   Otávio. Interface que precisa de dado se confere com props fixas numa rota descartável.

## Cards

`docs/cards/` · milestones em `docs/plan/milestones.md` · brief por milestone em
`docs/plan/<milestone>-brief.md`. Etiquetas: `junior`, `pleno`, `senior`.

## Decisões de arquitetura

- **[2026-08-23]** Um projeto Next.js serve as duas interfaces, com route groups
  `(marketing)`, `(auth)`, `(personal)`, `(aluno)`. Não são dois apps.
- **[2026-08-23]** Linha de `trainers` criada por gatilho no banco, não pelo cliente: com
  confirmação de e-mail ligada o `signUp` não devolve sessão, e um insert do cliente
  esbarraria no RLS.
- **[2026-08-31]** Convite do aluno chega por **link copiável** (WhatsApp), não por e-mail:
  o plano gratuito do Supabase limita a ~2 e-mails/hora, o que inviabiliza o piloto.
  Envio por e-mail entra na Fase 4, junto com os demais transacionais.
- **[2026-08-31]** Leitura do convite sem sessão usa a função estreita
  `convite_por_token`, não a chave de serviço: a chave ignoraria o RLS do banco inteiro
  se vazasse do ambiente.
- **[2026-09-01]** Policy de escrita confere o **relacionamento**, não só o dono da linha.
  `mesocycles_write` exigia apenas `trainer_id = auth.uid()`, e isso deixava um personal
  qualquer criar macrotreino para aluno alheio — e empurrar treino que o aluno via.
  Migration `0007` acrescentou `private.trainer_of(student_id)`.
- **[2026-09-01]** No M1, o macrotreino é **nomeado pelo personal** ao salvar o primeiro
  treino do aluno (nome + total de semanas); os treinos seguintes reusam o programa
  `ativo`. Nada é inventado pelo sistema. O M2 substitui por gestão de macrotreino.
- **[2026-09-01]** Editar a prescrição **atualiza** as linhas que continuam em vez de
  apagar e recriar: `session_sets` referencia `workout_exercises.id` com cascata, e
  recriar levaria o histórico do aluno junto.
- **[2026-09-01]** Repetições aceitam **só número ou faixa** (`12`, `8-10`). "Até a falha"
  e afins vão no campo de observação do exercício, que já existe. Decisão do Otávio: o
  alvo numérico garante que a tela de execução sempre tem o que mostrar no contador.
