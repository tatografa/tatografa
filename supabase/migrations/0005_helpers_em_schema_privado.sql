-- Reps Club · Fase 0 · Tira os helpers de RLS da API pública
--
-- O PostgREST publica como endpoint RPC toda função do schema `public`. Os
-- helpers de RLS e o gatilho de novo usuário não são API — são infraestrutura
-- de autorização. Expostos, viram superfície de ataque sem nenhum ganho.
--
-- A correção é mover para um schema `private`, que o PostgREST não publica. As
-- policies continuam chamando as funções normalmente: o papel `authenticated`
-- só precisa de USAGE no schema e EXECUTE nas funções.
--
-- As policies são recriadas porque dependem das funções pelo nome qualificado.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- 1. Soltar as policies que apontam para as funções antigas.
drop policy trainers_select            on public.trainers;
drop policy exercises_select           on public.exercises;
drop policy workouts_select            on public.workouts;
drop policy workouts_write             on public.workouts;
drop policy workout_exercises_select   on public.workout_exercises;
drop policy workout_exercises_write    on public.workout_exercises;
drop policy workout_sessions_select    on public.workout_sessions;
drop policy workout_sessions_insert    on public.workout_sessions;
drop policy session_sets_select        on public.session_sets;
drop policy session_sets_write         on public.session_sets;

-- 2. Mover os helpers para `private`.
alter function public.my_trainer_id()             set schema private;
alter function public.trainer_of(uuid)            set schema private;
alter function public.can_read_mesocycle(uuid)    set schema private;
alter function public.can_write_mesocycle(uuid)   set schema private;
alter function public.can_read_workout(uuid)      set schema private;
alter function public.can_write_workout(uuid)     set schema private;
alter function public.can_read_session(uuid)      set schema private;
alter function public.owns_session(uuid)          set schema private;

-- As funções consultam tabelas de `public` sem qualificar; o search_path
-- fixado precisa acompanhar a mudança de schema.
alter function private.my_trainer_id()           set search_path = public;
alter function private.trainer_of(uuid)          set search_path = public;
alter function private.can_read_mesocycle(uuid)  set search_path = public;
alter function private.can_write_mesocycle(uuid) set search_path = public;
alter function private.can_read_workout(uuid)    set search_path = public;
alter function private.can_write_workout(uuid)   set search_path = public;
alter function private.can_read_session(uuid)    set search_path = public;
alter function private.owns_session(uuid)        set search_path = public;

grant execute on function
  private.my_trainer_id(), private.trainer_of(uuid),
  private.can_read_mesocycle(uuid), private.can_write_mesocycle(uuid),
  private.can_read_workout(uuid), private.can_write_workout(uuid),
  private.can_read_session(uuid), private.owns_session(uuid)
to authenticated;

-- 3. O gatilho de novo usuário também sai da API. Ele roda pelo trigger em
--    auth.users; ninguém precisa chamá-lo por HTTP.
alter function public.handle_new_user() set schema private;
alter function private.handle_new_user() set search_path = public;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- 4. Recriar as policies apontando para `private`.
create policy trainers_select on public.trainers for select to authenticated
  using (id = auth.uid() or id = private.my_trainer_id());

create policy exercises_select on public.exercises for select to authenticated
  using (trainer_id = auth.uid() or trainer_id = private.my_trainer_id());

create policy workouts_select on public.workouts for select to authenticated
  using (private.can_read_mesocycle(mesocycle_id));
create policy workouts_write on public.workouts for all to authenticated
  using (private.can_write_mesocycle(mesocycle_id))
  with check (private.can_write_mesocycle(mesocycle_id));

create policy workout_exercises_select on public.workout_exercises for select to authenticated
  using (private.can_read_workout(workout_id));
create policy workout_exercises_write on public.workout_exercises for all to authenticated
  using (private.can_write_workout(workout_id))
  with check (private.can_write_workout(workout_id));

create policy workout_sessions_select on public.workout_sessions for select to authenticated
  using (student_id = auth.uid() or private.trainer_of(student_id));
create policy workout_sessions_insert on public.workout_sessions for insert to authenticated
  with check (student_id = auth.uid() and private.can_read_workout(workout_id));

create policy session_sets_select on public.session_sets for select to authenticated
  using (private.can_read_session(session_id));
create policy session_sets_write on public.session_sets for all to authenticated
  using (private.owns_session(session_id))
  with check (private.owns_session(session_id));
