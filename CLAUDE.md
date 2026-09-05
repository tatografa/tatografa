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
| M1 | Fase 1 · Fatia vertical | Convite → treino → execução → histórico | construído · **não validado** |
| M2 | Fase 2 · Utilidade contínua | Macrotreino, PRs, progresso, painel completo | construído · revisado · **não validado** |
| M3 | Fase 3 · Social e reavaliação | Feed, fotos, reavaliação física | planejado (cortável) |
| M4 | Fase 4 · Pronto para o piloto | PWA, estados vazios/erro, e-mails, termos | planejado |

> **Nenhum milestone além do M0 rodou com Supabase de verdade.** Este ambiente não
> alcança o host, e o roteiro de `docs/plan/M2-validacao.md` cobre M1 e M2 juntos.
> Enquanto ele não rodar, "construído" é o máximo que se pode afirmar.

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
  Cálculo de PR, volume, streak, semana do macrotreino, rotação, duração estimada.
- **Texto ou regra que um componente cliente e uma página servidor dividem vive num
  módulo neutro.** Função exportada de módulo `"use client"` não pode ser *chamada*
  pelo servidor, só renderizada como componente — e duplicar a frase para contornar
  isso é como duas cópias de um texto aprovado saem de sincronia.
- **Acesso a dado fica em `lib/queries/`**, tipado, com `import "server-only"`.
- **Nada de N+1.** Buscar em lote e agrupar em memória, mesmo com poucos registros.
- **Autorização de verdade mora no layout** (`requireTrainer()`, `requireStudent()`),
  não no `proxy.ts` — o proxy é otimista, só evita render à toa.
- **Policy de escrita confere o relacionamento, não só o dono da linha — e no
  `UPDATE` também.** Foi o mesmo furo três vezes (migrations 0007, 0009, 0010).
  Toda coluna que aponta para o relacionamento (`student_id`, `workout_id`,
  `trainer_id`) precisa estar no `with check` do insert **e** do update: um
  `insert` bem trancado não vale nada se o update reescreve a mesma coluna.
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
  Hoje: `prescricao.md` (o que a execução lê), `execucao.md` (o que o histórico lê) e
  `macrotreino.md` (programa, rotação e treino sugerido).

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
- **[2026-09-04]** O macrotreino tem tela própria (`/painel/macrotreinos`) e o treino
  **nasce dentro de um programa**: o editor recebe o programa pela URL e não pergunta
  mais aluno, nome nem semanas. Substitui a muleta do M1, em que o programa era
  nomeado ao salvar o primeiro treino.
- **[2026-09-04]** **Um programa ativo por aluno é índice no banco**, não convenção de
  código (`mesocycles_um_ativo_por_aluno_idx`). É por esse campo que as telas do aluno
  decidem o que mostrar: dois ativos seria a tela errada, em silêncio, e dois cliques
  simultâneos bastam para criar os dois.
- **[2026-09-04]** **Arquivar é mudar o status; apagar programa com histórico não é
  possível pela API** (`mesocycles_delete`). O delete levaria treino, prescrição e
  série por cascata. Programa sem nenhuma sessão continua apagável — lixo criado por
  engano não fica preso. Sessão em andamento sobrevive ao arquivamento: o aluno
  termina e salva.
- **[2026-09-04]** **Trocar o programa ativo é uma transação só** (`ativar_macrotreino`,
  migration 0012), e o programa novo **nasce arquivado** para depois ser ativado. Em
  dois passos soltos, uma falha no meio deixa o aluno sem programa nenhum — abrindo o
  app na academia sem treino.
- **[2026-09-04]** A **semana da rotação sai do `started_at`**, não da segunda-feira do
  calendário: programa começado numa quarta tem a semana 1 de quarta a terça. O número
  que a tela mostra e a rotação vêm da mesma conta, então nunca discordam. Cuidado com
  o par: `semanaAtual` tem teto (é rótulo), `semanaCorridaDoPrograma` não tem (é
  janela) — travar a janela congelaria a rotação depois do prazo.
- **[2026-09-01]** Editar a prescrição **atualiza** as linhas que continuam em vez de
  apagar e recriar: `session_sets` referencia `workout_exercises.id` com cascata, e
  recriar levaria o histórico do aluno junto.
- **[2026-09-02]** A execução grava por **fila local com reenvio**, não por requisição
  síncrona: confirmar série é local e imediato, o `localStorage` guarda o que falta
  enviar, e o servidor faz `upsert` em `(session_id, workout_exercise_id, set_number)`.
  Reenvio e correção passam pelo mesmo caminho e não viram duplicata. O limite aceito é
  a fila viver no aparelho até a Fase 4 — por isso o contador de pendentes fica visível
  e o botão de concluir só fecha a sessão com a fila vazia.
