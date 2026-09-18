-- Reps Club · Perfil do aluno · telefone, cidade, perfil biológico e meta de peso
--
-- Os quatro campos que a ficha do doc 06 §4 mostra e que o banco não tinha.
-- Decisões do Otávio (18/09), cada uma com uma consequência diferente aqui.
--
-- **`biological_profile` é dado de saúde sensível pela LGPD.** Não é mais um
-- campo de cadastro: saber que alguém faz reposição hormonal é informação sobre
-- a saúde da pessoa, e guardar isso obriga a declarar no texto legal — o que a
-- migration sozinha não faz. A política de privacidade e os termos passam a
-- declarar os quatro campos, `VERSAO_DOS_DOCUMENTOS` sobe e todo mundo passa
-- pelo portão de re-aceite. É a mesma regra da anotação do personal (17/09):
-- tela que coleta sem o texto declarar é o defeito de cabeça para baixo.
--
-- **Não existe valor `nao_informado` no enum.** "Não informado" é a ausência do
-- dado, e é isso que `null` quer dizer. Um quarto valor faria o banco guardar
-- uma afirmação ("esta pessoa declarou que prefere não dizer") onde só há
-- silêncio, e as duas coisas se contariam separado no dia em que alguém somar.

create type public.biological_profile as enum ('natural', 'reposicao', 'hormonizado');

comment on type public.biological_profile is
  'Dado de saúde sensível (LGPD). Nulo = não informado; não há valor para isso no enum.';

alter table public.students
  add column phone text,
  add column city text,
  add column state text,
  add column biological_profile public.biological_profile,
  add column weight_goal_kg numeric(5,2);

-- Só dígitos e sem o 55, igual a `trainers.phone` — o mesmo número digitado
-- com e sem código do país precisa virar a mesma linha, e é a leitura que
-- recoloca o 55 ao montar o link do WhatsApp (`lib/domain/telefone.ts`).
-- Aqui o check existe e em `trainers.phone` não: aquela coluna é de 2026-08-23
-- e a regra vivia só no zod. Uma trava a mais não conserta a outra, mas
-- também não é motivo para nascer torta.
alter table public.students
  add constraint students_phone_valido
    check (phone is null or phone ~ '^[0-9]{10,15}$');

alter table public.students
  add constraint students_city_valida
    check (city is null or length(btrim(city)) between 1 and 80);

alter table public.students
  add constraint students_state_valido
    check (state is null or state in (
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
      'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    ));

-- Os mesmos limites de `weight_kg` (migration 0006): é a mesma grandeza, e
-- uma meta que o peso atual não poderia alcançar seria uma barra sem fim.
alter table public.students
  add constraint students_weight_goal_valida
    check (weight_goal_kg is null or (weight_goal_kg > 0 and weight_goal_kg < 500));

comment on column public.students.phone is
  'WhatsApp do aluno, só dígitos e sem o 55. Fecha a volta do contato: o aluno já tinha o botão do personal.';
comment on column public.students.city is 'Cidade informada pelo aluno.';
comment on column public.students.state is 'UF de duas letras, uma das 27.';
comment on column public.students.biological_profile is
  'Dado de saúde sensível (LGPD), informado pelo próprio aluno. Nulo = não informado.';
comment on column public.students.weight_goal_kg is
  'Meta de peso do aluno, definida por ele. O peso inicial da barra sai da primeira reavaliação.';

-- ------------------------------------------- dado do corpo é do aluno ------
--
-- `students_update` deixa **o personal** escrever na linha do aluno — o ramo
-- `trainer_id = auth.uid()` existe desde a 0001 e é o que permite arquivar e
-- reativar. Isso já valia para peso e altura e ninguém tinha reparado; com o
-- perfil biológico passa a importar, porque a decisão foi "o aluno informa".
-- Um personal registrando sozinho que um aluno faz reposição hormonal é uma
-- suposição sobre o corpo de outra pessoa gravada como fato.
--
-- É a mesma regra de `student_measurements_insert`, que recusa o personal: o
-- número tem que vir de quem mediu. E é gatilho, não policy, pelo terceiro
-- motivo de sempre — o `using` do RLS vê a linha antiga e o `with check` a
-- nova, e nenhum dos dois consegue dizer "esta coluna não pode **mudar** a não
-- ser que quem escreve seja o dono". Quem compara as duas é o gatilho
-- (precedentes: `assessments_imutavel`, `workout_sessions_imutavel`).
--
-- A meta de peso entra junto pelo mesmo motivo: é um número sobre o corpo do
-- aluno, e quem decide para onde quer ir é ele.

create function private.dado_do_corpo_e_do_aluno()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if new.biological_profile is distinct from old.biological_profile
     and (select auth.uid()) is distinct from old.id then
    raise exception 'O perfil biológico é informado pelo próprio aluno.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.weight_goal_kg is distinct from old.weight_goal_kg
     and (select auth.uid()) is distinct from old.id then
    raise exception 'A meta de peso é definida pelo próprio aluno.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

comment on function private.dado_do_corpo_e_do_aluno() is
  'Só o próprio aluno muda perfil biológico e meta de peso. O personal continua editando o resto da linha.';

create trigger students_dado_do_corpo
  before update on public.students
  for each row
  execute function private.dado_do_corpo_e_do_aluno();
