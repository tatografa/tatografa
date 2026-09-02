import "server-only";

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

  // Mais de um macrotreino `ativo` não deveria existir, mas se existir o mais
  // recente é o que vale — mesma regra de `macrotreinosAtivos()` no painel.
  const { data: macro, error: erroMacro } = await supabase
    .from("mesocycles")
    .select("id, name, total_weeks, started_at")
    .eq("student_id", alunoId)
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroMacro) throw erroMacro;
  if (!macro) return { macrotreino: null, treinos: [] };

  const { data: treinos, error: erroTreinos } = await supabase
    .from("workouts")
    .select("id, label, name, position")
    .eq("mesocycle_id", macro.id)
    .order("position");

  if (erroTreinos) throw erroTreinos;
  if (!treinos?.length) return { macrotreino: macro, treinos: [] };

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

  return {
    macrotreino: macro,
    treinos: treinos.map((treino) => {
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
    }),
  };
}

/**
 * O treino que a home sugere.
 *
 * No M1 é simplesmente o de menor `position` — a lista já vem ordenada por ela.
 * Rotação ("o próximo que ainda não foi feito nesta semana") depende de
 * histórico e é M2; inventar isso agora daria uma sugestão errada com cara de
 * certa. Treino sem exercício prescrito é pulado: mandar o aluno abrir uma
 * tela de execução vazia é pior que sugerir o seguinte.
 */
export function proximoTreino(treinos: TreinoDaAgenda[]): TreinoDaAgenda | null {
  return treinos.find((treino) => treino.total_exercicios > 0) ?? null;
}
