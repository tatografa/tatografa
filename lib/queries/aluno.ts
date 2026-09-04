import "server-only";

import { janelaDaSemana, proximoDaRotacao } from "@/lib/domain/rotacao";
import { duracaoEstimadaMin, totalDeSeries } from "@/lib/domain/treino";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type MacrotreinoDoAluno = Pick<
  Tables<"mesocycles">,
  "id" | "name" | "total_weeks" | "started_at"
>;

/** Um treino do macrotreino ativo, do jeito que a lista e a home mostram. */
export type TreinoDaAgenda = {
  id: string;
  label: string;
  name: string;
  /** Ordem dentro do macrotreino. É o índice confiável (handoff, item 4). */
  position: number;
  total_exercicios: number;
  total_series: number;
  duracao_min: number;
};

export type AgendaDoAluno = {
  macrotreino: MacrotreinoDoAluno | null;
  treinos: TreinoDaAgenda[];
  /**
   * O treino sugerido pela rotação. Nulo quando não há programa ativo ou
   * nenhum treino tem exercício prescrito.
   *
   * Sai daqui, e não de cada página, porque a home e a lista de treinos
   * mostram a mesma sugestão: dois cálculos do mesmo número divergem na tela
   * (aprendizado de 2026-09-02).
   */
  sugerido: TreinoDaAgenda | null;
};

/**
 * O que o aluno tem para treinar: o macrotreino ativo e os treinos dele.
 *
 * Três consultas fixas — macrotreino, treinos, prescrições — e o agrupamento
 * em memória. Uma consulta por treino para contar exercícios seria N+1 numa
 * tela que abre na academia, com internet ruim.
 *
 * As contagens não são recalculadas aqui: `totalDeSeries` e `duracaoEstimadaMin`
 * vivem em `lib/domain/treino.ts` e são as mesmas que o painel do personal usa —
 * o aluno e o personal precisam ver o mesmo "~45min".
 *
 * O RLS já restringe tudo ao próprio aluno; o filtro por `student_id` está aqui
 * porque a query não deve depender só da policy para saber de quem é o dado.
 */
export async function lerAgendaDoAluno(alunoId: string): Promise<AgendaDoAluno> {
  const supabase = await createClient();

  // Um ativo por aluno é garantido pelo índice parcial da migration 0011. A
  // ordenação fica como rede: se o índice cair, o mais recente é o que vale.
  const { data: macro, error: erroMacro } = await supabase
    .from("mesocycles")
    .select("id, name, total_weeks, started_at")
    .eq("student_id", alunoId)
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroMacro) throw erroMacro;
  // Programa arquivado não aparece para o aluno: o filtro por `ativo` acima já
  // resolve isso, e o histórico continua intacto porque nada foi apagado.
  if (!macro) return { macrotreino: null, treinos: [], sugerido: null };

  const { data: treinos, error: erroTreinos } = await supabase
    .from("workouts")
    .select("id, label, name, position")
    .eq("mesocycle_id", macro.id)
    .order("position");

  if (erroTreinos) throw erroTreinos;
  if (!treinos?.length) return { macrotreino: macro, treinos: [], sugerido: null };

  const { data: prescricoes, error: erroPrescricoes } = await supabase
    .from("workout_exercises")
    .select("workout_id, sets, rest_seconds")
    .in(
      "workout_id",
      treinos.map((t) => t.id),
    );

  if (erroPrescricoes) throw erroPrescricoes;

  const porTreino = new Map<string, { sets: number; rest_seconds: number }[]>();
  for (const linha of prescricoes ?? []) {
    const lista = porTreino.get(linha.workout_id) ?? [];
    lista.push({ sets: linha.sets, rest_seconds: linha.rest_seconds });
    porTreino.set(linha.workout_id, lista);
  }

  const agenda: TreinoDaAgenda[] = treinos.map((treino) => {
    const exercicios = porTreino.get(treino.id) ?? [];
    return {
      id: treino.id,
      label: treino.label,
      name: treino.name,
      position: treino.position,
      total_exercicios: exercicios.length,
      total_series: totalDeSeries(exercicios),
      duracao_min: duracaoEstimadaMin(exercicios),
    };
  });

  const feitos = await treinosFeitosNaSemana(alunoId, macro.started_at);

  return {
    macrotreino: macro,
    treinos: agenda,
    sugerido: proximoDaRotacao(agenda, feitos),
  };
}

/**
 * Quais treinos o aluno já concluiu na semana corrente do programa.
 *
 * A janela sai de `janelaDaSemana` (fronteira no `started_at`, não na segunda
 * do calendário) e a contagem é agregada no banco por
 * `treinos_feitos_na_semana`. Trazer as sessões para agrupar aqui repetiria o
 * erro da migration 0008: o corte de página do PostgREST é silencioso, e uma
 * lista truncada faria a tela sugerir de novo um treino já feito hoje.
 *
 * Erro não vira conjunto vazio: uma sugestão errada com cara de certa é pior
 * que a página falhar, e todas as outras consultas desta função também
 * estouram.
 */
async function treinosFeitosNaSemana(
  alunoId: string,
  inicioDoPrograma: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const janela = janelaDaSemana(inicioDoPrograma);

  const { data, error } = await supabase.rpc("treinos_feitos_na_semana", {
    p_student_id: alunoId,
    p_de: janela.de,
    p_ate: janela.ate,
  });

  if (error) throw error;

  return new Set((data ?? []).map((linha) => linha.workout_id));
}
