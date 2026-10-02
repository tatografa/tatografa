-- Reps Club · Lista de espera da landing
--
-- Pedido do Otávio (02/10): na versão "Para Personais" da landing, o botão
-- "Quero começar" (que abria o formulário completo) virou um campo de e-mail
-- com "Entrar na lista". Só o e-mail, nada mais.
--
-- **Tabela fechada, porta por função.** Ninguém tem privilégio nenhum na
-- tabela pela API — nem insert —, e a única entrada é `entrar_na_lista`,
-- `security definer`, que insere e ignora o repetido. Duas razões:
--
-- 1. `on conflict do nothing` com RLS exige policy de **select** (o Postgres
--    precisa olhar a linha que já existe), e dar leitura a visitante é o que
--    esta tabela não pode ter. Provado antes de escrever: o insert do `anon`
--    com `on conflict` foi recusado com 42501.
-- 2. Sem o `on conflict`, o segundo envio do mesmo e-mail devolveria erro de
--    chave única — e a diferença entre "entrou" e "já estava" contaria a
--    qualquer um quem está na lista. A função responde igual nos dois casos.
--
-- O e-mail é guardado em minúsculas e sem espaço, e a unicidade é sobre ele:
-- "Ana@Email.com" e "ana@email.com " são a mesma pessoa.

create table public.lista_de_espera (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (char_length(email) <= 120 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and email = lower(email)),
  created_at timestamptz not null default now()
);

comment on table public.lista_de_espera is
  'E-mails da lista de espera da landing (personal). Só entra por entrar_na_lista(); ninguém lê pela API.';

alter table public.lista_de_espera enable row level security;
revoke all on public.lista_de_espera from anon, authenticated;

create function public.entrar_na_lista(p_email text)
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.lista_de_espera (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;
end;
$$;

comment on function public.entrar_na_lista(text) is
  'Única entrada da lista de espera. Responde igual para e-mail novo e repetido, para não revelar quem já está na lista.';

revoke execute on function public.entrar_na_lista(text) from public;
grant execute on function public.entrar_na_lista(text) to anon, authenticated;
