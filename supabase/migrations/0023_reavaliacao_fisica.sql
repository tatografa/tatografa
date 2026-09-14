-- Reavaliação física: o personal libera, o aluno responde.
--
-- Doc 03 do handoff define `assessments` e `student_measurements`; doc 05 §12 a
-- tela do aluno; doc 06 §9 a do personal. O que o handoff não diz — e é o que
-- esta migration decide — é **quem escreve o quê, e quando**.
--
-- O desenho é um formulário de mão dupla numa linha só:
--
--   1. O personal cria a linha com `released_at`. Nada mais. É o "libere para
--      mim" da tela dele.
--   2. O aluno preenche peso, percentual, medidas, fotos e observação, e fecha
--      com `submitted_at`.
--   3. Fechada, a linha congela para os dois.
--
-- Congelar importa porque o valor da reavaliação é a comparação com a
-- anterior: se o aluno reescreve a de março depois que o personal leu, a seta
-- "72,0 → 74,5 kg" que ele viu vira outra coisa sem aviso. É a mesma regra de
-- `workout_sessions`: registro fechado é histórico.
--
-- RLS sozinho não congela nada — ele olha a linha nova, não a antiga. Quem
-- compara é o gatilho no fim deste arquivo.

-- --------------------------------------------------------- as regiões ------
-- Ordem do enum é ordem de exibição: é por ela que a tela lista as medidas, em
-- vez de repetir uma lista de rótulos no cliente e outra no servidor. A ordem
-- é a do doc 03.
create type public.body_region as enum ('braco', 'peito', 'cintura', 'quadril', 'coxa');

comment on type public.body_region is
  'Regiões medidas na reavaliação. A ordem do enum é a ordem em que a tela mostra.';

-- -------------------------------------------------------- assessments ------
create table public.assessments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students (id) on delete cascade,
  -- Redundante com `students.trainer_id` de propósito: guarda **quem liberou**.
  -- Se o aluno trocar de personal um dia, a reavaliação continua sabendo de
  -- quem ela foi, e a policy de escrita não muda de dono retroativamente.
  trainer_id    uuid not null references public.trainers (id) on delete cascade,
  released_at   timestamptz not null default now(),
  submitted_at  timestamptz,
  weight_kg     numeric(5, 2) check (weight_kg > 0 and weight_kg < 500),
  body_fat_pct  numeric(4, 1) check (body_fat_pct > 0 and body_fat_pct < 70),
  photo_front_path text,
  photo_side_path  text,
  photo_back_path  text,
  notes         text check (notes is null or length(btrim(notes)) between 1 and 1000),
  created_at    timestamptz not null default now()
);

comment on table public.assessments is
  'Uma reavaliação física. Criada pelo personal (released_at), respondida pelo aluno (submitted_at). Congela ao ser respondida.';

comment on column public.assessments.trainer_id is
  'Quem liberou. Redundante com students.trainer_id para sobreviver a uma troca de personal.';

-- A lista do aluno e a comparação com a anterior leem por aluno, mais recente
-- primeiro.
create index assessments_student_idx on public.assessments (student_id, released_at desc);

-- A fila de trabalho do personal: pendentes primeiro.
create index assessments_trainer_idx on public.assessments (trainer_id, submitted_at, released_at desc);

-- **Uma reavaliação aberta por aluno é índice, não convenção.**
-- É por este campo que `/app/reavaliacao` decide o que mostrar: duas abertas
-- seria a tela errada em silêncio, e dois cliques do personal bastam para
-- criar as duas. Mesmo motivo de `mesocycles_um_ativo_por_aluno_idx`.
create unique index assessments_uma_aberta_por_aluno_idx
  on public.assessments (student_id)
  where submitted_at is null;

alter table public.assessments enable row level security;

-- O aluno dono e o personal dele. Ninguém mais — foto do corpo de uma pessoa é
-- o dado mais sensível que este banco guarda.
create policy assessments_select on public.assessments for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.trainer_of(student_id)
  );

-- **As duas pontas do relacionamento no `with check`**, não só a que aponta
-- para quem escreve. `trainer_id = auth.uid()` sozinho deixaria um personal
-- qualquer liberar reavaliação para aluno alheio — e aluno alheio abriria o
-- app com um formulário pedindo as medidas dele. Foi o mesmo furo nas
-- migrations 0007, 0009, 0010, 0019 e 0022.
create policy assessments_insert on public.assessments for insert to authenticated
  with check (
    trainer_id = (select auth.uid())
    and private.trainer_of(student_id)
  );

-- Quem responde é o aluno. O personal não escreve resposta nenhuma: as medidas
-- são do corpo dele e o número tem que vir de quem mediu.
--
-- O `using` recusa mexer em linha já fechada; o `with check` recusa pendurar a
-- linha em outro aluno. O que impede o aluno de reabrir a própria linha
-- (`submitted_at = null`) ou de adiantar `released_at` é o gatilho — RLS não
-- enxerga o valor antigo.
create policy assessments_update on public.assessments for update to authenticated
  using (student_id = (select auth.uid()) and submitted_at is null)
  with check (student_id = (select auth.uid()));

