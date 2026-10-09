-- Reps Club · De onde vêm as fotos de perfil nas telas que mostram outras pessoas
--
-- A foto mora em `students.avatar_path`, e `students_select` devolve ao aluno
-- **só a própria linha**: no feed, o colega e o personal apareceriam sempre com
-- as iniciais. É o mesmo problema dos nomes, resolvido do mesmo jeito que
-- `nomes_no_feed` (0020, 0035): função estreita que **recebe os ids** — é preciso
-- já conhecer o id, e o único jeito de conhecê-lo é ter lido um post, um
-- comentário ou a própria carteira — e devolve só `(id, avatar_path)`. Abrir o
-- `students_select` entregaria e-mail, peso e perfil biológico dos colegas para
-- desenhar um círculo.
--
-- A regra de turma é **a mesma** de `nomes_no_feed` e da política de leitura do
-- bucket `avatares` (0049): o dono, o personal do dono e quem está na turma
-- ativa do dono. Se as três discordassem, apareceria caminho de arquivo que o
-- bucket recusa assinar (círculo vazio) ou foto de quem não tem nome na tela.
--
-- O personal que treina a si mesmo (13/09) tem linha em `students` com
-- `id = trainer_id`; é a foto dela que aparece como foto **do personal** — no
-- painel, no cartão do personal no app do aluno e nos comentários com o selo
-- PERSONAL. Personal sem linha de aluno continua com as iniciais.

create function public.caminhos_dos_avatares(p_ids uuid[])
  returns table (id uuid, avatar_path text)
  language sql
  stable
  security definer
  set search_path = public
as $$
  select s.id, s.avatar_path
    from public.students s
   where s.id = any(p_ids)
     and s.avatar_path is not null
     and (
       s.id = (select auth.uid())
       or s.trainer_id = (select auth.uid())
       or (private.minha_turma() is not null
           and s.trainer_id = private.minha_turma())
     )
$$;

revoke execute on function public.caminhos_dos_avatares(uuid[]) from public, anon;
grant execute on function public.caminhos_dos_avatares(uuid[]) to authenticated;

comment on function public.caminhos_dos_avatares(uuid[]) is
  'Caminho da foto de perfil de quem o chamador pode ver (dono, personal, turma ativa). Mesma regra de nomes_no_feed e da leitura do bucket avatares.';
