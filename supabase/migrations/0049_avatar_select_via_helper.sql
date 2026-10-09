-- Reps Club · Avatar: a leitura via helper em `private`
--
-- A policy que a 0048 escreveu continha
-- `(storage.foldername(name))[1]` dentro de um `exists ... from students s`.
-- O planner resolveu o `name` solto como `s.name` — porque `students.name` existe
-- e a lista do `from` é visível ao expression —, e a policy virou
-- `storage.foldername(s.name)`, que lê a coluna errada. Resultado: **nem o
-- personal via a foto do aluno**, nem o colega. Achado nas provas da 0048 (L2
-- "personal lê foto do aluno" devolveu 0 linhas em vez de 1).
--
-- A correção certa é tirar a dependência da policy em `students`: um helper
-- em `private` com `security definer` responde "qual é o trainer_id do aluno
-- dono desta pasta" sem passar pelo RLS de `students_select` (que também
-- esconde o colega do colega). Mesma solução de `private.pode_ver_post` e
-- `private.minha_turma`.
--
-- Aceita text e devolve nulo em caso de id torto: nome de pasta é texto livre
-- no banco, e um `cast ... as uuid` numa pasta criada à mão estouraria a
-- policy inteira.
--
-- **Aplicada em dois tempos.** A função entrou em 07/10; a política, só em
-- 09/10: o `drop policy` pede a confirmação de destrutivo que a sessão remota
-- não consegue dar (como na 0045), e `alter policy` troca a expressão sem
-- apagar nada — passou de primeira. Nove provas: dono, personal, colega e o
-- personal-aluno lendo; outro personal, personal sem aluno e anon recusados;
-- pasta com nome torto sem estourar.

create function private.turma_do_aluno(p_id text) returns uuid
  language plpgsql
  stable
  security definer
  set search_path = public
as $$
declare
  v_uuid uuid;
begin
  begin
    v_uuid := p_id::uuid;
  exception when invalid_text_representation then
    return null;
  end;
  return (select s.trainer_id from public.students s where s.id = v_uuid);
end;
$$;

revoke all on function private.turma_do_aluno(text) from public, anon, authenticated;
grant execute on function private.turma_do_aluno(text) to authenticated;

comment on function private.turma_do_aluno(text) is
  'Trainer_id do aluno dono da pasta de avatar. security definer para o personal e o colega de turma passarem pela policy sem precisar ler students.';

alter policy "avatares: dono, personal ou colega de turma" on storage.objects
  using (
    bucket_id = 'avatares'
    and (
      (storage.foldername(objects.name))[1] = (select auth.uid())::text
      or private.turma_do_aluno((storage.foldername(objects.name))[1]) = (select auth.uid())
      or (
        private.minha_turma() is not null
        and private.turma_do_aluno((storage.foldername(objects.name))[1]) = private.minha_turma()
      )
    )
  );
