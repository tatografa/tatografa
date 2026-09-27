-- Reps Club · Vídeo, descrição e instruções de segurança do exercício
--
-- Pedido do Otávio (27/09), com a tela de exercícios do protótipo: cada
-- exercício ganha um vídeo (YouTube ou Vimeo), uma descrição da execução e as
-- instruções de segurança — e **o aluno vê**, num "Como fazer" na tela de
-- execução. É ali que o conteúdo tem valor: o personal já sabe fazer supino.
--
-- **Nas duas tabelas**, `exercises` (do personal) e `exercises_catalog` (do
-- Reps Club). O catálogo continua só-leitura pela API — não há policy de
-- escrita nele, e com RLS ligado a ausência é a trava —; o conteúdo dele entra
-- por migration, quando o Otávio mandar a lista (decisão de 27/09).
--
-- **Os limites são os do protótipo** (1000 e 2000 caracteres) e moram no
-- banco além do zod: um POST direto não passa pela tela.
--
-- **O vídeo aceita só link de YouTube e Vimeo, em https.** Não é gosto: a
-- tela do aluno transforma o link num `<iframe>` de embed, e um endereço
-- qualquer ali seria uma página arbitrária aberta dentro do app, na frente de
-- quem está treinando. O `check` confere o domínio; a conversão para o
-- endereço de embed é de `lib/domain/video.ts`, que recusa o que não reconhece.
--
-- **Nenhuma policy muda.** As colunas não apontam para relacionamento nenhum,
-- e quem já escreve a linha (o personal dono, `exercises_write`) escreve nelas.

alter table public.exercises
  add column video_url text
    constraint exercises_video_url_formato
    check (video_url ~ '^https://([a-z0-9-]+\.)?(youtube\.com|youtu\.be|vimeo\.com)/' and length(video_url) <= 500),
  add column description text
    constraint exercises_description_tamanho check (length(description) <= 1000),
  add column safety_notes text
    constraint exercises_safety_notes_tamanho check (length(safety_notes) <= 2000);

alter table public.exercises_catalog
  add column video_url text
    constraint exercises_catalog_video_url_formato
    check (video_url ~ '^https://([a-z0-9-]+\.)?(youtube\.com|youtu\.be|vimeo\.com)/' and length(video_url) <= 500),
  add column description text
    constraint exercises_catalog_description_tamanho check (length(description) <= 1000),
  add column safety_notes text
    constraint exercises_catalog_safety_notes_tamanho check (length(safety_notes) <= 2000);

comment on column public.exercises.video_url is
  'Link do YouTube ou Vimeo. A tela converte para embed; o check garante o domínio.';
comment on column public.exercises.safety_notes is
  'Instruções de segurança. O aluno vê no "Como fazer" da execução.';
comment on column public.exercises_catalog.video_url is
  'Link do YouTube ou Vimeo. Conteúdo do catálogo entra por migration, não pela API.';
