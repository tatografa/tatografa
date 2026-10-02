-- Reps Club · A lista de espera também na versão para alunos
--
-- Pedido do Otávio (02/10): o campo de e-mail com "Entrar na lista" passa a
-- valer também em `/?para=alunos`, no lugar de "Entrar em contato". A lista
-- agora guarda **de qual página o e-mail veio** — escrever para um personal e
-- para um aluno são duas conversas, e sem isto a equipe abriria cada e-mail sem
-- saber qual das duas ter.
--
-- **Função nova ao lado da antiga, não no lugar dela.** Trocar a assinatura
-- exige `drop function`, e o MCP do Supabase pede para isso uma confirmação que
-- a sessão remota não consegue dar (a mesma trava da 0042). A de um argumento
-- continua de pé e grava `personal` pelo padrão da coluna — que é o que o site
-- no ar faz até o deploy terminar. O PostgREST escolhe pela lista de nomes dos
-- argumentos, então as duas não se confundem. A antiga sai na 0044.
--
-- O e-mail continua único: quem entrou por uma página e volta pela outra fica
-- com o perfil da primeira vez, e a resposta é a mesma de sempre — a função não
-- conta a ninguém que o e-mail já estava lá.
--
-- Onze provas, como `anon` e `authenticated`: quatro de caminho legítimo
-- (aluno, personal, repetido sem erro, a assinatura antiga), três de lixo
-- (perfil inventado, nulo, e-mail torto) e quatro de burla (visitante lendo,
-- inserindo direto e alterando; usuário logado lendo — 42501).

alter table public.lista_de_espera
  add column perfil text not null default 'personal'
    check (perfil in ('personal', 'aluno'));

comment on table public.lista_de_espera is
  'E-mails da lista de espera da landing, com a página de origem (personal ou aluno). Só entra por entrar_na_lista(); ninguém lê pela API.';

create function public.entrar_na_lista(p_email text, p_perfil text)
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.lista_de_espera (email, perfil)
  values (lower(trim(p_email)), p_perfil)
  on conflict (email) do nothing;
end;
$$;

comment on function public.entrar_na_lista(text, text) is
  'Única entrada da lista de espera. Responde igual para e-mail novo e repetido, para não revelar quem já está na lista.';

revoke execute on function public.entrar_na_lista(text, text) from public;
grant execute on function public.entrar_na_lista(text, text) to anon, authenticated;
