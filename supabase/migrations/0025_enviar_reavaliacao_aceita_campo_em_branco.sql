-- `enviar_reavaliacao` declara que os campos são opcionais.
--
-- A função sempre aceitou nulo em tudo menos o id e as medidas — peso,
-- percentual, observação e as três fotos são colunas nulas, e o aluno que só
-- mede a cintura tem uma resposta legítima. O que faltava era **dizer isso na
-- assinatura**.
--
-- Sem os `default null`, o gerador de tipos do Supabase escreve
-- `p_weight_kg: number` e o TypeScript recusa o `null` que o banco aceita de
-- bom grado. A saída fácil seria um molde no cliente ("confie em mim, nulo
-- passa") — e molde é uma afirmação que ninguém revalida quando a função muda.
-- Com o default, o tipo gerado vira opcional e o cliente omite o que não tem,
-- que é o que ele quer dizer mesmo.
--
-- `create or replace` preserva a permissão e o corpo; só a lista de parâmetros
-- ganha os defaults.
create or replace function public.enviar_reavaliacao(
  p_assessment_id  uuid,
  p_weight_kg      numeric default null,
  p_body_fat_pct   numeric default null,
  p_notes          text    default null,
  p_medidas        jsonb   default '{}'::jsonb,
  p_photo_front    text    default null,
  p_photo_side     text    default null,
  p_photo_back     text    default null
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
