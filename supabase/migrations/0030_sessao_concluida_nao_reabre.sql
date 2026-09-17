-- Sessão concluída não reabre — a volta que faltava na trava de 02/09.
--
-- **O furo, em dois passos.** `workout_sessions_delete` exige
-- `finished_at is null`, e é essa a trava que sustenta a decisão de 02/09:
-- sessão concluída não se apaga, porque apagar levaria as séries por cascata e
-- quem perde a leitura é o personal. Só que `workout_sessions_update` **não
-- guarda `finished_at`**: o aluno zera a coluna, a sessão volta a ser "em
-- andamento" e o delete passa. Provado no banco de desenvolvimento: recusa no
-- primeiro delete, `update ... set finished_at = null` afetando 1 linha,
-- segundo delete afetando 1 linha, e a sessão com 12 séries desaparecida.
--
-- Não vaza dado de ninguém: o aluno apaga o **próprio** histórico. Mente para
-- quem depende dele — o personal abre a ficha e o treino ruim não está lá,
-- sem rastro de que existiu. Num produto cujo valor é o registro do que foi
-- levantado, é o mesmo tipo de estrago da 0022.
--
-- **Sexta vez que o mesmo formato aparece** (0007, 0009, 0010, 0019, 0022,
-- 0023), e a primeira em que a burla não é uma policy frouxa e sim **duas
-- policies certas que não conversam**: a de delete olha `finished_at`, a de
-- update não, e nenhuma das duas está errada sozinha.
--
-- **Por que gatilho e não policy.** É a mesma razão de `assessments_imutavel`
-- (0023): RLS não congela nada. O `using` enxerga a linha antiga e o
-- `with check` a nova, mas nenhum dos dois consegue dizer "o valor novo não
-- pode ser nulo **se** o antigo não era". Quem compara as duas é o gatilho.
--
-- **O que congela e o que não.** Congela o que é fato da execução e o personal
-- lê como verdade: quando começou, quando terminou, quanto durou, de qual
-- treino e de quem. Fica livre `notes` — a observação que o aluno escreve
-- sobre o próprio treino é a voz dele, e corrigir "ombro doeu" depois não
-- reescreve nenhum número que o personal usou para decidir. Mesma divisão da
-- 0026, onde a reavaliação congelou e as fotos continuaram apagáveis.

create or replace function private.sessao_concluida_imutavel()
  returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  -- Sessão em andamento não é assunto deste gatilho: ela ainda está sendo
  -- escrita, e é o `update` de conclusão que preenche `finished_at`.
  if old.finished_at is null then
    return new;
  end if;

  if new.finished_at is null then
    raise exception 'Sessão concluída não volta a ficar em andamento.'
      using errcode = 'check_violation';
  end if;

  if new.finished_at      is distinct from old.finished_at
     or new.started_at    is distinct from old.started_at
     or new.duration_seconds is distinct from old.duration_seconds
     or new.workout_id    is distinct from old.workout_id
     or new.student_id    is distinct from old.student_id then
    raise exception 'Sessão concluída não muda — só a observação.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger workout_sessions_imutavel
  before update on public.workout_sessions
  for each row execute function private.sessao_concluida_imutavel();

comment on function private.sessao_concluida_imutavel() is
  'Sessão concluída não reabre nem muda de fato — só a observação do aluno. Sem isto, zerar finished_at destrava o delete.';
