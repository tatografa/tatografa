# Brief do Milestone M1 · Fatia vertical

> Contexto comum a todos os cards do M1. O dev lê este arquivo, o card e os arquivos
> listados no card — nunca o repositório inteiro. Lacuna que muda a solução: devolver
> ao Tech Lead em vez de adivinhar.

## O que o milestone entrega

Convite → treino → execução → histórico. O Otávio, com duas contas, convida um aluno,
monta um treino, executa esse treino no celular numa academia de verdade, e vê o registro
correto no histórico.

## Convenções que valem para todo card

Estão no `CLAUDE.md` do produto e não se repetem aqui. As que mais pegam neste milestone:

- Regra de negócio em `lib/domain/` como função pura. Acesso a dado em `lib/queries/`
  com `import "server-only"`. Nada de N+1.
- Autorização de verdade no layout (`requireTrainer()` / `requireStudent()`), não no proxy.
- Server Action valida com zod e devolve `errosPorCampo`. Formulário leva `noValidate`.
- Nada de hex solto: tudo sai do `@theme` em `app/globals.css`.
- Next.js 16: `proxy.ts`, `params`/`searchParams`/`cookies` assíncronos. Ler
  `node_modules/next/dist/docs/` antes de escrever, não confiar na memória.
- zod v4: mensagem customizada usa `error`, não `errorMap`.

## Contratos já existentes

### Banco (migrations 0001–0006, aplicadas)

Cadeia da prescrição, de cima para baixo:

```
mesocycles (macrotreino do aluno: name, total_weeks, started_at, status)
  └─ workouts (treino: label "A"/"B", name, position, notes)
       └─ workout_exercises (prescrição: exercise_id, exercise_source,
                             position, sets, reps_target, rest_seconds,
                             technique, notes)
```

Execução, que o aluno gera:

```
workout_sessions (student_id, workout_id, started_at, finished_at, duration_seconds)
  └─ session_sets (workout_exercise_id, set_number, load_kg, reps, completed_at, skipped)
```

Pontos que já mordem:

- `workout_exercises.exercise_id` **não tem fk**: aponta para `exercises_catalog` ou
  `exercises` conforme `exercise_source` (`catalog` | `custom`). Resolver a origem é
  responsabilidade da query.
- `reps_target` é **texto**, porque faixa ("8-10") é comum na prescrição.
- Só existe **uma** `workout_sessions` com `finished_at` nulo por aluno — índice único
  parcial. Iniciar treino com sessão pendente precisa oferecer retomar ou descartar.
- `session_sets` é único por `(session_id, workout_exercise_id, set_number)`. Reenviar a
  mesma série é conflito, não duplicata — usar upsert.
- RLS: personal escreve a prescrição, aluno não. Aluno escreve `session_sets` da própria
  sessão. Helpers de autorização vivem no schema `private`.

### Catálogo

117 exercícios em `exercises_catalog`, carregados na migration 0004. Colunas relevantes:
`name`, `muscle_group`, `equipment`, `is_bodyweight`, `is_unilateral`,
`default_rest_seconds`. Enums de `muscle_group` e `equipment` em `types/database.ts`.

`is_bodyweight` muda a tela de execução: não pede carga.

### Domínio já escrito (`lib/domain/treino.ts`)

`duracaoEstimadaMin`, `totalDeSeries`, `volumeDaSessao`, `semanaAtual`, `saudacao`,
`comoRelogio`. Usar em vez de recalcular.

### Componentes (`components/ui/`)

`Button`, `Input`, `Card`, `Badge`, `Dialog`, `EscolhaCards`, exportados por `index.ts`.
O que faltar para um card, criar ali e exportar — não inline na página.

## Comandos

```bash
npm run typecheck && npm run lint && npm run build
```

Migrations pelo MCP do Supabase; depois de mudar schema, atualizar `types/database.ts`.

## Como o milestone é validado

Roteiro passo a passo para o Otávio, com a fatia inteira: convidar, montar treino,
executar no celular, conferir o histórico.

**Limite do ambiente remoto:** o host do Supabase é bloqueado pela política de rede
(403 no CONNECT). Lógica de banco se valida por SQL via MCP. Interface que precisa de
dado se confere com props fixas numa rota descartável, apagada antes do commit.
