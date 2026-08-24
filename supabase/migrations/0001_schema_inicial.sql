-- Reps Club · Fase 0 · Schema inicial
-- Fonte: handoff_claude_code/03-modelo-de-dados.md
-- Escopo: as 10 tabelas listadas na Fase 0 do roadmap. Feed social, reavaliação,
-- medidas e agenda entram nas fases 2-3, junto com as telas que as usam.

-- ---------------------------------------------------------------- enums ----
create type public.student_goal      as enum ('massa', 'gordura', 'condicionamento', 'saude');
create type public.experience_level  as enum ('iniciante', 'intermediario', 'avancado');
create type public.student_status    as enum ('convidado', 'ativo', 'inativo');
create type public.mesocycle_status  as enum ('ativo', 'concluido', 'arquivado');
create type public.exercise_source   as enum ('catalog', 'custom');

-- Valores vindos de data/exercicios.json (_enums).
create type public.muscle_group as enum (
  'peito', 'costas', 'ombros', 'trapezio', 'biceps', 'triceps', 'antebraco',
  'quadriceps', 'posterior', 'gluteos', 'panturrilha', 'abdomen', 'lombar', 'cardio'
);
create type public.equipment as enum (
  'barra', 'halter', 'cabo', 'maquina', 'peso_corporal', 'anilha', 'smith', 'elastico', 'cardio'
);

-- ------------------------------------------------------------- trainers ----
create table public.trainers (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text        not null,
  email      text        not null unique,
  phone      text,
  avatar_url text,
  bio        text,
  created_at timestamptz not null default now()
);

comment on table public.trainers is 'O personal trainer. Uma linha por conta; id espelha auth.users.';

-- ------------------------------------------------------------- students ----
create table public.students (
  id               uuid primary key references auth.users (id) on delete cascade,
  trainer_id       uuid not null references public.trainers (id) on delete cascade,
  name             text not null,
  email            text not null unique,
  birth_date       date,
  goal             public.student_goal,
  experience_level public.experience_level,
  status           public.student_status not null default 'convidado',
  avatar_url       text,
  onboarded_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index students_trainer_id_idx on public.students (trainer_id);

-- -------------------------------------------------------------- invites ----
create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  trainer_id  uuid not null references public.trainers (id) on delete cascade,
  email       text not null,
  name        text not null,
  token       text not null unique,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index invites_trainer_id_idx on public.invites (trainer_id);
comment on column public.invites.token is 'Uso único, alta entropia. Consumido em /convite/[token].';

-- ---------------------------------------------------- exercises_catalog ----
-- Catálogo base global. Sem dono. Carregado de data/exercicios.json.
create table public.exercises_catalog (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null unique,
  muscle_group         public.muscle_group not null,
  equipment            public.equipment not null,
  is_bodyweight        boolean not null default false,
  is_unilateral        boolean not null default false,
  default_rest_seconds integer not null default 60
);

create index exercises_catalog_muscle_group_idx on public.exercises_catalog (muscle_group);

-- ------------------------------------------------------------ exercises ----
-- Exercícios criados pelo personal. Mesmas colunas do catálogo + dono.
create table public.exercises (
  id                   uuid primary key default gen_random_uuid(),
  trainer_id           uuid not null references public.trainers (id) on delete cascade,
  name                 text not null,
  muscle_group         public.muscle_group not null,
  equipment            public.equipment not null,
  is_bodyweight        boolean not null default false,
  is_unilateral        boolean not null default false,
  default_rest_seconds integer not null default 60,
  created_at           timestamptz not null default now(),
  unique (trainer_id, name)
);

create index exercises_trainer_id_idx on public.exercises (trainer_id);

-- ----------------------------------------------------------- mesocycles ----
create table public.mesocycles (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students (id) on delete cascade,
  trainer_id  uuid not null references public.trainers (id) on delete cascade,
  name        text not null,
  total_weeks integer not null check (total_weeks > 0),
  started_at  date not null default current_date,
  status      public.mesocycle_status not null default 'ativo',
  created_at  timestamptz not null default now()
);

create index mesocycles_student_id_idx on public.mesocycles (student_id);
create index mesocycles_trainer_id_idx on public.mesocycles (trainer_id);
comment on column public.mesocycles.started_at is 'A semana atual é derivada daqui em lib/domain, nunca armazenada.';

-- ------------------------------------------------------------- workouts ----
create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  mesocycle_id uuid not null references public.mesocycles (id) on delete cascade,
  label        text not null,
  name         text not null,
  position     integer not null default 0,
  notes        text,
  created_at   timestamptz not null default now()
);

create index workouts_mesocycle_id_idx on public.workouts (mesocycle_id, position);
comment on table public.workouts is 'Duração estimada e contagem de séries são derivadas de workout_exercises, não colunas.';

-- ---------------------------------------------------- workout_exercises ----
-- A prescrição: o que o personal mandou o aluno fazer.
create table public.workout_exercises (
  id              uuid primary key default gen_random_uuid(),
  workout_id      uuid not null references public.workouts (id) on delete cascade,
  exercise_id     uuid not null,
  exercise_source public.exercise_source not null,
  position        integer not null default 0,
  sets            integer not null check (sets > 0),
  reps_target     text not null,
  rest_seconds    integer not null default 60,
  technique       text,
  notes           text
);

create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id, position);
comment on column public.workout_exercises.exercise_source is 'catalog | custom — resolve a ambiguidade da fk de exercise_id.';
comment on column public.workout_exercises.reps_target is 'Texto ("8-10" ou "12"): faixas são comuns na prescrição.';

-- ----------------------------------------------------- workout_sessions ----
-- Uma execução real do treino pelo aluno. O registro histórico.
create table public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  workout_id       uuid not null references public.workouts (id) on delete cascade,
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  duration_seconds integer,
  notes            text
);

create index workout_sessions_student_id_idx on public.workout_sessions (student_id, started_at desc);
create index workout_sessions_workout_id_idx on public.workout_sessions (workout_id);

-- "Só pode existir uma sessão com finished_at nulo por aluno."
create unique index workout_sessions_uma_em_andamento_idx
  on public.workout_sessions (student_id)
  where finished_at is null;

-- ---------------------------------------------------------- session_sets ---
-- A tabela mais importante do sistema: cada série que o aluno realmente fez.
create table public.session_sets (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.workout_sessions (id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number          integer not null check (set_number > 0),
  load_kg             numeric(6, 2),
  reps                integer,
  completed_at        timestamptz not null default now(),
  skipped             boolean not null default false,
  unique (session_id, workout_exercise_id, set_number)
);

-- Todo gráfico de evolução, PR e volume sai daqui. Índices exigidos pelo doc 03.
create index session_sets_progresso_idx on public.session_sets (workout_exercise_id, completed_at);
create index session_sets_session_id_idx on public.session_sets (session_id);
comment on column public.session_sets.load_kg is 'Nulo para exercício de peso corporal.';
