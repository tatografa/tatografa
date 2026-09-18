-- Reps Club · Dashboard · As três agregações dos gráficos do protótipo
--
-- O doc 06 §2 desenha três gráficos que o painel nunca teve: evolução mensal da
-- carteira, atividade diária e as maiores progressões de carga. Os três são
-- **agregação sobre a carteira inteira**, e é por isso que moram aqui e não na
-- camada de dados: o corte de página do PostgREST é silencioso, e uma página
-- perdida de `session_sets` faria um gráfico desenhar menos treino do que
-- aconteceu — número errado com cara de certo, que é o pior defeito possível
-- numa tela de leitura.
--
-- As três são `security invoker` (o padrão), como `sessoes_na_semana`
-- (migration 0015): leem com as permissões de quem chamou, então o personal vê
-- a própria carteira, o aluno veria só a si mesmo, e nenhuma delas alarga o
-- acesso de ninguém. Nenhuma recebe id de personal — quem define "a carteira"
-- é o RLS, não um parâmetro que o cliente escolhe.
--
-- Toda fronteira de dia é `at time zone 'America/Sao_Paulo'`, igual às outras:
-- o servidor roda em UTC, e às 21h no Brasil já virou o dia seguinte — que é
-- exatamente o horário em que se treina.

-- ------------------------------------------------------ alunos por mês -----
--
-- O tamanho da carteira ao **fim** de cada mês, não quantos entraram no mês.
-- São perguntas diferentes e a segunda é ruim aqui: com um aluno novo em março
-- e nenhum em abril, "novos por mês" desenha uma queda onde não houve perda
-- nenhuma. O acumulado responde o que o personal quer saber olhando — "estou
-- crescendo?".
--
-- O mês entra por `generate_series` e não pelo `group by` dos cadastros: mês
-- sem nenhuma entrada precisa aparecer com o mesmo total do anterior, senão o
-- eixo pula de janeiro para março e a linha mente sobre a inclinação.

create function public.alunos_por_mes(p_meses int default 12)
  returns table (mes date, total bigint)
  language sql
  stable
  set search_path = public
as $$
  with limites as (
    select least(greatest(coalesce(p_meses, 12), 1), 36) as meses,
           date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date as atual
  ),
  meses as (
    select generate_series(
             (l.atual - make_interval(months => l.meses - 1))::date,
             l.atual,
             interval '1 month'
           )::date as mes
      from limites l
  )
  select m.mes,
         count(s.id)
    from meses m
    left join public.students s
      on (s.created_at at time zone 'America/Sao_Paulo')::date
         < (m.mes + interval '1 month')::date
   group by m.mes
   order by m.mes
$$;

comment on function public.alunos_por_mes(int) is
  'Tamanho acumulado da carteira ao fim de cada mês, para a carteira que o RLS liberar. Mês sem entrada repete o total anterior.';

grant execute on function public.alunos_por_mes(int) to authenticated;

-- ----------------------------------------------------- sessões por dia -----
--
-- Dia sem treino vale tanto quanto dia com: é o buraco que mostra que a
-- carteira parou. Por isso o eixo sai de `generate_series` e o `count` vem de
-- um `left join` — agrupar só os dias que existem desenharia uma sequência
-- contínua de treinos que nunca houve.
--
-- Mesma fronteira das irmãs: a sessão pertence ao dia em que **começou**.

create function public.sessoes_por_dia(p_de date, p_ate date)
  returns table (dia date, total bigint)
  language sql
  stable
  set search_path = public
as $$
  with dias as (
    select generate_series(p_de, p_ate - 1, interval '1 day')::date as dia
  )
  select d.dia,
         count(ws.id)
    from dias d
    left join public.workout_sessions ws
      on ws.finished_at is not null
     and (ws.started_at at time zone 'America/Sao_Paulo')::date = d.dia
   group by d.dia
   order by d.dia
$$;

comment on function public.sessoes_por_dia(date, date) is
  'Sessões concluídas por dia de calendário no intervalo [p_de, p_ate), com os dias vazios inclusos. Carteira definida pelo RLS.';

grant execute on function public.sessoes_por_dia(date, date) to authenticated;

