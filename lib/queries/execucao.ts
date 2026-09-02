import "server-only";

import type { SerieDaExecucao } from "@/lib/domain/execucao";
import { createClient } from "@/lib/supabase/server";

/** A sessão que o aluno deixou aberta, com o treino a que ela pertence. */
export type SessaoAberta = {
  id: string;
  workout_id: string;
  started_at: string;
  treino: { label: string; name: string } | null;
  /** Quantas séries já foram registradas nela. Zero = pode ser descartada. */
  series_registradas: number;
};

export type SessaoConcluida = {
  id: string;
  workout_id: string;
  started_at: string;
  finished_at: string;
  duration_seconds: number | null;
};

/**
 * A sessão em andamento do aluno, se houver.
 *
 * O banco garante que existe no máximo uma (índice único parcial sobre
 * `student_id` com `finished_at is null`), então `maybeSingle` é o formato
 * honesto: uma segunda linha aqui seria bug de schema, não caso a tratar.
 *
 * O filtro por `student_id` está aqui mesmo com o RLS cobrindo: a query não
 * deve depender só da policy para saber de quem é o dado.
 */
export async function sessaoAbertaDoAluno(
  alunoId: string,
): Promise<SessaoAberta | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at, workouts(label, name)")
    .eq("student_id", alunoId)
    .is("finished_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    workout_id: data.workout_id,
    started_at: data.started_at,
    treino: data.workouts ?? null,
    series_registradas: await contarSeries(data.id),
  };
}

/**
 * Quantas séries a sessão já tem.
 *
 * Contagem agregada no banco (`head: true`), não linhas trazidas para contar
 * em memória: o corte de página do PostgREST é silencioso, e uma contagem que
 * volta menor aqui faria uma sessão com histórico parecer vazia — e vazia é
 * exatamente a única que o app tem permissão de apagar.
 */
export async function contarSeries(sessionId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("session_sets")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) throw error;
  return count ?? 0;
}

/** Todas as séries de uma sessão, no formato que a tela de execução usa. */
export async function seriesDaSessao(
  sessionId: string,
): Promise<SerieDaExecucao[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("session_sets")
    .select("workout_exercise_id, set_number, load_kg, reps, skipped")
    .eq("session_id", sessionId)
    .order("set_number");

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    workout_exercise_id: linha.workout_exercise_id,
    set_number: linha.set_number,
    // `load_kg` é `numeric` no Postgres e chega como string no cliente JS.
    load_kg: linha.load_kg === null ? null : Number(linha.load_kg),
    reps: linha.reps,
    skipped: linha.skipped,
  }));
}

/**
 * A sessão concluída mais recente do aluno neste treino — o que a tela de fim
 * resume. Buscar pela mais recente, e não guardar o id na URL, evita que um id
 * copiado de outra sessão mostre um resumo que não é do aluno.
 */
export async function ultimaSessaoConcluida(
  alunoId: string,
  workoutId: string,
): Promise<SessaoConcluida | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at, finished_at, duration_seconds")
    .eq("student_id", alunoId)
    .eq("workout_id", workoutId)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.finished_at) return null;

  return {
    id: data.id,
    workout_id: data.workout_id,
    started_at: data.started_at,
    finished_at: data.finished_at,
    duration_seconds: data.duration_seconds,
  };
}
