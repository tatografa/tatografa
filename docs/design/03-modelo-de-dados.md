# 03 · Modelo de dados

Nomes de tabela e coluna são sugestão. O agente pode ajustar convenções, mas **as relações e as
regras de acesso abaixo são requisitos do produto**, não estilo.

## Diagrama de relações

```
trainers ──┬── students ──┬── student_measurements
           │              ├── assessments (reavaliação)
           │              ├── workout_sessions ── session_sets
           │              └── posts ──┬── post_likes
           │                          └── post_comments
           ├── invites
           ├── exercises (próprios do personal)
           ├── mesocycles (macrotreinos) ── workouts ── workout_exercises
           └── appointments (agenda)

exercises_catalog  (global, compartilhado, sem dono)
```

## Tabelas

### `trainers`
O personal trainer. Uma linha por conta.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | mesmo id do usuário no Auth |
| `name` | text | |
| `email` | text, único | |
| `phone` | text | usado para WhatsApp |
| `avatar_url` | text | |
| `bio` | text | aparece no perfil visto pelo aluno |
| `created_at` | timestamptz | |

### `students`
O aluno. Vinculado a um personal.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | mesmo id do usuário no Auth |
| `trainer_id` | uuid, fk → trainers | |
| `name` | text | |
| `email` | text, único | |
| `birth_date` | date | |
| `goal` | enum | `massa`, `gordura`, `condicionamento`, `saude` |
| `experience_level` | enum | `iniciante`, `intermediario`, `avancado` |
| `status` | enum | `convidado`, `ativo`, `inativo` |
| `avatar_url` | text | |
| `onboarded_at` | timestamptz | nulo até completar o onboarding |
| `created_at` | timestamptz | |

### `invites`
Convite de aluno. Consumido no primeiro acesso.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `trainer_id` | uuid, fk | |
| `email` | text | |
| `name` | text | nome que o personal digitou |
| `token` | text, único | usado na URL, alta entropia |
| `expires_at` | timestamptz | 7 dias |
| `accepted_at` | timestamptz | nulo = pendente |

Regra: token de uso único. Após aceitar, cria a linha em `students` e marca `accepted_at`.
Convite expirado leva à tela de "link expirado" com opção de pedir novo convite ao personal.

### `exercises_catalog`
Catálogo base global. Carregado a partir de `data/exercicios.json`. Sem dono, somente leitura
para todos os personais.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `name` | text | "Supino reto com barra" |
| `muscle_group` | enum | ver lista no JSON |
| `equipment` | enum | ver lista no JSON |
| `is_bodyweight` | boolean | muda a UI de execução (não pede carga) |
| `is_unilateral` | boolean | |
| `default_rest_seconds` | int | |

### `exercises`
Exercícios criados pelo personal. Mesmas colunas do catálogo, mais `trainer_id`.
Na interface, catálogo e próprios aparecem juntos numa única busca, com um marcador visual
distinguindo os do personal.

### `mesocycles`
O macrotreino. No app do aluno aparece como "Projeto Verão · Semana 3 de 8".

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk | |
| `trainer_id` | uuid, fk | |
| `name` | text | "Projeto Verão" |
| `total_weeks` | int | |
| `started_at` | date | semana atual é derivada disso, não armazenada |
| `status` | enum | `ativo`, `concluido`, `arquivado` |

### `workouts`
Um treino dentro do macrotreino: "Treino B · Costas e Bíceps".

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `mesocycle_id` | uuid, fk | |
| `label` | text | "A", "B", "C", "D" |
| `name` | text | "Costas e Bíceps" |
| `position` | int | ordem na lista |
| `notes` | text | recado do personal para o aluno |

Duração estimada (`~45min`) e contagem de séries são **derivadas** de `workout_exercises`, não
colunas. Fórmula sugerida: `soma(sets × (tempo_médio_série + rest_seconds))`, arredondada para
múltiplo de 5 minutos.

### `workout_exercises`
Prescrição: o que o personal mandou o aluno fazer.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `workout_id` | uuid, fk | |
| `exercise_id` | uuid | referência ao catálogo ou aos exercícios do personal |
| `exercise_source` | enum | `catalog`, `custom` — resolve a ambiguidade da fk |
| `position` | int | |
| `sets` | int | |
| `reps_target` | text | "8-10" ou "12" — texto, porque faixas são comuns |
| `rest_seconds` | int | |
| `technique` | text | "Cadência 3-1-2", "Drop-set", "Falha" — o selo cinza na lista |
| `notes` | text | |

### `workout_sessions`
Uma execução real do treino pelo aluno. É o registro histórico.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk | |
| `workout_id` | uuid, fk | |
| `started_at` | timestamptz | |
| `finished_at` | timestamptz | nulo = sessão em andamento |
| `duration_seconds` | int | tempo real, não estimado |
| `notes` | text | como o aluno se sentiu |

