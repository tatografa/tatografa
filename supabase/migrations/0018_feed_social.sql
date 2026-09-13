-- Feed social: posts, curtidas e comentários, mais o bucket das fotos.
--
-- **A regra que não pode falhar** (doc 03 do handoff): um aluno nunca vê dado
-- de aluno de outro personal. Aqui isso é mais sério que nas outras tabelas,
-- porque o dado é foto do corpo da pessoa.
--
-- "Público" na v1 significa **os outros alunos do mesmo personal**, não a
-- internet. O compositor mostra essa escolha com essas palavras.

create type public.post_visibility as enum ('personal', 'publico');

comment on type public.post_visibility is
  'personal = só o personal do aluno vê; publico = também os outros alunos do mesmo personal. Nunca a internet.';

-- ------------------------------------------------------------- posts -------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  -- Post nasce quase sempre de um treino, mas não precisa. `set null` porque a
  -- sessão some antes do post em nenhum caminho hoje — e se um dia sumir, o
  -- post do aluno não deve sumir junto.
  session_id uuid references public.workout_sessions (id) on delete set null,
  caption    text check (caption is null or length(btrim(caption)) between 1 and 500),
  photo_path text,
  visibility public.post_visibility not null default 'personal',
  created_at timestamptz not null default now(),
  -- Post sem foto e sem legenda é linha vazia no feed.
  constraint posts_tem_conteudo check (caption is not null or photo_path is not null)
);

create index posts_student_idx on public.posts (student_id, created_at desc);
create index posts_feed_idx    on public.posts (visibility, created_at desc);

-- ------------------------------------------------- quem enxerga um post ----
-- Helper em `private`: o PostgREST publica como RPC toda função de `public`, e
-- helper de autorização exposto é superfície de ataque sem ganho.
--
-- Três caminhos, nesta ordem: o autor, o personal do autor, e — só quando o
-- post é `publico` — outro aluno do **mesmo** personal.
--
-- `my_trainer_id()` devolve nulo para quem não é aluno (o personal, por
-- exemplo), e comparação com nulo é nula, logo falsa. É o que impede o terceiro
-- ramo de virar porta dos fundos.
create or replace function private.pode_ver_post(
  p_student_id uuid,
  p_visibility public.post_visibility
) returns boolean
  language sql stable security definer set search_path = public
as $$
  select
    p_student_id = auth.uid()
    or private.trainer_of(p_student_id)
    or (
      p_visibility = 'publico'
      and private.my_trainer_id() is not null
      and private.my_trainer_id()
          = (select trainer_id from public.students where id = p_student_id)
    )
$$;

-- Revoga de `public` e `anon`, mas **concede a `authenticated`**: a policy roda
-- como o usuário que consulta, então sem o `execute` ninguém enxerga nada. O
-- que mantém o helper fora da API é o schema `private` não ser exposto pelo
-- PostgREST — não a revogação. Mesmo padrão da migration 0005.
revoke all on function private.pode_ver_post(uuid, public.post_visibility)
  from public, anon;

grant execute on function private.pode_ver_post(uuid, public.post_visibility)
  to authenticated;

alter table public.posts enable row level security;

create policy posts_select on public.posts for select to authenticated
  using (private.pode_ver_post(student_id, visibility));

-- Só o aluno publica, e só sobre si mesmo.
create policy posts_insert on public.posts for insert to authenticated
  with check (student_id = auth.uid());

-- `student_id` no `with check` do update também: sem isso, o autor reescreveria
-- a coluna e penduraria o próprio post em outro aluno. Foi o mesmo furo três
-- vezes neste projeto (migrations 0007, 0009, 0010).
create policy posts_update on public.posts for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Apagar é só do autor. Moderação pelo personal é decisão de produto que ainda
-- não foi tomada — e policy é mais fácil de abrir depois do que de fechar.
create policy posts_delete on public.posts for delete to authenticated
  using (student_id = auth.uid());

-- -------------------------------------------------------- post_likes -------
-- `user_id` e não `student_id`: o personal também curte.
create table public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy post_likes_select on public.post_likes for select to authenticated
  using (exists (
    select 1 from public.posts p
     where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
  ));

-- Curtir exige **ver** o post, não só conhecer o id. Sem essa conferência, um
-- aluno de outro personal curtiria por id adivinhado e apareceria no contador.
create policy post_likes_insert on public.post_likes for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.posts p
       where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
    )
  );

create policy post_likes_delete on public.post_likes for delete to authenticated
  using (user_id = auth.uid());

-- ----------------------------------------------------- post_comments -------
create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references auth.users (id) on delete cascade,
  body       text not null check (length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index post_comments_post_idx on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

create policy post_comments_select on public.post_comments for select to authenticated
  using (exists (
    select 1 from public.posts p
     where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
  ));

create policy post_comments_insert on public.post_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
       where p.id = post_id and private.pode_ver_post(p.student_id, p.visibility)
    )
  );

create policy post_comments_delete on public.post_comments for delete to authenticated
  using (author_id = auth.uid());

-- ------------------------------------------------ fotos, no Storage --------
-- Bucket **privado**. Público aqui significaria "qualquer um com a URL", e a
-- URL é adivinhável o bastante quando o caminho tem o id do aluno.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'treinos', 'treinos', false,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Caminho: `<student_id>/<arquivo>`. É o que amarra a foto ao dono sem
-- consultar tabela nenhuma na hora de escrever.

-- Escrever, trocar e apagar: só na própria pasta.
create policy "treinos: aluno escreve na propria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'treinos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "treinos: aluno apaga a propria foto"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'treinos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- **Ler espelha a visibilidade do post.**
--
-- Sem isto, proteger a linha de `posts` não protegeria nada: a foto sairia pela
-- URL do Storage, que não passa pelo RLS da tabela. Quem pode ver o post pode
-- ver a foto dele, e ninguém mais.
--
-- O primeiro ramo cobre a janela entre subir a foto e criar o post — nesse
-- instante ainda não existe linha em `posts` para consultar, e sem ele o aluno
-- não veria a própria pré-visualização.
create policy "treinos: ve a propria foto ou a de post visivel"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'treinos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.posts p
         where p.photo_path = storage.objects.name
           and private.pode_ver_post(p.student_id, p.visibility)
      )
    )
  );
