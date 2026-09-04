-- Reps Club · Fase 2 · Trocar o programa ativo é uma operação só
--
-- Ativar um programa exige arquivar o anterior: o índice parcial da 0011 não
-- deixa dois ativos para o mesmo aluno. Feito em dois passos pela Server
-- Action, existe um intervalo em que o aluno fica SEM programa nenhum — e se a
-- segunda escrita falhar (rede, RLS, deploy no meio), ele fica assim até
-- alguém perceber. O aluno abre o app na academia e não tem treino.
--
-- Aqui os dois updates acontecem no mesmo statement do chamador, logo na mesma
-- transação: ou os dois valem, ou nenhum vale. A ordem interna (arquiva o
-- anterior, depois ativa este) é a que não esbarra no índice.
--
-- `security invoker` (o padrão) de propósito: as três consultas passam pelo RLS
-- de quem chamou. Um personal de outra carteira não enxerga o programa no
-- `select` e recebe "não encontrado"; se enxergasse, os updates ainda seriam
-- recusados por `mesocycles_update`. A função não alarga o acesso de ninguém —
-- só junta numa transação o que já era permitido.
--
-- Reversível: `drop function public.ativar_macrotreino(uuid);`. Nenhum dado é
-- alterado pela migration.

create function public.ativar_macrotreino(p_mesocycle_id uuid) returns void
  language plpgsql
  set search_path = public
as $$
declare
  v_student_id uuid;
begin
  select m.student_id into v_student_id
    from public.mesocycles m
   where m.id = p_mesocycle_id;

  -- Nulo cobre os dois casos: id que não existe e programa que o RLS esconde.
  -- São a mesma coisa para quem está olhando, e distinguir contaria a um
  -- estranho que aquele id existe.
  if v_student_id is null then
    raise exception 'macrotreino nao encontrado' using errcode = 'no_data_found';
  end if;

  update public.mesocycles
     set status = 'arquivado'
   where student_id = v_student_id
     and status = 'ativo'
     and id <> p_mesocycle_id;

  update public.mesocycles
     set status = 'ativo'
   where id = p_mesocycle_id;

  -- Zero linhas aqui significa que `mesocycles_update` recusou a escrita. Sem
  -- este erro, o arquivamento acima ficaria de pé sozinho e o aluno terminaria
  -- sem programa — exatamente o estado que esta função existe para evitar.
  if not found then
    raise exception 'sem permissao para ativar este macrotreino' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

comment on function public.ativar_macrotreino(uuid) is
  'Arquiva o programa ativo do aluno e ativa este, na mesma transação. Em dois passos, uma falha no meio deixa o aluno sem treino.';

grant execute on function public.ativar_macrotreino(uuid) to authenticated;
