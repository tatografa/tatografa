-- Reps Club · O status do aluno é decisão do personal
--
-- **O furo** (achado em 01/10, ao montar o botão "Pausar acesso"):
-- `students_update` deixa o aluno escrever na própria linha — é assim que ele
-- edita o perfil —, e nada restringia **qual coluna**. Um aluno pausado fazia
-- `update students set status = 'ativo' where id = <ele>` por um POST direto e
-- se reativava sozinho. Provado antes da correção: 1 linha afetada, status
-- `ativo`. Toda a trava da 0035 e da 0036 lê esse status, então ela era uma
-- porta trancada com a chave pendurada do lado de fora.
--
-- Oitava vez do formato que o CLAUDE.md descreve ("toda coluna que a trava lê
-- precisa estar no `with check`"), e a terceira em que a resposta é gatilho e
-- não policy: o `with check` vê só a linha nova e não sabe dizer "esta coluna
-- não pode **mudar** a não ser que quem escreve seja…". É a mesma forma de
-- `students_dado_do_corpo` (0034), com o papel invertido — lá só o aluno
-- escreve, aqui só o personal.
--
-- O personal que treina a si mesmo (13/09) continua podendo mudar o próprio
-- status: na linha dele, `trainer_id` é ele.

create function private.status_e_do_personal()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and (select auth.uid()) is distinct from old.trainer_id then
    raise exception 'Só o personal muda o status do aluno.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

comment on function private.status_e_do_personal() is
  'Só o personal do aluno pausa e reativa. Sem isto o aluno pausado se reativava por update na própria linha.';

create trigger students_status_e_do_personal
  before update on public.students
  for each row
  execute function private.status_e_do_personal();
