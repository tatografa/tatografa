-- Reps Club · Fase 3 · O personal também treina: aluno de si mesmo
--
-- Decisão do Otávio (13/09): o personal **não publica no feed como personal**.
-- Em vez disso ele vira aluno dele mesmo — uma linha em `students` com
-- `id = trainer_id = o próprio usuário`. A partir daí monta o próprio
-- macrotreino pelo painel, executa pelo app do aluno e posta como qualquer
-- outro aluno da turma.
--
-- Isso resolve o desencontro entre o doc 05 (que pede um selo "PERSONAL" no
-- post do personal) e a policy `posts_insert` da 0018 (que exige
-- `student_id = auth.uid()`, isto é, só aluno publica). O selo continua
-- possível e não custa consulta nenhuma: o único personal da turma é o
-- `trainer_id` do aluno, então a tela compara o autor com ele.
--
-- Nada disso precisa de tabela nova. `students.id` já é o id de `auth.users` e
-- `students.trainer_id` aponta para `trainers.id`: o mesmo uuid nas duas
-- colunas é uma linha perfeitamente válida. Faltava só a permissão.
--
-- E a permissão que falta é, literalmente, a mesma linha que fecha um furo.

-- ------------------------------------------ students_insert: só a si mesmo --
--
--   Antes (0010): with check (trainer_id = auth.uid())
--
-- **O furo.** `id` entrava sem checagem nenhuma. Um personal podia inserir
-- `students (id = <id de outro usuário>, trainer_id = si mesmo)` por um POST
-- direto e alistar um estranho na própria carteira — sem convite e sem que a
-- vítima soubesse. Bastava a vítima ainda não ter linha em `students` (a chave
-- primária barra quem já é aluno de alguém): serve qualquer outro personal e
-- qualquer conta recém-criada. Alistado, o atacante lê o perfil dela por
-- `students_select`, as sessões por `private.trainer_of` e os posts por
-- `private.pode_ver_post` (0018).
--
-- **A correção e a permissão nova são a mesma condição:** `id = auth.uid()`.
-- O personal só cria linha de aluno para si mesmo.
--
-- **Cuidado ao comparar com a 0010.** Ela removeu desta mesma policy um ramo
-- `id = auth.uid()`, e o que volta aqui *parece* o que ela tirou. Não é: lá era
-- `or`, aqui é `and`. Com `or`, o `trainer_id` ficava livre e qualquer usuário
-- se alistava na carteira de um personal qualquer — o furo que a 0010 fechou.
-- Com `and`, as duas colunas ficam presas ao mesmo usuário: quem entra é você e
-- o personal é você. **Trocar este `and` por `or` reabre a 0010.**
--
-- O aluno de verdade continua nascendo no gatilho `private.handle_new_user`
-- (0006), que é `security definer` e não passa por policy. Nenhum caminho do
-- app insere em `students` pelo cliente — conferido antes de escrever isto.
--
-- Quem não é personal não consegue usar a brecha nova: `trainer_id` referencia
-- `public.trainers`, e sem linha lá a chave estrangeira barra.
drop policy students_insert on public.students;

create policy students_insert on public.students for insert to authenticated
  with check (id = auth.uid() and trainer_id = auth.uid());

comment on policy students_insert on public.students is
  'Só o personal virando aluno de si mesmo. O aluno de verdade nasce no gatilho, que não passa por policy. O `and` é a trava: com `or`, o trainer_id ficaria livre (furo da 0010).';
