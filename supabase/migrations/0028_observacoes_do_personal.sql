-- Observações privadas do personal sobre o aluno (doc 06 §4).
--
-- O último item da ficha que o handoff pedia e nunca existiu. É onde o personal
-- anota o que não cabe em nenhum campo: "dor no ombro direito desde agosto",
-- "viajou duas semanas", "odeia agachamento, trocar por leg".
--
-- **Por que tabela própria e não coluna em `students`.** `students_select`
-- devolve ao aluno a própria linha inteira. Uma coluna `observacoes` ali seria
-- lida pelo aluno na primeira consulta que o app dele faz — e a anotação
-- profissional de quem treina alguém deixa de ser escrita com honestidade no
-- segundo em que o avaliado lê. A privacidade aqui não é enfeite: é o que faz
-- o campo ter uso.
--
-- **Por que `trainer_notes` e não `student_notes`.** Ao lado de
-- `student_measurements` (medidas *do* aluno, escritas *pelo* aluno), um
-- `student_notes` leria como "anotações do aluno". O nome diz de quem é a
-- caneta, que é justamente o que a policy trava.
--
-- **O que isto obriga fora do banco:** a política de privacidade passa a
-- declarar que existe essa anotação e que ela é do personal. Guardar dado sobre
-- uma pessoa sem dizer a ela que ele existe é o furo que a LGPD chama de falta
-- de transparência — e a regra escrita em `lib/legal/documentos.ts` é explícita:
-- "mudar o que se coleta" sobe a versão do documento.

create table public.trainer_notes (
  id         uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  body       text not null check (length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  -- Nulo enquanto a anotação não foi editada. A ficha mostra "editada" só
  -- quando há o que mostrar; um `updated_at` que nasce igual ao `created_at`
  -- obrigaria a tela a comparar dois instantes para descobrir a mesma coisa.
  updated_at timestamptz
);

comment on table public.trainer_notes is
  'Anotação do personal sobre o aluno. Privada: o aluno não tem policy de leitura aqui.';

-- A ficha lê por aluno, da mais recente para a mais antiga.
create index trainer_notes_student_idx
  on public.trainer_notes (student_id, created_at desc);

alter table public.trainer_notes enable row level security;

-- **Só o personal do aluno, e só as anotações que ele mesmo escreveu.**
--
-- As duas pontas, como em toda policy deste banco desde a 0007: `trainer_id`
-- sozinho deixaria ler anotação própria sobre aluno que não é mais seu, e
-- `trainer_of` sozinho deixaria um personal ler o que outro escreveu se o
-- vínculo do aluno mudasse de mãos. Hoje há um personal por aluno, então as
-- duas concordam sempre — e é exatamente por isso que só uma delas seria
-- escrita, e o furo só apareceria no dia em que o vínculo mudasse.
create policy trainer_notes_select on public.trainer_notes for select to authenticated
  using (
    trainer_id = (select auth.uid())
    and private.trainer_of(student_id)
  );

create policy trainer_notes_insert on public.trainer_notes for insert to authenticated
  with check (
    trainer_id = (select auth.uid())
    and private.trainer_of(student_id)
  );

-- O update repete as duas conferências no `with check`, não só no `using`:
-- um insert bem trancado não vale nada se o update reescreve `student_id` e
-- pendura a anotação na ficha de outra pessoa. É o furo das 0007, 0009, 0010,
-- 0019, 0022 e 0023, e ele volta toda vez que alguém escreve só o `using`.
create policy trainer_notes_update on public.trainer_notes for update to authenticated
  using (trainer_id = (select auth.uid()) and private.trainer_of(student_id))
  with check (trainer_id = (select auth.uid()) and private.trainer_of(student_id));

-- **Apagar é permitido, ao contrário de sessão e de reavaliação.** Lá o
-- registro fechado é histórico de que outra pessoa depende: o aluno perde a
-- evolução, o personal perde a comparação. Aqui a anotação é do personal sobre
-- o próprio trabalho, ninguém mais a lê, e nenhum número do produto sai dela.
-- Travar o delete só obrigaria a esvaziar o texto para fingir que sumiu.
create policy trainer_notes_delete on public.trainer_notes for delete to authenticated
  using (trainer_id = (select auth.uid()) and private.trainer_of(student_id));

-- **O aluno não tem policy nenhuma nesta tabela** — nem de leitura. Com RLS
-- ligado, a ausência é a proibição, e é assim que `term_acceptances` (0017)
-- proíbe update e delete. Não é descuido: é a trava, e está escrita aqui para
-- não ser "consertada" por engano numa migration futura.

comment on policy trainer_notes_select on public.trainer_notes is
  'Só o personal do aluno lê, e só o que ele escreveu. O aluno não tem policy de select aqui de propósito.';
comment on policy trainer_notes_delete on public.trainer_notes is
  'Apagar é do personal: a anotação é sobre o próprio trabalho dele e ninguém mais depende dela.';
