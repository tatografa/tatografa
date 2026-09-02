import "server-only";

import {
  agruparPorExercicio,
  contarFeitas,
  linhasDeSeries,
  type LinhaDeSerie,
  type SerieDoHistorico,
} from "@/lib/domain/historico";
import { totalDeSeries, volumeDaSessao } from "@/lib/domain/treino";
import { createClient } from "@/lib/supabase/server";

import { lerTreino } from "./treinos";

/**
 * Quantas sessões a lista mostra. O histórico do M1 não tem filtro por período
 * nem paginação (é M2), mas uma lista sem teto cresce para sempre numa tela
 * aberta no celular. Quando o teto é atingido a tela avisa — corte silencioso
 * faria o aluno achar que perdeu treino.
 */
export const LIMITE_DO_HISTORICO = 50;

/** Tamanho da página ao varrer `session_sets`. */
const PAGINA_DE_SERIES = 1000;

export type TreinoDaSessao = { id: string; label: string; name: string };

/** Uma linha da lista do histórico. */
export type SessaoDoHistorico = {
  id: string;
  started_at: string;
  /** Nunca nulo: a sessão em andamento não entra no histórico. */
  finished_at: string;
  duration_seconds: number | null;
  /** Nulo se o personal apagou o treino depois — a sessão continua valendo. */
  treino: TreinoDaSessao | null;
  series_feitas: number;
  /**
   * Séries da prescrição **de hoje**. Se o personal mexeu no treino depois da
   * sessão, este número muda; é o único denominador que existe sem versionar
   * prescrição (M2). Por isso a tela mostra "12 de 16 séries", não "75%".
   */
  series_prescritas: number;
  volume_kg: number;
};

export type ExercicioDoHistorico = {
  /** `workout_exercises.id`. */
  id: string;
  nome: string;
  is_bodyweight: boolean;
  reps_target: string | null;
  sets_prescritos: number;
  series: LinhaDeSerie[];
  feitas: number;
};

export type SessaoDetalhada = SessaoDoHistorico & {
  exercicios: ExercicioDoHistorico[];
  volume_kg: number;
};

type SerieComSessao = SerieDoHistorico & {
  session_id: string;
  workout_exercise_id: string;
};

/**
 * As sessões concluídas do aluno, da mais recente para a mais antiga.
 *
 * Quatro consultas fixas — sessões, treinos, prescrições e séries — e o
 * agrupamento em memória. Uma consulta por sessão para somar volume seria N+1
 * numa tela que só cresce com o uso.
 *
 * Sessão com `finished_at` nulo fica de fora: é o treino em andamento
 * (handoff `execucao.md`, item 4), e listá-la mostraria o treino de agora como
 * concluído, com duração vazia.
 *
 * O filtro por `student_id` está aqui mesmo com o RLS cobrindo: a query não
 * deve depender só da policy para saber de quem é o dado.
 */