-- Liberou por engano, tira. Respondida não se apaga: o delete levaria as
-- medidas por cascata, e quem perde a leitura é o personal — mesma decisão de
-- `workout_sessions_delete`.
create policy assessments_delete on public.assessments for delete to authenticated
  using (trainer_id = (select auth.uid()) and submitted_at is null);

-- ------------------------------------------------ student_measurements -----
create table public.student_measurements (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  region        public.body_region not null,
  value_cm      numeric(5, 1) not null check (value_cm > 0 and value_cm < 300),
  primary key (assessment_id, region)
);

comment on table public.student_measurements is
  'Medida de uma região numa reavaliação. Tabela separada (doc 03) para comparar séries históricas sem mexer no schema.';

alter table public.student_measurements enable row level security;

-- A medida herda a autorização da reavaliação — inclusive o congelamento.
-- Helper em `private` porque o PostgREST publica como RPC toda função de
-- `public`, e helper de autorização exposto é superfície sem ganho.
create or replace function private.pode_ver_reavaliacao(p_assessment_id uuid)
  returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.assessments a
     where a.id = p_assessment_id
       and (a.student_id = auth.uid() or private.trainer_of(a.student_id))
  )
$$;

-- Escrever medida é responder: só o aluno dono, e só enquanto está aberta.
create or replace function private.pode_medir(p_assessment_id uuid)
  returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.assessments a
     where a.id = p_assessment_id
       and a.student_id = auth.uid()
       and a.submitted_at is null
  )
$$;

-- Revoga de `public` e `anon`, concede a `authenticated`: a policy roda como
-- quem consulta, então sem o `execute` ninguém enxerga nada. O que mantém o
-- helper fora da API é o schema `private` não ser publicado — não a revogação.
revoke all on function private.pode_ver_reavaliacao(uuid), private.pode_medir(uuid)
  from public, anon;
grant execute on function private.pode_ver_reavaliacao(uuid), private.pode_medir(uuid)
  to authenticated;

create policy student_measurements_select on public.student_measurements
  for select to authenticated
  using (private.pode_ver_reavaliacao(assessment_id));

-- `assessment_id` no `with check` do insert **e** do update: um insert bem
-- trancado não vale nada se o update reescreve a mesma coluna e joga a medida
-- na reavaliação de outra pessoa.
create policy student_measurements_insert on public.student_measurements
  for insert to authenticated
  with check (private.pode_medir(assessment_id));

create policy student_measurements_update on public.student_measurements
  for update to authenticated
  using (private.pode_medir(assessment_id))
  with check (private.pode_medir(assessment_id));

create policy student_measurements_delete on public.student_measurements
  for delete to authenticated
  using (private.pode_medir(assessment_id));

-- ------------------------------------------- o que não muda depois ---------
-- RLS compara a linha nova com uma condição; não compara com a linha antiga.
-- Tudo que é "não pode mudar de valor" mora aqui.
create or replace function private.reavaliacao_imutavel()
  returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  -- Dono e autor não se transferem. A policy já prende `student_id` a quem
  -- escreve; isto prende também para o dia em que alguém acrescentar outra
  -- policy de update por um caminho que não pensou nisso.
  if new.student_id is distinct from old.student_id
     or new.trainer_id is distinct from old.trainer_id then
    raise exception 'Reavaliação não muda de aluno nem de personal.';
  end if;

  -- Quem libera é o personal. Sem isto o aluno adiantaria a própria data.
  if new.released_at is distinct from old.released_at then
    raise exception 'A data de liberação é do personal.';
  end if;

  -- Fechar é de mão única. Reabrir apagaria a leitura que o personal já fez.
  if old.submitted_at is not null then
    raise exception 'Reavaliação já enviada não muda.';
  end if;

  return new;
end;
$$;

create trigger assessments_imutavel
  before update on public.assessments
  for each row execute function private.reavaliacao_imutavel();

-- Medida de reavaliação fechada também não muda. A policy de escrita já
-- recusa, mas um futuro caminho `security definer` passaria por cima dela — e
-- aqui o custo de repetir é uma linha.
--
-- `TG_OP` em vez de `coalesce(new, old)`: em gatilho de INSERT o PL/pgSQL não
-- atribui `old`, e ler o campo dele levanta erro em vez de devolver nulo.
create or replace function private.medida_imutavel()
  returns trigger
  language plpgsql security definer set search_path = public
as $$
declare
  v_assessment_id uuid;
  v_fechada       boolean;
