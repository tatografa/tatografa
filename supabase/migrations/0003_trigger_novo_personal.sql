-- Reps Club · Fase 0 · Criação automática da linha em `trainers`
--
-- Doc 02: "Ao criar conta, cria também a linha em `trainers`."
--
-- Feito no banco, não no cliente, por um motivo: com confirmação de e-mail ligada,
-- o `signUp` não devolve sessão. Um insert no cliente esbarraria no RLS. O gatilho
-- roda como dono do banco e é atômico com a criação do usuário.
--
-- O gatilho olha `role` nos metadados: só cria personal para quem se cadastrou
-- como personal. O aluno entra por convite (fase 1) e ganha linha em `students`.

create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'role' = 'personal' then
    insert into public.trainers (id, name, email)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
      new.email
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
