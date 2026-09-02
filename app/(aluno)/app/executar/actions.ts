"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { LIMITES_DA_EXECUCAO } from "@/lib/domain/execucao";
import { contarSeries } from "@/lib/queries/execucao";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Cliente = SupabaseClient<Database>;

/** Código do Postgres para violação de índice único. */
const VIOLACAO_DE_UNICO = "23505";

/**
 * O que a tela recebe de volta ao gravar. Deliberadamente pequeno: a tela de
 * execução não mostra formulário nem erro por campo — ela mostra "N séries a
 * enviar" e tenta de novo.
 */
export type ResultadoDaGravacao =
  | {
      ok: true;
      /**
       * Séries que o servidor recusou uma a uma, como `"<workout_exercise_id>#<n>"`.
       * As demais do mesmo lote **foram gravadas**.
       *
       * Existe porque recusar o lote inteiro por causa de uma linha inválida
       * travava séries legítimas: basta o personal remover um exercício
       * enquanto o aluno treina para oito séries boas ficarem presas na fila
       * para sempre.
       */
      recusadas?: string[];
    }
  | {
      ok: false;
      erro: string;
      /**
       * `true` quando tentar de novo não vai adiantar. Hoje só a validação do
       * payload inteiro cai aqui — a interface deste app não consegue produzir
       * o caso. Recusa por série vem em `recusadas`, com `ok: true`.
       */
      permanente: boolean;
    };

const ERRO_GENERICO =
  "Não deu para salvar agora. As séries ficam guardadas e serão enviadas.";

const esquemaSerie = z.object({
  // É `workout_exercises.id`, nunca o id do catálogo (handoff, item 1).
  workout_exercise_id: z.string().uuid(),
  set_number: z.number().int().min(1).max(50),
  load_kg: z
    .number()
    .min(LIMITES_DA_EXECUCAO.cargaMin)
    .max(LIMITES_DA_EXECUCAO.cargaMax)
    .nullable(),
  reps: z
    .number()
    .int()
    .min(LIMITES_DA_EXECUCAO.repsMin)
    .max(LIMITES_DA_EXECUCAO.repsMax)
    .nullable(),
  skipped: z.boolean(),
});

const esquemaGravacao = z.object({
  sessionId: z.string().uuid(),
  // O lote existe para a reconexão: a tela manda uma série no caso normal e a
  // fila inteira quando a internet volta, pelo mesmo caminho de código.
  series: z.array(esquemaSerie).min(1).max(200),
});

export type EntradaDeGravacao = z.input<typeof esquemaGravacao>;

/**
 * Grava (ou regrava) séries de uma sessão do aluno.
 *
 * É `upsert` por `(session_id, workout_exercise_id, set_number)` de propósito:
 * o reenvio da fila local e a correção de uma série já feita passam pelo mesmo
 * caminho, e nenhum dos dois pode virar linha duplicada.
 *
 * **Aceita sessão já encerrada**, desde que seja do próprio aluno. Recusar
 * fechava a porta na cara do dado que a fila existe para salvar: uma sessão
 * encerrada enquanto ainda havia série guardada no aparelho nunca mais
 * receberia essa série. O volume é calculado na leitura, então o resumo se
 * corrige sozinho; só `duration_seconds` fica como foi registrado.
 */
