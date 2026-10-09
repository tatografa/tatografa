-- Reps Club · Excluir aluno leva as fotos junto
--
-- O personal já pode apagar a linha do aluno (`students_delete`, desde a
-- 0001), e a cascata leva programas, sessões, séries, posts, reavaliações,
-- agenda e anotações. O que **não** ia junto eram os arquivos: as três pastas
-- `<student_id>/…` (`avatares`, `treinos`, `reavaliacoes`) só aceitam delete do
-- próprio dono. Sem isto, excluir um aluno deixaria fotos do corpo de alguém
-- num bucket que mais ninguém consegue ler nem apagar — e a política de
-- privacidade promete que a exclusão leva "todas as suas fotos".
--
-- A nova permissão não dá ao personal poder que ele não tinha: quem pode
-- apagar o aluno inteiro pode apagar as fotos dele. E é estreita como as
-- leituras: a pasta precisa ser de um aluno cujo `trainer_id` é quem pede,
-- resolvido por `private.turma_do_aluno` (0049), que devolve nulo para pasta
-- de nome torto em vez de estourar.
--
-- A ação de excluir apaga os arquivos **antes** da linha: depois do delete a
-- pasta deixa de pertencer a aluno nenhum, e esta política não alcançaria mais.

create policy "avatares: personal apaga a foto do proprio aluno"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatares'
    and private.turma_do_aluno((storage.foldername(objects.name))[1]) = (select auth.uid())
  );

create policy "treinos: personal apaga a foto do proprio aluno"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'treinos'
    and private.turma_do_aluno((storage.foldername(objects.name))[1]) = (select auth.uid())
  );

create policy "reavaliacoes: personal apaga a foto do proprio aluno"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'reavaliacoes'
    and private.turma_do_aluno((storage.foldername(objects.name))[1]) = (select auth.uid())
  );
