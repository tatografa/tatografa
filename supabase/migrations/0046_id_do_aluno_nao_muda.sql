-- Reps Club · O id do aluno não muda
--
-- **O furo** (achado em 06/10, na análise de segurança): `students_update`
-- confere `trainer_id` no `with check` e deixa `id` solto. O personal pegava
-- uma linha da própria carteira que ainda não tinha nada pendurado (programa,
-- sessão, post…) e fazia `update students set id = <outra conta>`: a outra
-- conta virava aluno dele **sem convite nenhum**. Provado antes da correção:
-- o update passou e o personal passou a ler a linha com o id alheio.
-- Valia contra toda conta sem linha em `students` — outro personal, ou o aluno
-- que um personal excluiu (e cujas fotos de reavaliação ficam no storage, na
-- pasta com o id dele, legíveis por quem for "personal" daquele id).
--
-- É a mesma porta da 0019 (que trancou o `insert`), pelo `update`: nona vez do
-- formato "toda coluna que aponta para o relacionamento precisa estar presa
-- nos dois". E a quarta em que a resposta é gatilho: o `with check` vê só a
-- linha nova e não sabe dizer "esta coluna não pode mudar".
--
-- Sem exceção por papel: `students.id` **é** o id de `auth.users`, e nenhum
-- fluxo do produto troca isso. As chaves que apontam para `students(id)` não
-- têm `on update`, então com histórico a troca já falhava; sem histórico ela
-- passava em silêncio.

create function private.id_do_aluno_nao_muda()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'O aluno não muda de conta.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

comment on function private.id_do_aluno_nao_muda() is
  'students.id é o id da conta (auth.users). Sem isto o personal repontava uma linha vazia da carteira para uma conta alheia e a alistava sem convite.';

create trigger students_id_nao_muda
  before update on public.students
  for each row
  execute function private.id_do_aluno_nao_muda();