export async function listarHistorico(
  alunoId: string,
): Promise<SessaoDoHistorico[]> {
  const supabase = await createClient();

  const { data: sessoes, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at, finished_at, duration_seconds")
    .eq("student_id", alunoId)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(LIMITE_DO_HISTORICO);

  if (error) throw error;
  if (!sessoes?.length) return [];

  const idsDeTreino = [...new Set(sessoes.map((s) => s.workout_id))];

  const [{ data: treinos, error: erroTreinos }, { data: prescricoes, error: erroPrescricoes }, series] =
    await Promise.all([
      supabase.from("workouts").select("id, label, name").in("id", idsDeTreino),
      supabase
        .from("workout_exercises")
        .select("workout_id, sets, rest_seconds")
        .in("workout_id", idsDeTreino),
      seriesDasSessoes(sessoes.map((s) => s.id)),
    ]);

  if (erroTreinos) throw erroTreinos;
  if (erroPrescricoes) throw erroPrescricoes;

  const treinoPorId = new Map((treinos ?? []).map((t) => [t.id, t]));

  // Agrupa antes de somar para usar `totalDeSeries` do domínio, a mesma conta
  // que o painel do personal e a lista de treinos fazem.
  const porTreino = new Map<string, { sets: number; rest_seconds: number }[]>();
  for (const linha of prescricoes ?? []) {
    const lista = porTreino.get(linha.workout_id) ?? [];
    lista.push({ sets: linha.sets, rest_seconds: linha.rest_seconds });
    porTreino.set(linha.workout_id, lista);
  }
  const prescritasPorTreino = new Map(
    [...porTreino].map(([id, linhas]) => [id, totalDeSeries(linhas)]),
  );

  const seriesPorSessao = new Map<string, SerieComSessao[]>();
  for (const serie of series) {
    const lista = seriesPorSessao.get(serie.session_id) ?? [];
    lista.push(serie);
    seriesPorSessao.set(serie.session_id, lista);
  }

  return sessoes.flatMap((sessao) => {
    // O tipo do cliente admite nulo em `finished_at`; o filtro já garantiu que
    // não é. Descartar em vez de mentir uma data mantém o contrato do tipo.
    if (!sessao.finished_at) return [];
    const daSessao = seriesPorSessao.get(sessao.id) ?? [];
    return [
      {
        id: sessao.id,
        started_at: sessao.started_at,
        finished_at: sessao.finished_at,
        duration_seconds: sessao.duration_seconds,
        treino: treinoPorId.get(sessao.workout_id) ?? null,
        series_feitas: contarFeitas(daSessao),
        series_prescritas: prescritasPorTreino.get(sessao.workout_id) ?? 0,
        volume_kg: volumeDaSessao(daSessao),
      },
    ];
  });
}

/**
 * Uma sessão concluída do aluno, com a prescrição e as séries.
 *
 * Devolve `null` para id inexistente, sessão de outro aluno e sessão em
 * andamento — os três são "não existe" para quem está olhando, e distinguir
 * contaria a um estranho que aquele id existe.
 */
export async function lerSessaoDoHistorico(
  alunoId: string,
  sessaoId: string,
): Promise<SessaoDetalhada | null> {
  // Id fora do formato faz o Postgres estourar 22P02 em vez de devolver vazio,
  // e uma URL editada não pode virar erro 500.
  if (!pareceUuid(sessaoId)) return null;

  const supabase = await createClient();

  const { data: sessao, error } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at, finished_at, duration_seconds")
    .eq("id", sessaoId)
    .eq("student_id", alunoId)
    .not("finished_at", "is", null)
    .maybeSingle();

  if (error) throw error;
  if (!sessao?.finished_at) return null;

  const [treino, series] = await Promise.all([
    lerTreino(sessao.workout_id),
    seriesDasSessoes([sessao.id]),
  ]);

  const porExercicio = agruparPorExercicio(series);
  const exercicios: ExercicioDoHistorico[] = [];

  for (const prescrito of treino?.exercicios ?? []) {
    const registradas = porExercicio.get(prescrito.id) ?? [];
    porExercicio.delete(prescrito.id);
    exercicios.push({
      id: prescrito.id,
      nome: prescrito.exercicio.name,
      is_bodyweight: prescrito.exercicio.is_bodyweight,
      reps_target: prescrito.reps_target,
      sets_prescritos: prescrito.sets,
      series: linhasDeSeries(prescrito.sets, registradas),
      feitas: contarFeitas(registradas),
    });
  }

  // Sobra do agrupamento: séries cuja linha da prescrição não aparece mais em
  // `lerTreino` — o caso da linha órfã do handoff (exercício próprio apagado).
  // Some da prescrição, mas o aluno fez: aparece no fim, sem nome inventado.
  for (const [id, registradas] of porExercicio) {
    exercicios.push({
      id,
      nome: "Exercício removido do treino",
      is_bodyweight: false,
      reps_target: null,
      sets_prescritos: registradas.length,
      series: linhasDeSeries(0, registradas),
      feitas: contarFeitas(registradas),
    });
  }

  return {
    id: sessao.id,
    started_at: sessao.started_at,
    finished_at: sessao.finished_at,
    duration_seconds: sessao.duration_seconds,
    treino: treino ? { id: treino.id, label: treino.label, name: treino.name } : null,
    series_feitas: contarFeitas(series),
    series_prescritas: treino?.total_series ?? 0,
    volume_kg: volumeDaSessao(series),
    exercicios,
  };
}

/**
 * Todas as séries de um lote de sessões, em lote e com paginação explícita.
 *
 * O corte de página do PostgREST é silencioso: uma única consulta traria as
 * primeiras N linhas sem avisar, e o volume da sessão mais antiga da lista
 * apareceria menor do que foi. Varrer por `range` até a página vir curta é o
 * que torna a contagem confiável sem uma consulta por sessão.
 */
async function seriesDasSessoes(ids: string[]): Promise<SerieComSessao[]> {
  if (!ids.length) return [];

  const supabase = await createClient();
  const todas: SerieComSessao[] = [];

  for (let inicio = 0; ; inicio += PAGINA_DE_SERIES) {
    const { data, error } = await supabase
      .from("session_sets")
      .select("session_id, workout_exercise_id, set_number, load_kg, reps, skipped")
      .in("session_id", ids)
      .order("session_id")
      .order("workout_exercise_id")
      .order("set_number")
      .range(inicio, inicio + PAGINA_DE_SERIES - 1);

    if (error) throw error;
    const pagina = data ?? [];

    for (const linha of pagina) {
      todas.push({
        session_id: linha.session_id,
        workout_exercise_id: linha.workout_exercise_id,
        set_number: linha.set_number,
        // `load_kg` é `numeric` no Postgres e chega como string no cliente JS.
        // Sem o `Number()` o volume vira concatenação de texto.
        load_kg: linha.load_kg === null ? null : Number(linha.load_kg),
        reps: linha.reps,
        skipped: linha.skipped,
      });
    }

    if (pagina.length < PAGINA_DE_SERIES) break;
  }

  return todas;
}

/** Formato de uuid, sem a estritude de versão do zod v4: aqui só interessa
 * que o Postgres consiga fazer o cast sem estourar. */
function pareceUuid(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}