export async function registrarSeries(
  entrada: EntradaDeGravacao,
): Promise<ResultadoDaGravacao> {
  const { student } = await requireStudent();

  const validado = esquemaGravacao.safeParse(entrada);
  if (!validado.success)
    return { ok: false, erro: "Série inválida.", permanente: true };

  const { sessionId, series } = validado.data;
  const supabase = await createClient();

  const sessao = await sessaoDoAluno(supabase, student.id, sessionId);
  // Sessão que não é do aluno (ou não existe) é temporária de propósito: um
  // erro de leitura não pode fazer a fila jogar fora o treino inteiro.
  if (!sessao) return { ok: false, erro: ERRO_GENERICO, permanente: false };

  // O RLS de `session_sets` confere de quem é a sessão, mas não de quem é a
  // linha da prescrição: sem esta conferência o aluno poderia gravar série
  // apontando para o exercício de um treino alheio e sujar o histórico dele.
  // A migration 0009 fecha o mesmo furo no banco; aqui a recusa é explícita
  // em vez de virar erro de RLS sem explicação.
  const permitidos = await prescricaoDoTreino(supabase, sessao.workout_id);

  // Separa em vez de recusar tudo: a linha que sumiu da prescrição é
  // irrecuperável de qualquer jeito, mas as outras do mesmo lote são séries
  // que o aluno levantou.
  const aceitas = series.filter((s) => permitidos.has(s.workout_exercise_id));
  const recusadas = series
    .filter((s) => !permitidos.has(s.workout_exercise_id))
    .map((s) => `${s.workout_exercise_id}#${s.set_number}`);

  if (!aceitas.length) return { ok: true, recusadas };

  const { error } = await supabase.from("session_sets").upsert(
    aceitas.map((serie) => ({
      session_id: sessionId,
      workout_exercise_id: serie.workout_exercise_id,
      set_number: serie.set_number,
      load_kg: serie.load_kg,
      reps: serie.reps,
      skipped: serie.skipped,
    })),
    { onConflict: "session_id,workout_exercise_id,set_number" },
  );

  // Erro de rede ou do banco é temporário por padrão: a fila continua
  // guardando a série e tenta de novo.
  if (error) return { ok: false, erro: ERRO_GENERICO, permanente: false };
  return { ok: true, recusadas };
}

const esquemaConclusao = z.object({ sessionId: z.string().uuid() });

/**
 * Fecha a sessão: `finished_at` e `duration_seconds` reais.
 *
 * A duração sai do relógio do servidor contra o `started_at` do banco, não do
 * relógio do aparelho: celular com hora errada gravaria um treino de horas ou
 * de valor negativo no histórico.
 */
export async function concluirTreino(entrada: {
  sessionId: string;
}): Promise<ResultadoDaGravacao> {
  const { student } = await requireStudent();

  const validado = esquemaConclusao.safeParse(entrada);
  if (!validado.success)
    return { ok: false, erro: "Sessão inválida.", permanente: true };

  const supabase = await createClient();
  const sessao = await sessaoEmAndamento(
    supabase,
    student.id,
    validado.data.sessionId,
  );

  // Sessão já fechada não é erro: acontece quando o aluno toca duas vezes ou
  // reenvia depois de uma falha de rede que na verdade tinha dado certo.
  if (!sessao) return { ok: true };

  const { error } = await supabase
    .from("workout_sessions")
    .update(fechamento(sessao.started_at))
    .eq("id", sessao.id)
    .eq("student_id", student.id)
    .is("finished_at", null);

  if (error) return { ok: false, erro: ERRO_GENERICO, permanente: false };

  revalidatePath("/app");
  revalidatePath("/app/treinos");
  return { ok: true };
}

/**
 * Começa (ou retoma) a execução de um treino. É a ação do botão "Começar
 * treino"; devolve por redirect porque o resultado é sempre uma tela.
 */
export async function iniciarTreino(formData: FormData): Promise<void> {
  const { student } = await requireStudent();
  const treinoId = z.string().uuid().safeParse(formData.get("treinoId"));
  if (!treinoId.success) redirect("/app/treinos");

  const supabase = await createClient();
  if (!(await treinoDoAluno(supabase, student.id, treinoId.data))) {
    redirect("/app/treinos");
  }

  const { data: aberta } = await supabase
    .from("workout_sessions")
    .select("id, workout_id")
    .eq("student_id", student.id)
    .is("finished_at", null)
    .maybeSingle();

  // Sessão aberta de outro treino não é erro: a página mostra a escolha entre
  // retomar aquele e encerrá-lo para começar este.
  if (aberta && aberta.workout_id !== treinoId.data) {
    redirect(`/app/executar/${treinoId.data}`);
  }

  if (!aberta) await abrirSessao(supabase, student.id, treinoId.data);

  redirect(`/app/executar/${treinoId.data}`);
}

