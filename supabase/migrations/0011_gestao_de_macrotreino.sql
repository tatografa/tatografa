-- Reps Club · Fase 2 · Gestão de macrotreino: um ativo por aluno, arquivar sem
-- destruir, e a rotação agregada no banco.
--
-- O M1 criava o macrotreino de lado, no salvamento do primeiro treino. O M2 dá
-- tela a ele, e três coisas passam a precisar de garantia no banco:
--
--   1. "Só um programa ativo por aluno" deixa de ser convenção e vira índice.
--   2. Arquivar (mudar o status) é o caminho seguro; apagar programa com
--      histórico deixa de ser possível pela API.
--   3. "Quais treinos o aluno já fez nesta semana" é contagem que decide o que
--      a tela sugere, então é agregada aqui, não contada em memória.
--
-- Reversível: cada bloco tem o inverso no comentário. Nenhuma linha de treino,
-- prescrição ou série é alterada ou apagada — o único UPDATE de dado é o do
-- passo 1, que rebaixa status de programa duplicado (e o comentário diz como
-- desfazer).

-- ------------------------------------------- 1. um programa ativo por aluno --
--
-- O índice é parcial de propósito: arquivado pode haver quantos o personal
-- quiser; ativo, um só. Sem ele, dois cliques simultâneos em "ativar" deixam
-- dois programas ativos, e aí a home do aluno mostra o que vier primeiro na
-- ordenação — errado, e sem aviso nenhum. `lerAgendaDoAluno` e
-- `listarTreinosPorAluno` decidem o que aparece na tela por este campo.
--
-- Antes de criar o índice, rebaixa eventual duplicata mantendo a mais recente:
-- `create unique index` falha se já houver duas, e uma migration que não sobe
-- é pior que um dado arrumado. No banco atual não há nenhuma linha.
--
-- Desfazer: `drop index public.mesocycles_um_ativo_por_aluno_idx;`. O UPDATE
-- não se desfaz sozinho — mas ele só toca linhas que já violavam a regra.
update public.mesocycles m
   set status = 'arquivado'
 where m.status = 'ativo'
   and m.id <> (
     select m2.id from public.mesocycles m2
      where m2.student_id = m.student_id and m2.status = 'ativo'
      order by m2.created_at desc, m2.id desc
      limit 1
   );

create unique index mesocycles_um_ativo_por_aluno_idx
  on public.mesocycles (student_id)
  where status = 'ativo';

comment on index public.mesocycles_um_ativo_por_aluno_idx is
  'Um programa ativo por aluno. As telas do aluno escolhem o que mostrar por este campo: dois ativos seria a tela errada, em silêncio.';

-- ------------------------------- 2. escrita separada por operação -----------
--
--   Antes: uma policy `mesocycles_write ... for all`
--          using / with check (trainer_id = auth.uid() and private.trainer_of(student_id)).
--
-- A checagem de relacionamento (0007) continua igual e vale para insert e para
-- update — a convenção do projeto, depois do mesmo furo três vezes. O que muda
-- é o DELETE, que estava junto no `for all` e podia levar o histórico inteiro:
-- apagar um `mesocycles` derruba `workouts`, `workout_exercises` e
-- `session_sets` por cascata. Um programa que o aluno já treinou não se apaga —
-- se arquiva. Programa criado por engano, sem nenhuma sessão, continua
-- apagável, senão o personal ficaria com lixo permanente na tela.
--
-- Mesma forma da `workout_sessions_delete` da 0010: o dado que o personal não
-- consegue recuperar não sai por uma requisição só.
--
-- Desfazer: drop das quatro policies + a `mesocycles_write` do comentário acima.

create function private.mesociclo_tem_historico(p_mesocycle_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
      from public.workout_sessions ws
      join public.workouts w on w.id = ws.workout_id
     where w.mesocycle_id = p_mesocycle_id
  )
$$;

