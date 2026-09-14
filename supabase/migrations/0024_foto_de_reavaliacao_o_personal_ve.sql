-- Correção da 0023: o ramo do personal na policy de leitura das fotos estava
-- morto.
--
-- A expressão gravada era:
--
--   exists (select 1 from public.students s
--            where s.trainer_id = (select auth.uid())
--              and (storage.foldername(s.name))[1] = s.id::text)
--                                 ^^^^^^
--
-- Eu escrevi `name` querendo `storage.objects.name`, e dentro do `exists` o
-- `from public.students` está mais perto: `name` casou com **o nome do aluno**.
-- A comparação virou `foldername('Vinicius')[1] = s.id::text`, falsa sempre.
--
-- Não vazou nada — falhou para o lado fechado. O personal simplesmente não
-- enxergava a foto do próprio aluno, que é a metade útil da policy. E é um
-- silêncio caro: a URL assinada sairia com erro só na hora em que ele abrisse
-- a reavaliação para conversar com o aluno.
--
-- Duas lições, e as duas já estavam escritas neste repositório:
--
-- 1. A policy do bucket `treinos` (0018) qualifica: `p.photo_path =
--    storage.objects.name`. Referência solta a coluna dentro de um `exists`
--    sobre outra tabela **é para qualificar sempre** — quando as duas têm a
--    coluna, o planejador não avisa, escolhe a de dentro.
-- 2. Quem achou foi um caso de **caminho legítimo** ("o personal vê a foto do
--    próprio aluno"), não um caso de burla. Provar só a burla aprova uma
--    policy que não deixa ninguém entrar — foi o mesmo motivo de a 0021 ter
--    sete casos legítimos entre os dezoito.

drop policy "reavaliacoes: ve a propria foto ou a do proprio aluno" on storage.objects;

create policy "reavaliacoes: ve a propria foto ou a do proprio aluno"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'reavaliacoes'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.students s
         where s.trainer_id = (select auth.uid())
           -- Qualificado. `s` também tem `name`, e sem isto é o dela que vale.
           and (storage.foldername(storage.objects.name))[1] = s.id::text
      )
    )
  );
