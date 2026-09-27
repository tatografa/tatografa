import "server-only";

import { pareceUuid } from "@/lib/domain/id";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

import {
  chaveDoExercicio,
  exerciciosPorReferencia,
  type ExercicioDisponivel,
} from "./exercicios";

/**
 * O que a tela "Divisão de treino" (`/painel/treinos`) lê: a carteira, os
 * programas de um aluno e, do programa escolhido, todos os treinos com a
 * prescrição inteira.
 *
 * É a tela que juntou macrotreinos e treinos (27/09, decisão do Otávio), e por
 * isso lê o programa **inteiro** de uma vez — o personal vê os sete dias lado a
 * lado, e não um treino por página como no editor antigo.
 */

export type AlunoDaDivisao = {
  id: string;
  name: string;
  status: Enums<"student_status">;
};

export type ProgramaDaDivisao = {
  id: string;
  name: string;
  total_weeks: number;
  /** Dia de calendário, "2026-09-01". */
  started_at: string;
  status: Enums<"mesocycle_status">;
  goal: Enums<"training_goal"> | null;
};

export type ExercicioDaDivisao = {
  /** `workout_exercises.id` — a chave que o histórico do aluno referencia. */
  id: string;
  sets: number;
  reps_target: string;
  rir_target: string | null;
  rest_seconds: number;
  technique: string | null;
  notes: string | null;
  exercicio: ExercicioDisponivel;
  /** Séries já executadas nesta linha. Remover a linha leva o histórico. */
  series_registradas: number;
};

export type TreinoDaDivisao = {
  id: string;
  label: string;
  name: string;
  notes: string | null;
  exercicios: ExercicioDaDivisao[];
};

export type DivisaoDeTreino = {
  alunos: AlunoDaDivisao[];
  /** Nulo só quando a carteira está vazia. */
  aluno: AlunoDaDivisao | null;
  /** Do aluno escolhido: o ativo primeiro, depois do mais novo ao mais velho. */
  programas: ProgramaDaDivisao[];
  /** Nulo quando o aluno não tem programa nenhum. */
  programa: ProgramaDaDivisao | null;
  treinos: TreinoDaDivisao[];
};

/**
 * Lê a divisão de treino para a tela.
 *
 * `alunoId` e `programaId` vêm da URL e são **palpites**: um id que não está na
 * carteira que o RLS devolveu, ou um programa que não é daquele aluno, cai no
 * padrão em vez de virar erro — a mesma regra da agenda com `?aluno=` (18/09).
 * Uma URL torta não deve explodir na cara de quem só clicou num link.
 *
 * Cinco consultas fixas, nunca uma por treino: alunos, programas, treinos,
 * prescrição em lote e a contagem de séries do programa inteiro
 * (`series_por_programa`, migration 0037). Mais duas para resolver os nomes
 * dos exercícios, uma por origem.
 */
export async function lerDivisaoDeTreino({
  alunoId,
  programaId,
}: {
  alunoId?: string;
  programaId?: string;
}): Promise<DivisaoDeTreino> {
  const supabase = await createClient();

  const { data: alunos, error: erroAlunos } = await supabase
    .from("students")
    .select("id, name, status")
    .order("name");

  if (erroAlunos) throw erroAlunos;
  const carteira = (alunos ?? []).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const vazio = { programas: [], programa: null, treinos: [] };
  if (!carteira.length) return { alunos: [], aluno: null, ...vazio };

  // Sem aluno na URL, o primeiro ativo: é a quem o personal monta treino. O
  // arquivado continua na lista para consulta, mas não abre a tela.
  const aluno =
    carteira.find((a) => a.id === alunoId) ??
    carteira.find((a) => a.status === "ativo") ??
    carteira[0];

  const { data: linhas, error: erroProgramas } = await supabase
    .from("mesocycles")
    .select("id, name, total_weeks, started_at, status, goal, created_at")
    .eq("student_id", aluno.id)
    .order("started_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (erroProgramas) throw erroProgramas;

  const programas: ProgramaDaDivisao[] = (linhas ?? [])
    .map(({ created_at: _criado, ...programa }) => programa)
    // O ativo na frente; o resto na ordem que o banco já devolveu.
    .sort((a, b) => Number(b.status === "ativo") - Number(a.status === "ativo"));

  const programa =
    (programaId && pareceUuid(programaId)
      ? programas.find((p) => p.id === programaId)
      : undefined) ??
    programas[0] ??
    null;

  if (!programa) return { alunos: carteira, aluno, ...vazio };

  return {
    alunos: carteira,
    aluno,
    programas,
    programa,
    treinos: await lerTreinosDoPrograma(programa.id),
  };
}

/**
 * Todos os treinos de um programa com a prescrição resolvida. Também usado
 * pela ação de duplicar, que devolve o treino novo pronto para a tela.
 */
export async function lerTreinosDoPrograma(
  programaId: string,
  apenasTreino?: string,
): Promise<TreinoDaDivisao[]> {
  const supabase = await createClient();

  let consulta = supabase
    .from("workouts")
    .select("id, label, name, notes, position, created_at")
    .eq("mesocycle_id", programaId);
  if (apenasTreino) consulta = consulta.eq("id", apenasTreino);

  const { data: treinos, error } = await consulta
    .order("position")
    .order("created_at");

  if (error) throw error;
  if (!treinos?.length) return [];

  const [prescricao, contagem] = await Promise.all([
    supabase
      .from("workout_exercises")
      .select(
        "id, workout_id, exercise_id, exercise_source, position, sets, reps_target, rir_target, rest_seconds, technique, notes",
      )
      .in(
        "workout_id",
        treinos.map((t) => t.id),
      )
      .order("position"),
    supabase.rpc("series_por_programa", { p_mesocycle_id: programaId }),
  ]);

  if (prescricao.error) throw prescricao.error;
  // Uma contagem que falhou não pode passar por "nunca treinado": a tela
  // removeria sem pedir confirmação justamente o exercício com histórico.
  if (contagem.error) throw contagem.error;

  const linhas = prescricao.data ?? [];
  const porReferencia = await exerciciosPorReferencia(linhas);
  const executadas = new Map(
    (contagem.data ?? []).map((c) => [c.workout_exercise_id, Number(c.total)]),
  );

  const porTreino = new Map<string, ExercicioDaDivisao[]>();
  for (const linha of linhas) {
    const exercicio = porReferencia.get(chaveDoExercicio(linha));
    // Exercício próprio apagado deixa a linha órfã (`exercise_id` não tem fk).
    // Pular aqui é o mesmo que `lerTreino` faz para a tela do aluno.
    if (!exercicio) continue;
    const lista = porTreino.get(linha.workout_id) ?? [];
    lista.push({
      id: linha.id,
      sets: linha.sets,
      reps_target: linha.reps_target,
      rir_target: linha.rir_target,
      rest_seconds: linha.rest_seconds,
      technique: linha.technique,
      notes: linha.notes,
      exercicio,
      series_registradas: executadas.get(linha.id) ?? 0,
    });
    porTreino.set(linha.workout_id, lista);
  }

  return treinos.map((t) => ({
    id: t.id,
    label: t.label,
    name: t.name,
    notes: t.notes,
    exercicios: porTreino.get(t.id) ?? [],
  }));
}
