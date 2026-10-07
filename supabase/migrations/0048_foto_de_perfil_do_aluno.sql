-- Reps Club · Foto de perfil do aluno
--
-- A coluna `students.avatar_url` existe desde a 0001 e nunca recebeu uma linha
-- — o quarto caso do mesmo formato de `posts.session_id`, `trainers.phone` e
-- `workout_sessions.notes`: a intenção estava escrita no schema e nenhuma tela
-- preenchia. **O que a coluna guarda é o CAMINHO do arquivo no bucket**, não
-- a URL — padrão de `posts.photo_path` e dos três caminhos de `assessments`,
-- porque bucket privado só se lê por URL assinada e o path é o que fica fixo
-- no banco. Renomeio para o nome certo.
--
-- Bucket próprio, **não** o `treinos`. Lá a leitura passa por `posts.photo_path`
-- + visibilidade do post; aqui a foto não é post nenhum, é identidade do aluno
-- — misturar as duas regras num bucket só seria o mesmo erro que separar
-- `reavaliacoes` de `treinos` evitou (15/09). Limite menor (2 MB): avatar
-- grande é desperdício, o quadrado de identidade raramente ultrapassa 512px.
--
-- Quem lê:
--   - o próprio aluno (edita, apaga);
--   - o personal do aluno (vê na ficha e na carteira);
--   - os colegas de turma do aluno (veem no feed, nos comentários).
-- É a mesma turma do `pode_ver_post` quando o alcance é `publico` — portanto o
-- bucket reutiliza `private.minha_turma()` para a trava não divergir no dia em
-- que "turma" mudar de conta.

alter table public.students rename column avatar_url to avatar_path;
comment on column public.students.avatar_path is
  'Caminho do arquivo em storage.objects (bucket `avatares`), não URL. Nulo = sem foto.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatares', 'avatares', false,
  2 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Caminho: `<student_id>/<arquivo>`. É o que amarra a foto ao dono sem
-- consultar tabela nenhuma na hora de escrever, igual a `treinos`.

create policy "avatares: aluno escreve na propria pasta"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatares: aluno troca a propria foto"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatares: aluno apaga a propria foto"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Leitura: dono, personal do dono, ou colega de turma do dono.
-- `private.minha_turma()` devolve o trainer_id da turma de quem lê (status
-- ativo); se o leitor é o personal, `s.trainer_id = auth.uid()` já cobre.
create policy "avatares: dono, personal ou colega de turma"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatares'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.students s
         where s.id::text = (storage.foldername(name))[1]
           and (
             s.trainer_id = (select auth.uid())
             or (private.minha_turma() is not null and s.trainer_id = private.minha_turma())
           )
      )
    )
  );