/**
 * Resolve a sessão pendente de outro treino e começa o novo.
 *
 * Decisão do PM: série que o aluno de fato executou **nunca** é apagada, nem
 * com confirmação. Sessão com séries é encerrada e salva como treino
 * incompleto — com `finished_at` e `duration_seconds`, para não ficar
 * meio-fechada no histórico. Só a sessão sem nenhuma série é descartada.
 */
export async function encerrarPendenteEComecar(
  formData: FormData,
): Promise<void> {
  const { student } = await requireStudent();

  const entrada = z
    .object({ sessaoId: z.string().uuid(), treinoId: z.string().uuid() })
    .safeParse({
      sessaoId: formData.get("sessaoId"),
      treinoId: formData.get("treinoId"),
    });

  if (!entrada.success) redirect("/app/treinos");

  const supabase = await createClient();
  const sessao = await sessaoEmAndamento(
    supabase,
    student.id,
    entrada.data.sessaoId,
  );

  if (sessao) {
    const series = await contarSeries(sessao.id);

    if (series === 0) {
      await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", sessao.id)
        .eq("student_id", student.id)
        .is("finished_at", null);
    } else {
      await supabase
        .from("workout_sessions")
        .update(fechamento(sessao.started_at))
        .eq("id", sessao.id)
        .eq("student_id", student.id)
        .is("finished_at", null);
    }
  }

  if (await treinoDoAluno(supabase, student.id, entrada.data.treinoId)) {
    await abrirSessao(supabase, student.id, entrada.data.treinoId);
  }

  revalidatePath("/app");
  redirect(`/app/executar/${entrada.data.treinoId}`);
}

// ---------------------------------------------------------------- ajuda ----

/** `finished_at` e `duration_seconds` calculados com o relógio do servidor. */
function fechamento(startedAt: string) {
  const inicio = new Date(startedAt).getTime();
  const fim = Date.now();
  return {
    finished_at: new Date(fim).toISOString(),
    // Nunca negativo: `started_at` no futuro (relógio do banco ajustado) daria
    // uma duração negativa no histórico.
    duration_seconds: Math.max(0, Math.round((fim - inicio) / 1000)),
  };
}

async function abrirSessao(
  supabase: Cliente,
  alunoId: string,
  treinoId: string,
): Promise<void> {
  const { error } = await supabase
    .from("workout_sessions")
    .insert({ student_id: alunoId, workout_id: treinoId });

  // Dois toques rápidos no botão disputam o índice único parcial. O segundo
  // perde, e isso é o comportamento certo: a sessão que o primeiro criou é a
  // que a página vai retomar. Erro de verdade continua subindo.
  if (error && error.code !== VIOLACAO_DE_UNICO) throw error;
}

async function sessaoEmAndamento(
  supabase: Cliente,
  alunoId: string,
  sessionId: string,
) {
  const { data } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at")
    .eq("id", sessionId)
    .eq("student_id", alunoId)
    .is("finished_at", null)
    .maybeSingle();

  return data;
}

/** A sessão do aluno, aberta ou já encerrada. Usada só para gravar série. */
async function sessaoDoAluno(
  supabase: Cliente,
  alunoId: string,
  sessionId: string,
) {
  const { data } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at")
    .eq("id", sessionId)
    .eq("student_id", alunoId)
    .maybeSingle();

  return data;
}

/** O treino existe e é do macrotreino deste aluno. */
async function treinoDoAluno(
  supabase: Cliente,
  alunoId: string,
  treinoId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("workouts")
    .select("id, mesocycles!inner(student_id)")
    .eq("id", treinoId)
    .maybeSingle();

  return data?.mesocycles.student_id === alunoId;
}

/** Ids das linhas da prescrição do treino — o conjunto que a sessão aceita. */
async function prescricaoDoTreino(
  supabase: Cliente,
  treinoId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("workout_exercises")
    .select("id")
    .eq("workout_id", treinoId);

  if (error) throw error;
  return new Set((data ?? []).map((linha) => linha.id));
}
