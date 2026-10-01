-- Reps Club · Contatos que chegam pela landing
--
-- O formulário "Quero começar" / "Entrar em contato" da landing (protótipo
-- `Landing Page.dc.html`) dizia "Recebemos seu contato" e não guardava nada:
-- era tela de protótipo. Aqui cada envio vira uma linha, e a equipe retorna
-- pelo WhatsApp, como a tela promete.
--
-- **Quem escreve é qualquer visitante, e ninguém lê pela API.** A policy de
-- insert vale para `anon` e `authenticated` — o formulário fica numa página
-- pública —, e não existe policy de select, update nem delete: com RLS ligado
-- a ausência é a trava, como em `trainer_notes` e `term_acceptances`. Quem lê
-- é o Otávio, pelo painel do Supabase. Se um dia isto virar tela, a tela vem
-- com papel de administrador, que hoje não existe.
--
-- **Os `check` são a defesa contra lixo**, porque a porta é aberta: tamanho
-- máximo em todo texto, formato de e-mail e telefone só com dígitos (mesma
-- regra de `students.phone`, 0034). A Server Action valida antes com zod para
-- devolver a frase certa no campo; o banco confere de novo para o POST direto.
--
-- Os campos de cada perfil são os do protótipo: o personal diz quantos alunos
-- tem e o que usa hoje; o aluno diz se já tem personal e o que quer.

create table public.contatos_do_site (
  id uuid primary key default gen_random_uuid(),
  perfil text not null check (perfil in ('personal', 'aluno')),
  nome text not null check (char_length(nome) between 2 and 80),
  email text not null check (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefone text not null check (telefone ~ '^[0-9]{10,15}$'),
  -- Personal
  quantos_alunos text check (quantos_alunos in ('1-15', '16-30', '31-49', '50+')),
  plataforma_atual text check (char_length(plataforma_atual) <= 120),
  -- Aluno
  tem_personal boolean,
  objetivos text[] check (
    objetivos <@ array['perder_peso', 'ganhar_massa', 'voltar_a_treinar', 'personal_decide']::text[]
  ),
  created_at timestamptz not null default now(),
  -- Cada perfil traz os seus campos e não os do outro: uma linha de aluno com
  -- "quantos alunos possui" seria um formulário que a tela nunca mostrou.
  constraint contatos_campos_do_perfil check (
    (perfil = 'personal' and quantos_alunos is not null and plataforma_atual is not null
      and tem_personal is null and objetivos is null)
    or
    (perfil = 'aluno' and tem_personal is not null and cardinality(objetivos) > 0
      and quantos_alunos is null and plataforma_atual is null)
  )
);

comment on table public.contatos_do_site is
  'Contatos enviados pela landing. Qualquer visitante insere; ninguém lê pela API — a leitura é pelo painel do Supabase.';

alter table public.contatos_do_site enable row level security;

create policy contatos_do_site_insert on public.contatos_do_site
  for insert to anon, authenticated
  with check (true);

comment on policy contatos_do_site_insert on public.contatos_do_site is
  'Formulário público. Sem policy de select/update/delete: a ausência é a trava.';

-- O insert pela API precisa do privilégio de tabela além da policy; o select
-- não é concedido, então o `returning` do PostgREST não devolve nada — a ação
-- usa `insert` sem `select()`.
grant insert on public.contatos_do_site to anon, authenticated;
revoke select, update, delete on public.contatos_do_site from anon, authenticated;