-- -------------------------------------------------------- progressões ------
--
-- As maiores evoluções de carga da carteira, por par (aluno, exercício).
--
-- **Agrupa por `(exercise_source, exercise_id)`, nunca por
-- `workout_exercise_id`** — este último é uma linha de prescrição, e existe uma
-- por treino e outra a cada programa novo. Agrupar por ele faria a progressão
-- do supino recomeçar do zero a cada macrotreino, que é o oposto do que o
-- gráfico existe para mostrar. É a mesma regra do histórico por exercício.
--
-- A comparação é entre a **sessão mais antiga e a mais recente da janela**, e
-- dentro de cada uma vale a série mais pesada — o mesmo critério do recorde
-- pessoal (decisão do Otávio, 02/09: recorde é a maior carga, independente das
-- repetições). Duas contas diferentes para "quanto ele evoluiu" fariam esta
-- tela discordar da que o aluno vê.
--
-- Três exclusões, cada uma por um motivo:
--   · série pulada e carga nula não entram — o exercício de peso corporal não
--     tem carga para comparar, e pular não é levantar;
--   · par com uma sessão só fica de fora: não há de onde para onde;
--   · carga inicial zero sairia como aumento infinito, e não é progressão de
--     carga, é começar a usar peso.
--
-- Só sobe quem subiu (`carga_final > carga_inicial`). Uma lista chamada "as
-- maiores progressões" que mostra quedas quando faltam dez é uma lista que
-- mente pelo título — o vazio diz a verdade melhor.
--
-- A ordem é por **percentual**, com o ganho absoluto desempatando. Em quilos, o
-- agachamento ganharia de toda rosca direta todo mês, e a lista viraria um
-- ranking de exercício pesado em vez de um de evolução.

create function public.progressoes_da_carteira(p_desde date, p_limite int default 10)
  returns table (
    student_id uuid,
    aluno text,
    exercise_source public.exercise_source,
    exercise_id uuid,
    exercicio text,
    carga_inicial numeric,
    carga_final numeric,
    sessoes bigint,
    primeira_em timestamptz,
    ultima_em timestamptz
  )
  language sql
  stable
  set search_path = public
as $$
  with por_sessao as (
    select ws.student_id,
           we.exercise_source,
           we.exercise_id,
           ws.id as session_id,
           ws.finished_at,
           max(ss.load_kg) as carga
      from public.session_sets ss
      join public.workout_exercises we on we.id = ss.workout_exercise_id
      join public.workout_sessions ws on ws.id = ss.session_id
     where ws.finished_at is not null
       and (ws.started_at at time zone 'America/Sao_Paulo')::date >= p_desde
       and ss.skipped = false
       and ss.load_kg is not null
     group by ws.student_id, we.exercise_source, we.exercise_id, ws.id, ws.finished_at
  ),
  extremos as (
    select p.student_id,
           p.exercise_source,
           p.exercise_id,
           count(*) as sessoes,
           min(p.finished_at) as primeira_em,
           max(p.finished_at) as ultima_em,
           (array_agg(p.carga order by p.finished_at asc))[1] as carga_inicial,
           (array_agg(p.carga order by p.finished_at desc))[1] as carga_final
      from por_sessao p
     group by p.student_id, p.exercise_source, p.exercise_id
    having count(*) >= 2
  )
  select e.student_id,
         s.name,
         e.exercise_source,
         e.exercise_id,
         -- O nome sai de uma das duas tabelas de exercício, conforme a origem.
         -- Prescrição apontando para exercício apagado não some da lista: o
         -- aluno levantou aquele peso, e o registro é dele.
         coalesce(cat.name, pro.name, 'Exercício removido') as exercicio,
         e.carga_inicial,
         e.carga_final,
         e.sessoes,
         e.primeira_em,
         e.ultima_em
    from extremos e
    join public.students s on s.id = e.student_id
    left join public.exercises_catalog cat
      on e.exercise_source = 'catalog' and cat.id = e.exercise_id
    left join public.exercises pro
      on e.exercise_source = 'custom' and pro.id = e.exercise_id
   where e.carga_inicial > 0
     and e.carga_final > e.carga_inicial
   order by (e.carga_final - e.carga_inicial) / e.carga_inicial desc,
            (e.carga_final - e.carga_inicial) desc,
            s.name asc
   limit least(greatest(coalesce(p_limite, 10), 1), 50)
$$;

comment on function public.progressoes_da_carteira(date, int) is
  'Maiores evoluções de carga por (aluno, exercício) desde p_desde, ordenadas por percentual. Agrupa pela identidade do exercício, não pela linha de prescrição. Carteira definida pelo RLS.';

grant execute on function public.progressoes_da_carteira(date, int) to authenticated;