Só pode existir uma sessão com `finished_at` nulo por aluno. Ao iniciar um treino com sessão
pendente, ofereça retomar ou descartar.

### `session_sets`
**A tabela mais importante do sistema.** Cada série que o aluno realmente fez.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `session_id` | uuid, fk | |
| `workout_exercise_id` | uuid, fk | liga ao que foi prescrito |
| `set_number` | int | 1, 2, 3… |
| `load_kg` | numeric(6,2) | nulo para exercício de peso corporal |
| `reps` | int | |
| `completed_at` | timestamptz | |
| `skipped` | boolean | exercício pulado |

Todo gráfico de evolução, todo recorde pessoal e todo cálculo de volume sai daqui. Indexe por
`(workout_exercise_id, completed_at)` e por `(session_id)`.

### `posts`, `post_likes`, `post_comments`
Feed social. `posts` tem `student_id`, `session_id` (opcional — post ligado a um treino),
`caption`, `photo_path`, `visibility` (`personal` = só o personal vê, `publico` = alunos do
mesmo personal veem), `created_at`.

Importante: "público" na v1 significa **visível aos outros alunos do mesmo personal**, não à
internet. O protótipo mostra essa escolha no compositor de post.

### `assessments`
Reavaliação física.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid, pk | |
| `student_id` | uuid, fk | |
| `trainer_id` | uuid, fk | |
| `released_at` | timestamptz | personal libera, aluno preenche |
| `submitted_at` | timestamptz | |
| `weight_kg` | numeric | |
| `body_fat_pct` | numeric | |
| `photo_front_path`, `photo_side_path`, `photo_back_path` | text | |
| `notes` | text | |

### `student_measurements`
Medidas por região (braço, peito, cintura, quadril, coxa), com `assessment_id`, `region`,
`value_cm`. Tabela separada para permitir comparar séries históricas sem alterar schema.

### `appointments`
Agenda de sessões presenciais: `trainer_id`, `student_id`, `starts_at`, `duration_minutes`,
`status` (`agendada`, `realizada`, `faltou`, `cancelada`), `notes`.

## Regras de acesso

Ative segurança em nível de linha em todas as tabelas. As regras, em linguagem de produto:

- Um aluno lê e escreve só as próprias linhas (`student_id = usuário atual`).
- Um personal lê e escreve as linhas dos alunos onde `trainer_id = usuário atual`.
- `exercises_catalog` é leitura para qualquer usuário autenticado, escrita para ninguém pela API.
- Um aluno **não** pode alterar `workout_exercises` (a prescrição é do personal).
- Um aluno **não** pode ver posts de alunos de outro personal.
- Fotos de reavaliação: só o aluno dono e o personal dele.

O agente escolhe como implementar. A regra que não pode falhar: **nunca um aluno vê dado de
outro aluno de outro personal, nem um personal vê aluno que não é dele.**

## Cálculos derivados (em `lib/domain/`)

```ts
// Recorde pessoal por exercício: maior carga com pelo menos as reps alvo
personalRecord(sets: SessionSet[]): { loadKg: number; reps: number; date: Date }

// Volume de uma sessão: soma de carga × reps
sessionVolume(sets: SessionSet[]): number

// Sequência de dias: dias consecutivos com ao menos uma sessão concluída
currentStreak(sessions: WorkoutSession[], today: Date): number

// Semana atual do macrotreino
currentWeek(mesocycle: Mesocycle, today: Date): number

// Série histórica para o gráfico: uma entrada por sessão, carga máxima da sessão
exerciseProgress(sets: SessionSet[], limit: 6 | 12 | 'all'): ProgressPoint[]
```

Nada disso é coluna no banco. Calcule na leitura. Com 50 alunos o volume é irrelevante; se um dia
pesar, vira view materializada — e isso é decisão técnica do agente.

## Queries principais

As cinco consultas que definem a performance do app:

1. **Home do aluno** — macrotreino ativo, próximo treino sugerido, streak, total de sessões.
2. **Detalhe do treino** — treino + exercícios prescritos + última carga registrada em cada um
   (isso alimenta o texto "última vez: 60kg × 10").
3. **Execução** — inserir `session_sets` uma a uma, rápido, otimista.
4. **Gráfico de evolução** — séries de um `workout_exercise` ao longo do tempo, agrupadas por sessão.
5. **Dashboard do personal** — por aluno: última sessão, aderência da semana, alertas de inatividade.

A número 2 é a que tende a ficar lenta se malfeita (N+1). Resolva com uma única query lateral.
