-- 0054 · Foto só na pasta do dono, lista de espera com teto
--
-- Da revisão de segurança de 09/10.
--
-- 1. A policy de leitura do bucket `treinos` libera um arquivo para quem pode
--    ver UM post que aponte para ele (`posts.photo_path = objects.name`). Nada
--    prendia `photo_path` à pasta do autor: um aluno criava (ou editava) um post
--    dele, só para o personal, apontando para a foto de um colega — e passava a
--    ler aquela foto, mesmo que o colega a tivesse publicado só para o personal.
--    Provado antes da correção (0 → 1 arquivo legível). Exigia conhecer o
--    caminho, que é aleatório, mas o caminho aparece em toda URL assinada que o
--    colega já viu. A trava é um `check`: o caminho começa pelo id do dono da
--    linha e não tem `/` depois disso (sem `../`). Mesma regra para
--    `students.avatar_path`, que hoje só o dono escreve, para continuar assim.
--
-- 2. `entrar_na_lista(text)`, a versão antiga, ainda aceitava o `anon` e
--    gravava sem perfil. O `drop` está na 0045 (pendente: pede a confirmação
--    que a sessão remota não dá); até lá, ninguém executa.
--
-- 3. A lista não tinha limite de envio. Acima de 60 inscrições na última hora a
--    função ignora em silêncio, com a resposta de sempre.

alter table public.posts
  add constraint posts_foto_na_pasta_do_autor
  check (photo_path is null or photo_path ~ ('^' || student_id::text || '/[A-Za-z0-9._-]+$'));

comment on constraint posts_foto_na_pasta_do_autor on public.posts is
  'A policy de leitura do bucket treinos libera o arquivo para quem pode ver um post que aponte para ele. Sem esta trava, um aluno criava um post seu apontando para a foto de outro e ganhava a leitura dela.';

alter table public.students
  add constraint students_avatar_na_pasta_do_aluno
  check (avatar_path is null or avatar_path ~ ('^' || id::text || '/[A-Za-z0-9._-]+$'));

-- A versão de um argumento sai na 0045 (pendente); até lá, ninguém executa.
revoke execute on function public.entrar_na_lista(text) from public, anon, authenticated;

-- Teto de envios da lista: porta pública sem limite é convite a robô.
create index if not exists lista_de_espera_created_at_idx on public.lista_de_espera (created_at);

create or replace function public.entrar_na_lista(p_email text, p_perfil text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- Mais de 60 inscrições na última hora é robô, não gente: ignora em silêncio,
  -- com a mesma resposta de sempre, para não ensinar o limite a quem testa.
  if (select count(*) from public.lista_de_espera
      where created_at > now() - interval '1 hour') >= 60 then
    return;
  end if;

  insert into public.lista_de_espera (email, perfil)
  values (lower(trim(p_email)), p_perfil)
  on conflict (email) do nothing;
end;
$function$;
