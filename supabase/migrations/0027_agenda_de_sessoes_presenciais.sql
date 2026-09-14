-- Agenda de sessões presenciais (doc 03, doc 06 §7).
--
-- A última tabela do handoff que nunca existiu. O comentário da 0001 já dizia
-- "medidas e agenda entram nas fases 2-3, junto com as telas que as usam" — e
-- é essa a regra que vale: ela entra agora porque a tela entra agora.
--
-- **O que esta agenda é:** o registro de quem veio. O personal marca a sessão,
-- e depois marca se ela aconteceu, se o aluno faltou ou se foi cancelada. O
-- valor não está em lembrar o horário — isso o WhatsApp já faz — e sim em
-- **ter a presença registrada** ao lado do que o aluno levantou.
--
-- **O que ela não é:** convite. O aluno não aceita nem recusa; quem combina
-- horário são duas pessoas conversando, e transformar isso em fluxo de
-- aprovação dentro do app criaria um estado ("pendente de aceite") que discorda
-- do que já foi combinado por mensagem.

create type public.appointment_status as enum (
  'agendada', 'realizada', 'faltou', 'cancelada'
);

comment on type public.appointment_status is
  'Situação da sessão presencial. Nasce agendada; o personal fecha em realizada, faltou ou cancelada.';

create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  trainer_id       uuid not null references public.trainers (id) on delete cascade,
  student_id       uuid not null references public.students (id) on delete cascade,
  -- Instante, não dia: a sessão é às 18h de quinta. O agrupamento por dia é
  -- feito no fuso do produto (`lib/domain/fuso.ts`), nunca no do processo —
  -- às 21h no Brasil o servidor em UTC já virou o dia seguinte.
  starts_at        timestamptz not null,
  duration_minutes integer not null default 60
    check (duration_minutes between 10 and 480),
  status           public.appointment_status not null default 'agendada',
  notes            text check (notes is null or length(btrim(notes)) between 1 and 500),
  created_at       timestamptz not null default now()
);

comment on table public.appointments is
  'Sessão presencial entre personal e aluno. Marcada e fechada pelo personal; o aluno lê a própria.';

-- A tela é uma semana do personal: filtra por ele e por faixa de instante.
create index appointments_trainer_idx on public.appointments (trainer_id, starts_at);

-- A ficha do aluno e a linha "sua próxima sessão" leem por aluno.
create index appointments_student_idx on public.appointments (student_id, starts_at);

-- **Sem trava de horário sobreposto, de propósito.** Duas sessões no mesmo
-- horário podem ser um erro de digitação ou dois alunos treinando juntos — e o
-- banco não sabe qual. Quem sabe é o personal, então o conflito é **mostrado
-- pela tela** e ele decide. Constraint de exclusão aqui recusaria o atendimento
-- em dupla, que é comum, para evitar um engano que ele enxerga na hora.

alter table public.appointments enable row level security;

-- O personal da sessão e o aluno dela. O aluno **lê** para saber quando é a
-- próxima; quem escreve é só o personal.
create policy appointments_select on public.appointments for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.trainer_of(student_id)
  );

-- **As duas pontas do relacionamento no `with check`**, não só a que aponta
-- para quem escreve. `trainer_id = auth.uid()` sozinho deixaria um personal
-- qualquer agendar na agenda de aluno alheio — e esse aluno veria, no app
-- dele, uma sessão marcada por um estranho. Sexta vez que este formato aparece
-- neste banco, depois das migrations 0007, 0009, 0010, 0019, 0022 e 0023.
create policy appointments_insert on public.appointments for insert to authenticated
  with check (
    trainer_id = (select auth.uid())
    and private.trainer_of(student_id)
  );

-- O update repete as duas conferências: um insert bem trancado não vale nada
-- se o update reescreve `student_id` e joga a sessão na agenda de outra pessoa.
-- É literalmente o furo da 0007, e ele volta toda vez que alguém escreve só o
-- `using`.
create policy appointments_update on public.appointments for update to authenticated
  using (trainer_id = (select auth.uid()) and private.trainer_of(student_id))
  with check (trainer_id = (select auth.uid()) and private.trainer_of(student_id));

-- Apagar é do personal. **Sessão já fechada não se apaga**: "faltou" é o
-- registro mais incômodo da agenda e justamente por isso o mais fácil de querer
-- sumir depois — e é ele que dá sentido à aderência que o painel mostra.
-- Cancelar continua sendo um status, que é o jeito honesto de desmarcar.
create policy appointments_delete on public.appointments for delete to authenticated
  using (
    trainer_id = (select auth.uid())
    and private.trainer_of(student_id)
    and status = 'agendada'
  );

-- O aluno não escreve nada aqui: não há policy de insert, update ou delete
-- para ele. Marcar presença é do personal — o aluno marcando a própria
-- presença é o mesmo que ele assinar a própria chamada.
