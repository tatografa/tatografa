-- A reavaliação enviada congela — **menos as fotos, que o aluno apaga quando
-- quiser**.
--
-- A 0023 travou a linha inteira depois do envio, e por bom motivo: o valor da
-- reavaliação é a comparação, e resposta que muda depois de lida transforma a
-- seta que o personal viu em outra coisa. Mas o motivo vale para os **números**.
-- As fotos são do corpo da pessoa, e a política de privacidade deste produto
-- promete, para a foto do feed, que "você apaga quando quiser". Publicar uma
-- promessa dessas e abrir uma segunda tela que tira fotos do corpo — de frente,
-- de lado e de costas — sem o mesmo botão é a terceira vez que o texto legal
-- andaria à frente da tela neste repositório.
--
-- O desenho: depois do envio, a **única** mudança aceita é os três caminhos de
-- foto virarem nulos. Medida, peso, percentual, observação e a própria data de
-- envio continuam intocáveis. O personal fica com a comparação numérica, que é
-- o que ele usa para treinar; o aluno fica com o corpo dele.
--
-- Quem decide passa a ser só o gatilho. A policy larga o `submitted_at is null`
-- do `using` porque duas travas para a mesma regra, em lugares diferentes, é
-- como uma afrouxa sem ninguém notar — e a do gatilho é a que sabe comparar com
-- o valor antigo.

drop policy assessments_update on public.assessments;

create policy assessments_update on public.assessments for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

comment on policy assessments_update on public.assessments is
  'Só o aluno dono escreve. O que ele pode mudar depois de enviar é decidido pelo gatilho assessments_imutavel: apenas apagar as próprias fotos.';

create or replace function private.reavaliacao_imutavel()
  returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  -- Dono e autor não se transferem.
  if new.student_id is distinct from old.student_id
     or new.trainer_id is distinct from old.trainer_id then
    raise exception 'Reavaliação não muda de aluno nem de personal.';
  end if;

  -- Quem libera é o personal. Sem isto o aluno adiantaria a própria data.
  if new.released_at is distinct from old.released_at then
    raise exception 'A data de liberação é do personal.';
  end if;

  if old.submitted_at is not null then
    /*
     * Enviada. A única escrita que passa daqui é **apagar foto**: os três
     * caminhos podem ir para nulo, e nada mais pode mudar de valor.
     *
     * A conferência é dos dois lados de propósito. "Nada mais mudou" sozinho
     * deixaria trocar uma foto por outra (um caminho por outro caminho), o que
     * não é apagar — é reescrever o registro que o personal leu. E "foto virou
     * nula" sozinho deixaria apagar a foto **e** corrigir o peso na mesma
     * escrita.
     */
    if new.weight_kg    is distinct from old.weight_kg
       or new.body_fat_pct is distinct from old.body_fat_pct
       or new.notes        is distinct from old.notes
       or new.submitted_at is distinct from old.submitted_at
       or new.created_at   is distinct from old.created_at then
      raise exception 'Reavaliação já enviada não muda; só as fotos podem ser apagadas.';
    end if;

    if new.photo_front_path is not null
       or new.photo_side_path is not null
       or new.photo_back_path is not null then
      raise exception 'Depois de enviada, a foto pode ser apagada, não trocada.';
    end if;
  end if;

  return new;
end;
$$;
