-- Reps Club · Fase 0 · Segurança em nível de linha
--
-- A regra que não pode falhar (doc 03): nunca um aluno vê dado de outro aluno de
-- outro personal, nem um personal vê aluno que não é dele.
--
-- Implementação: RLS em todas as tabelas, com helpers `security definer` para
-- travessia de relação. O `security definer` existe para evitar recursão de
-- policy (uma policy de `students` que consulta `students` se auto-invoca) e para
-- manter o plano de query rápido. Todos fixam `search_path`.

-- ------------------------------------------------------------- helpers -----

-- O personal do aluno logado. Nulo se quem chama não é aluno.
create function public.my_trainer_id() returns uuid
  language sql stable security definer set search_path = public
as $$ select trainer_id from public.students where id = auth.uid() $$;

-- Quem chama é o personal deste aluno?
create function public.trainer_of(p_student_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.students s
    where s.id = p_student_id and s.trainer_id = auth.uid()
  )
$$;

create function public.can_read_mesocycle(p_mesocycle_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.mesocycles m
    where m.id = p_mesocycle_id
      and (m.student_id = auth.uid() or m.trainer_id = auth.uid())
  )
$$;

create function public.can_write_mesocycle(p_mesocycle_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.mesocycles m
    where m.id = p_mesocycle_id and m.trainer_id = auth.uid()
  )
$$;

create function public.can_read_workout(p_workout_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.workouts w
    join public.mesocycles m on m.id = w.mesocycle_id
    where w.id = p_workout_id
      and (m.student_id = auth.uid() or m.trainer_id = auth.uid())
  )
$$;

create function public.can_write_workout(p_workout_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.workouts w
    join public.mesocycles m on m.id = w.mesocycle_id
    where w.id = p_workout_id and m.trainer_id = auth.uid()
  )
$$;

create function public.can_read_session(p_session_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.workout_sessions ws
    join public.students s on s.id = ws.student_id
    where ws.id = p_session_id
      and (ws.student_id = auth.uid() or s.trainer_id = auth.uid())
  )
$$;

-- Escrita de série: só o dono da sessão. O personal lê, não escreve.
create function public.owns_session(p_session_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workout_sessions ws
    where ws.id = p_session_id and ws.student_id = auth.uid()
  )
$$;

revoke execute on function
  public.my_trainer_id(), public.trainer_of(uuid),
  public.can_read_mesocycle(uuid), public.can_write_mesocycle(uuid),
  public.can_read_workout(uuid), public.can_write_workout(uuid),
  public.can_read_session(uuid), public.owns_session(uuid)
from public, anon;

grant execute on function
  public.my_trainer_id(), public.trainer_of(uuid),
  public.can_read_mesocycle(uuid), public.can_write_mesocycle(uuid),
  public.can_read_workout(uuid), public.can_write_workout(uuid),
  public.can_read_session(uuid), public.owns_session(uuid)
to authenticated;

-- --------------------------------------------------------------- ligar -----
alter table public.trainers          enable row level security;
alter table public.students          enable row level security;
alter table public.invites           enable row level security;
alter table public.exercises_catalog enable row level security;
alter table public.exercises         enable row level security;
alter table public.mesocycles        enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.session_sets      enable row level security;

-- ------------------------------------------------------------ trainers -----
-- O aluno lê o perfil do próprio personal (nome, bio, avatar aparecem no app).
create policy trainers_select on public.trainers for select to authenticated
  using (id = auth.uid() or id = public.my_trainer_id());
create policy trainers_insert on public.trainers for insert to authenticated
  with check (id = auth.uid());
create policy trainers_update on public.trainers for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ------------------------------------------------------------ students -----
create policy students_select on public.students for select to authenticated
  using (id = auth.uid() or trainer_id = auth.uid());
create policy students_insert on public.students for insert to authenticated
  with check (trainer_id = auth.uid() or id = auth.uid());
create policy students_update on public.students for update to authenticated
  using (id = auth.uid() or trainer_id = auth.uid())
  with check (id = auth.uid() or trainer_id = auth.uid());
create policy students_delete on public.students for delete to authenticated
  using (trainer_id = auth.uid());

-- ------------------------------------------------------------- invites -----
-- Convite é assunto do personal. A leitura por token, no /convite/[token], é
-- feita no servidor com a chave de serviço — o visitante ainda não tem sessão.
create policy invites_all on public.invites for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- --------------------------------------------------- exercises_catalog -----
-- Leitura para qualquer usuário autenticado. Escrita para ninguém pela API:
-- sem policy de insert/update/delete, o RLS nega. Só a chave de serviço carrega.
create policy exercises_catalog_select on public.exercises_catalog for select to authenticated
  using (true);

-- ----------------------------------------------------------- exercises -----
create policy exercises_select on public.exercises for select to authenticated
  using (trainer_id = auth.uid() or trainer_id = public.my_trainer_id());
create policy exercises_write on public.exercises for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ---------------------------------------------------------- mesocycles -----
create policy mesocycles_select on public.mesocycles for select to authenticated
  using (student_id = auth.uid() or trainer_id = auth.uid());
create policy mesocycles_write on public.mesocycles for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- ------------------------------------------------------------ workouts -----
create policy workouts_select on public.workouts for select to authenticated
  using (public.can_read_mesocycle(mesocycle_id));
create policy workouts_write on public.workouts for all to authenticated
  using (public.can_write_mesocycle(mesocycle_id))
  with check (public.can_write_mesocycle(mesocycle_id));

-- --------------------------------------------------- workout_exercises -----
-- O aluno lê a prescrição, nunca escreve nela.
create policy workout_exercises_select on public.workout_exercises for select to authenticated
  using (public.can_read_workout(workout_id));
create policy workout_exercises_write on public.workout_exercises for all to authenticated
  using (public.can_write_workout(workout_id))
  with check (public.can_write_workout(workout_id));

-- ---------------------------------------------------- workout_sessions -----
-- O aluno registra a própria execução; o personal só lê.
create policy workout_sessions_select on public.workout_sessions for select to authenticated
  using (student_id = auth.uid() or public.trainer_of(student_id));
create policy workout_sessions_insert on public.workout_sessions for insert to authenticated
  with check (student_id = auth.uid() and public.can_read_workout(workout_id));
create policy workout_sessions_update on public.workout_sessions for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy workout_sessions_delete on public.workout_sessions for delete to authenticated
  using (student_id = auth.uid());

-- -------------------------------------------------------- session_sets -----
create policy session_sets_select on public.session_sets for select to authenticated
  using (public.can_read_session(session_id));
create policy session_sets_write on public.session_sets for all to authenticated
  using (public.owns_session(session_id))
  with check (public.owns_session(session_id));