- **[2026-09-02]** Sessão em andamento de outro treino é **encerrada e salva**, nunca
  apagada: série que o aluno executou é histórico. Só a sessão com zero séries é
  descartada — e "zero séries" é medido **depois** de enviar a fila que o aparelho
  guarda daquela sessão, porque a contagem do servidor não enxerga um treino feito sem
  sinal. Encerrar grava `finished_at` e `duration_seconds`.
- **[2026-09-02]** Toda chave de `localStorage` que guarda dado de uma sessão é
  **chaveada pelo id da sessão**. Chave global vira apagamento: o efeito de persistência
  roda na montagem com o estado vazio e limpa o que era de outra sessão.
- **[2026-09-02]** Ler `localStorage` no cliente exige separar o **render de hidratação**
  do resto: nele a janela já existe, então `typeof window` não protege. O gate é
  `useMontado()` (`lib/usar-montado.ts`, sobre `useSyncExternalStore`) trocando a `key`
  do componente — e não `setState` em efeito, que o lint recusa.
- **[2026-09-02]** Policy de escrita de `session_sets` confere também **a que treino o
  exercício pertence**. `owns_session` sozinho deixava o aluno gravar série apontando
  para a prescrição de um treino alheio e inflar o histórico de um estranho. Migration
  `0009` acrescentou `private.serie_no_treino_da_sessao`.
- **[2026-09-01]** Repetições aceitam **só número ou faixa** (`12`, `8-10`). "Até a falha"
  e afins vão no campo de observação do exercício, que já existe. Decisão do Otávio: o
  alvo numérico garante que a tela de execução sempre tem o que mostrar no contador.
- **[2026-09-01]** Data do histórico é formatada **no servidor com fuso fixo
  `America/Sao_Paulo`**, não no fuso do aparelho. Formatar no cliente deixaria a data — que
  é o rótulo da linha — vazia até a hidratação, e a linha sem identidade. O limite aceito:
  aluno em Manaus ou Rio Branco vê a data no horário de Brasília. Para o piloto serve;
  quando houver aluno fora do fuso, guardar a preferência no perfil.
- **[2026-09-02]** O aluno **não nasce por API**: `students_insert` só aceita
  `trainer_id = auth.uid()` (o personal). O gatilho é `security definer` e não
  passa por policy, então o convite continua funcionando — e um POST direto
  deixou de valer mais que um token de 192 bits. Do mesmo jeito, o aluno não
  troca o próprio `trainer_id`: mudar de personal é decisão de quem convida.
- **[2026-09-02]** Sessão concluída não se apaga (`workout_sessions_delete`
  exige `finished_at is null`). Apagar levaria as séries por cascata, e quem
  perde a leitura é o personal. Só a sessão em andamento e vazia é descartável.
- **[2026-09-02]** Toda conta de "que dia é hoje" passa por `lib/domain/fuso.ts`
  (`America/Sao_Paulo`), nunca pelo fuso do processo: o servidor roda em UTC e
  às 21h no Brasil já virou o dia seguinte — exatamente o horário em que se
  treina. Coluna `date` ("2026-09-01") é dia de calendário e não se converte.
- **[2026-09-02]** Recorde pessoal é a **maior carga levantada**, independente das
  repetições. Decisão do Otávio, que **contraria o doc 03** ("maior carga com pelo menos as
  reps alvo") — registrada aqui para não ser "corrigida" por engano. Motivo: é o que o
  aluno entende sem explicação. Limite aceito: premia quem reduz repetição para pôr mais
  peso. Mudar isso é trocar uma função pura em `lib/domain/`.
- **[2026-09-04]** **Histórico por exercício agrupa por `(exercise_source, exercise_id)`,
  nunca por `workout_exercise_id`.** Este último é uma linha de prescrição — existe uma
  por treino e outra a cada programa novo —, então agrupar por ele faria "a última vez que
  fiz supino" recomeçar do zero a cada macrotreino. `chaveDoExercicio` monta a chave;
  `lib/domain/recordes.ts` a trata como texto opaco.
- **[2026-09-02]** Gráfico de evolução é **SVG à mão**, sem biblioteca. Um gráfico de linha
  com pontos clicáveis não paga ~100 kB de dependência, e biblioteca genérica atrapalha o
  que o doc 05 pede: linha de borda a borda, datas na horizontal, mais recente primeiro.