begin
  v_assessment_id := case tg_op when 'DELETE' then old.assessment_id else new.assessment_id end;

  -- Nulo quando a reavaliação já saiu — é a cascata do delete da linha-pai
  -- passando por aqui, e ela não é uma edição.
  select a.submitted_at is not null into v_fechada
    from public.assessments a
   where a.id = v_assessment_id;

  if coalesce(v_fechada, false) then
    raise exception 'Reavaliação já enviada não muda.';
  end if;

  return case tg_op when 'DELETE' then old else new end;
end;
$$;

create trigger student_measurements_imutavel
  before insert or update or delete on public.student_measurements
  for each row execute function private.medida_imutavel();

-- --------------------------------------------- enviar, de uma vez ---------
-- Responder a reavaliação são N medidas **e** o fechamento da linha. Em passos
-- soltos, uma falha no meio deixa metade das medidas gravadas e a reavaliação
-- ainda aberta — o aluno reabre a tela e não sabe o que já foi. É a mesma
-- razão de `ativar_macrotreino` (0012) ser uma transação só.
--
-- `security invoker` de propósito: a função **é** API (o PostgREST publica), e
-- o que a autoriza é o RLS das duas tabelas rodando como o aluno que chamou.
-- Nada aqui confere permissão; se as policies deixarem passar algo, o erro é
-- delas, e é um lugar só para consertar.
create or replace function public.enviar_reavaliacao(
  p_assessment_id  uuid,
  p_weight_kg      numeric,
  p_body_fat_pct   numeric,
  p_notes          text,
  p_medidas        jsonb,
  p_photo_front    text,
  p_photo_side     text,
  p_photo_back     text
) returns void
  language plpgsql
  set search_path = public
as $$
declare
  v_linhas integer;
begin
  -- Regravar do zero, e não `upsert`: `student_measurements` não tem histórico
  -- dentro da reavaliação, e região que o aluno apagou do formulário tem que
  -- sumir. O delete e o insert veem a linha ainda aberta — o fechamento é a
  -- última coisa que acontece.
  delete from public.student_measurements where assessment_id = p_assessment_id;

  insert into public.student_measurements (assessment_id, region, value_cm)
  select p_assessment_id, (chave)::public.body_region, (valor #>> '{}')::numeric
    from jsonb_each(coalesce(p_medidas, '{}'::jsonb)) as m(chave, valor)
   where valor #>> '{}' is not null;

  update public.assessments
     set weight_kg        = p_weight_kg,
         body_fat_pct     = p_body_fat_pct,
         notes            = nullif(btrim(coalesce(p_notes, '')), ''),
         photo_front_path = p_photo_front,
         photo_side_path  = p_photo_side,
         photo_back_path  = p_photo_back,
         submitted_at     = now()
   where id = p_assessment_id;

  get diagnostics v_linhas = row_count;

  -- Update recusado pelo RLS não levanta erro: afeta zero linhas em silêncio.
  -- Sem esta conferência, o aluno veria "enviado" e nada teria sido gravado.
  if v_linhas = 0 then
    raise exception 'Reavaliação não encontrada ou já enviada.';
  end if;
end;
$$;

revoke all on function public.enviar_reavaliacao(uuid, numeric, numeric, text, jsonb, text, text, text)
  from public, anon;
grant execute on function public.enviar_reavaliacao(uuid, numeric, numeric, text, jsonb, text, text, text)
  to authenticated;

-- ------------------------------------------------ fotos, no Storage --------
-- Bucket **privado e separado do `treinos`**. Não é organização: é a regra do
-- doc 02 — "fotos de reavaliação são dados sensíveis, só o aluno e o personal
-- dele acessam, e nunca aparecem no feed automaticamente". No bucket do feed,
-- a policy de leitura casa o caminho com `posts.photo_path`; um caminho solto
-- lá dentro seria visível só ao dono, mas o personal não veria — e misturar as
-- duas regras num bucket só é como uma afrouxa a outra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reavaliacoes', 'reavaliacoes', false,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Caminho: `<student_id>/<assessment_id>/<slot>.jpg` (doc 02). O primeiro
-- segmento amarra a foto ao dono sem consultar tabela nenhuma na escrita.
create policy "reavaliacoes: aluno escreve na propria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'reavaliacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "reavaliacoes: aluno troca a propria foto"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'reavaliacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'reavaliacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "reavaliacoes: aluno apaga a propria foto"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'reavaliacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Ler: o aluno dono, ou o personal dele.
--
-- A comparação é `pasta = s.id::text`, e não `pasta::uuid = s.id`: pasta com
-- nome que não é uuid derrubaria a consulta inteira no cast, e quem escolhe o
-- nome do arquivo é quem sobe.
create policy "reavaliacoes: ve a propria foto ou a do proprio aluno"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'reavaliacoes'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.students s
         where s.trainer_id = (select auth.uid())
           and (storage.foldername(name))[1] = s.id::text
      )
    )
  );