comment on function private.mesociclo_tem_historico(uuid) is
  'Há sessão executada em algum treino deste programa? Guarda do delete: cascata levaria as séries do aluno.';

-- O helper vive em `private` pela mesma razão dos outros: o PostgREST publica
-- como RPC toda função de `public`, e helper de autorização exposto é
-- superfície de ataque sem ganho.
revoke execute on function private.mesociclo_tem_historico(uuid) from public, anon;
grant execute on function private.mesociclo_tem_historico(uuid) to authenticated;

drop policy mesocycles_write on public.mesocycles;

create policy mesocycles_insert on public.mesocycles for insert to authenticated
  with check (trainer_id = auth.uid() and private.trainer_of(student_id));

create policy mesocycles_update on public.mesocycles for update to authenticated
  using (trainer_id = auth.uid() and private.trainer_of(student_id))
  with check (trainer_id = auth.uid() and private.trainer_of(student_id));

create policy mesocycles_delete on public.mesocycles for delete to authenticated
  using (
    trainer_id = auth.uid()
    and private.trainer_of(student_id)
    and not private.mesociclo_tem_historico(id)
  );

comment on policy mesocycles_insert on public.mesocycles is
  'Só o personal do próprio aluno cria programa: trainer_id sozinho deixa prescrever para aluno alheio (0007).';
comment on policy mesocycles_update on public.mesocycles is
  'O relacionamento é conferido no update também: senão insere legítimo e troca o student_id depois.';
comment on policy mesocycles_delete on public.mesocycles is
  'Programa com sessão executada não se apaga, se arquiva: o delete levaria as séries do aluno por cascata.';

-- --------------------------- 3. treinos feitos na semana, agregados ---------
--
-- A home sugere "o próximo da rotação que ainda não foi feito nesta semana".
-- Para decidir isso basta saber QUAIS treinos aparecem no período — não as
-- sessões, e muito menos as séries.
--
-- Trazer as sessões para agrupar em memória repetiria o erro da 0008: o corte
-- de página do PostgREST é silencioso, e uma lista truncada faria a tela
-- sugerir de novo um treino que o aluno já fez hoje. Aqui o estrago é pequeno,
-- mas o defeito é o mesmo e o custo de agregar é zero.
--
-- A fronteira chega como dois dias de calendário (`p_de` inclusivo, `p_ate`
-- exclusivo), derivados de `started_at` do programa em `lib/domain/rotacao.ts`.
-- A conversão para o fuso do produto acontece aqui porque o Postgres tem a
-- base de fusos e o TypeScript teria que chutar o offset: `started_at` é
-- `timestamptz`, e comparar em UTC jogaria a sessão das 21h para o dia
-- seguinte — o horário em que mais se treina (mesmo defeito da `semanaAtual`).
--
-- Só sessão CONCLUÍDA conta. Sessão em andamento não marca o treino como feito:
-- um treino que o aluno abriu e abandonou tem que continuar na fila.
--
-- `security invoker` (o padrão): o RLS de `workout_sessions` continua valendo,
-- então o aluno vê as próprias sessões e o personal as dos seus alunos.
create function public.treinos_feitos_na_semana(
  p_student_id uuid,
  p_de date,
  p_ate date
) returns table (workout_id uuid, total bigint)
  language sql
  stable
  set search_path = public
as $$
  select ws.workout_id, count(*)
    from public.workout_sessions ws
   where ws.student_id = p_student_id
     and ws.finished_at is not null
     and (ws.started_at at time zone 'America/Sao_Paulo')::date >= p_de
     and (ws.started_at at time zone 'America/Sao_Paulo')::date <  p_ate
   group by ws.workout_id
$$;

comment on function public.treinos_feitos_na_semana(uuid, date, date) is
  'Treinos concluídos pelo aluno no intervalo, agregados no banco. Fronteira em dia de calendário no fuso do produto.';

grant execute on function public.treinos_feitos_na_semana(uuid, date, date) to authenticated;
