"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import {
  LIMITES,
  normalizarRepeticoes,
  normalizarRir,
  repeticoesValidas,
} from "@/lib/domain/prescricao";
import { lerTreinosDoPrograma, type TreinoDaDivisao } from "@/lib/queries/divisao";
import {
  buscarExercicios,
  type ExercicioDisponivel,
  type FiltroDeExercicio,
} from "@/lib/queries/exercicios";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

/**
 * As ações da tela "Divisão de treino".
 *
 * Nenhuma delas redireciona, ao contrário do editor antigo: a tela mostra o
 * programa inteiro e o personal salva sete cartões de uma vez. Um `redirect` no
 * primeiro levaria embora a edição dos outros seis.
 */

export type ErroDeExercicio = Partial<Record<"sets" | "reps" | "rir" | "descanso", string>>;

export type ResultadoDoTreino =
  | { ok: true; treinoId: string; label: string; idsDosExercicios: string[] }
  | {
      ok: false;
      erro?: string;
      errosPorCampo?: Partial<Record<"nome" | "exercicios", string>>;
      /** Por posição na lista — o cartão destaca o próprio campo. */
      errosPorExercicio?: Record<number, ErroDeExercicio>;
    };

const MENSAGEM_REPS = "Use um número (12) ou uma faixa (8-10).";
const MENSAGEM_RIR = `Use um número (2) ou uma faixa (0-2), de ${LIMITES.rirMin} a ${LIMITES.rirMax}.`;

const esquemaExercicio = z.object({
  /** Presente só quando a linha já existe no banco. */
  id: z.string().uuid().optional(),
  exerciseId: z.string().uuid("Exercício inválido."),
  source: z.enum(["catalog", "custom"], { error: "Origem do exercício inválida." }),
  sets: z
    .number({ error: "Informe as séries." })
    .int("Séries em número inteiro.")
    .min(LIMITES.seriesMin, `No mínimo ${LIMITES.seriesMin} série.`)
    .max(LIMITES.seriesMax, `No máximo ${LIMITES.seriesMax} séries.`),
  reps: z
    .string({ error: "Informe as repetições." })
    .trim()
    .min(1, "Informe as repetições.")
    .refine(repeticoesValidas, MENSAGEM_REPS)
    // O banco guarda texto de propósito: "8-10" é prescrição, não número.
    .transform((valor) => normalizarRepeticoes(valor) as string),
  // Vazio é "não prescrito", e vira nulo; qualquer outra coisa precisa ser um
  // RIR de verdade. O banco confere o formato de novo (0037).
  rir: z
    .string()
    .trim()
    .nullish()
    .refine((valor) => !valor || normalizarRir(valor) !== null, MENSAGEM_RIR)
    .transform((valor) => (valor ? normalizarRir(valor) : null)),
  rest: z
    .number({ error: "Informe o descanso." })
    .int("Descanso em segundos inteiros.")
    .min(LIMITES.descansoMin, "Descanso não pode ser negativo.")
    .max(LIMITES.descansoMax, "Descanso longo demais."),
  technique: z.string().trim().max(60, "Técnica muito longa.").nullish(),
  notes: z.string().trim().max(280, "Observação muito longa.").nullish(),
});

const esquemaTreino = z.object({
  programaId: z.string().uuid("Programa inválido."),
  treinoId: z.string().uuid().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Treino sem letra.")
    .max(4, "No máximo 4 caracteres.")
    .transform((valor) => valor.toUpperCase()),
  nome: z.string().trim().min(2, "Dê um nome ao treino.").max(80, "Nome muito longo."),
  observacao: z.string().trim().max(500, "Observação muito longa.").nullish(),
  exercicios: z
    .array(esquemaExercicio)
    .min(1, "Adicione pelo menos um exercício.")
    .max(30, "No máximo 30 exercícios num treino."),
});

export type TreinoParaSalvar = z.input<typeof esquemaTreino>;

/**
 * Busca do catálogo chamada pela tela (componente cliente).
 *
 * Roda no servidor mesmo sendo lista pequena: a lista inteira nunca precisa
 * viajar para o navegador, e os exercícios próprios do personal moram atrás do
 * RLS dele.
 */
export async function buscarExerciciosAction(
  filtro: FiltroDeExercicio,
): Promise<ExercicioDisponivel[]> {
  await requireTrainer();
  return buscarExercicios(filtro);
}

/**
 * Salva um cartão da divisão — cria o treino ou atualiza o que existe.
 *
 * Devolve os ids das linhas de prescrição **na ordem da tela**. Sem eles, o
 * cartão continuaria com as linhas novas sem id, e o próximo "Salvar" as
 * mandaria como novas outra vez: criaria cópias e apagaria as originais — e com
 * elas, por cascata, qualquer série que o aluno tivesse registrado no meio.
 */
export async function salvarTreinoDaDivisao(
  entrada: TreinoParaSalvar,
): Promise<ResultadoDoTreino> {
  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const analise = esquemaTreino.safeParse(entrada);
  if (!analise.success) return comErros(analise.error);
  const dados = analise.data;

  // O programa chega do navegador, então a conferência é aqui: um uuid trocado
  // não pode montar treino na carteira de outro personal. O RLS recusaria a
  // escrita; conferir antes devolve frase em vez de estourar no insert.
  //
  // **Programa arquivado aceita treino novo**, ao contrário do editor antigo.
  // Desde a duplicação (17/09) o programa arquivado é também o rascunho — a
  // cópia nasce arquivada e "quase sempre leva um ajuste antes de ativar" —, e
  // recusar treino novo ali obrigava a ativar primeiro e montar com o aluno já
  // vendo o programa pela metade.
  const { data: programa } = await supabase
    .from("mesocycles")
    .select("id")
    .eq("id", dados.programaId)
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  if (!programa) return { ok: false, erro: "Esse programa não está mais disponível." };

  let treinoId = dados.treinoId ?? null;

  if (treinoId) {
    // Confere que o treino é deste programa antes de atualizar: um id trocado
    // não pode mover treino de um aluno para outro.
    const { data: existente } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", treinoId)
      .eq("mesocycle_id", programa.id)
      .maybeSingle();

    if (!existente) return { ok: false, erro: "Treino não encontrado. Recarregue a página." };

    const { error } = await supabase
      .from("workouts")
      .update({ label: dados.label, name: dados.nome, notes: dados.observacao ?? null })
      .eq("id", treinoId);

    if (error) return { ok: false, erro: "Não deu para salvar o treino. Tente de novo." };
  } else {
    const { data: ultimo } = await supabase
      .from("workouts")
      .select("position")
      .eq("mesocycle_id", programa.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: criado, error } = await supabase
      .from("workouts")
      .insert({
        mesocycle_id: programa.id,
        label: dados.label,
        name: dados.nome,
        notes: dados.observacao ?? null,
        // Depois do último, e não "quantos existem": com um treino excluído
        // no meio, a contagem repetiria a posição de outro.
        position: (ultimo?.position ?? -1) + 1,
      })
      .select("id")
      .single();

    if (error || !criado) {
      return { ok: false, erro: "Não deu para criar o treino. Tente de novo." };
    }
    treinoId = criado.id;
  }

  const gravado = await gravarPrescricao(treinoId, dados.exercicios);
  if (typeof gravado === "string") return { ok: false, erro: gravado };

  revalidatePath("/painel/treinos");
  return { ok: true, treinoId, label: dados.label, idsDosExercicios: gravado };
}

type ExercicioValidado = z.infer<typeof esquemaExercicio>;

/**
 * Grava a lista de exercícios do treino preservando as linhas que continuam.
 *
 * Apagar tudo e recriar seria mais simples e destruiria o histórico: as séries
 * executadas em `session_sets` apontam para `workout_exercises.id` com
 * `on delete cascade`. Então a linha que permanece é *atualizada* com o mesmo
 * id, e só o que o personal removeu de fato é apagado.
 *
 * Devolve os ids na ordem da lista, ou a frase do erro.
 */
async function gravarPrescricao(
  treinoId: string,
  exercicios: ExercicioValidado[],
): Promise<string[] | string> {
  const supabase = await createClient();

  const { data: atuais, error: erroLeitura } = await supabase
    .from("workout_exercises")
    .select("id")
    .eq("workout_id", treinoId);

  if (erroLeitura) return "Não deu para ler a prescrição atual. Tente de novo.";

  const idsAtuais = new Set((atuais ?? []).map((linha) => linha.id));

  // Um id que não pertence a este treino é tratado como linha nova: sem isso,
  // uma requisição forjada sequestraria a linha de outro treino do mesmo
  // personal — o RLS deixaria passar, porque os dois são dele. E um id repetido
  // na mesma lista faria o upsert tocar a mesma linha duas vezes, que o
  // Postgres recusa ("cannot affect row a second time").
  const jaUsados = new Set<string>();
  const linhas: TablesInsert<"workout_exercises">[] = exercicios.map((e, indice) => {
    const reaproveita = e.id && idsAtuais.has(e.id) && !jaUsados.has(e.id);
    const id = reaproveita ? (e.id as string) : randomUUID();
    jaUsados.add(id);
    return {
      id,
      workout_id: treinoId,
      exercise_id: e.exerciseId,
      exercise_source: e.source,
      position: indice,
      sets: e.sets,
      reps_target: e.reps,
      rir_target: e.rir ?? null,
      rest_seconds: e.rest,
      technique: e.technique?.trim() ? e.technique.trim() : null,
      notes: e.notes?.trim() ? e.notes.trim() : null,
    };
  });

  // Grava antes de apagar: se o upsert falhar, o treino continua inteiro.
  const { error: erroUpsert } = await supabase.from("workout_exercises").upsert(linhas);
  if (erroUpsert) return "Não deu para salvar os exercícios. Tente de novo.";

  const mantidos = new Set(linhas.map((linha) => linha.id as string));
  const remover = [...idsAtuais].filter((id) => !mantidos.has(id));

  if (remover.length > 0) {
    const { error } = await supabase.from("workout_exercises").delete().in("id", remover);
    if (error) return "Os exercícios foram salvos, mas não deu para remover os apagados.";
  }

  return linhas.map((linha) => linha.id as string);
}

/**
 * Exclui um treino inteiro. O banco leva a prescrição e o histórico de
 * execução junto, por cascata — é o que o diálogo da tela diz antes do clique.
 */
export async function excluirTreinoDaDivisao(
  treinoId: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (!z.string().uuid().safeParse(treinoId).success) return { ok: false };

  await requireTrainer();
  const supabase = await createClient();

  // O RLS de `workouts` exige ser o personal dono do programa. Zero linhas é a
  // policy recusando — e a tela não pode dizer "excluído" sobre isso.
  const { error, count } = await supabase
    .from("workouts")
    .delete({ count: "exact" })
    .eq("id", treinoId);

  if (error || count === 0) {
    return { ok: false, erro: "Não deu para excluir o treino. Recarregue a página." };
  }

  revalidatePath("/painel/treinos");
  return { ok: true };
}

/**
 * Copia um treino dentro do mesmo programa (`duplicar_treino`, migration 0029
 * e 0037) e devolve a cópia pronta para a tela — a primeira letra livre, o
 * sufixo "(cópia)" e a prescrição com o RIR.
 */
export async function duplicarTreinoDaDivisao(
  treinoId: string,
  programaId: string,
): Promise<{ ok: true; treino: TreinoDaDivisao } | { ok: false; erro: string }> {
  const valido =
    z.string().uuid().safeParse(treinoId).success &&
    z.string().uuid().safeParse(programaId).success;
  if (!valido) return { ok: false, erro: "Treino inválido." };

  await requireTrainer();
  const supabase = await createClient();

  const { data: novoId, error } = await supabase.rpc("duplicar_treino", {
    p_workout_id: treinoId,
  });

  if (error || !novoId) {
    return { ok: false, erro: "Não deu para duplicar o treino. Recarregue a página." };
  }

  const [treino] = await lerTreinosDoPrograma(programaId, novoId);
  if (!treino) return { ok: false, erro: "A cópia foi criada, mas não deu para lê-la. Recarregue." };

  revalidatePath("/painel/treinos");
  return { ok: true, treino };
}

// --------------------------------------------------------------- ajuda -----

/** Espalha os problemas do zod entre campos do cartão e linhas da lista. */
function comErros(erro: z.ZodError): ResultadoDoTreino {
  const errosPorCampo: Partial<Record<"nome" | "exercicios", string>> = {};
  const errosPorExercicio: Record<number, ErroDeExercicio> = {};
  let geral: string | undefined;

  for (const problema of erro.issues) {
    const [primeiro, indice, subcampo] = problema.path;

    if (primeiro === "exercicios" && typeof indice === "number") {
      const linha = errosPorExercicio[indice] ?? {};
      const chave =
        subcampo === "sets"
          ? "sets"
          : subcampo === "reps"
            ? "reps"
            : subcampo === "rir"
              ? "rir"
              : subcampo === "rest"
                ? "descanso"
                : null;
      if (chave && !linha[chave]) linha[chave] = problema.message;
      if (!chave && !errosPorCampo.exercicios) errosPorCampo.exercicios = problema.message;
      errosPorExercicio[indice] = linha;
      continue;
    }

    if (primeiro === "nome" && !errosPorCampo.nome) errosPorCampo.nome = problema.message;
    else if (primeiro === "exercicios" && !errosPorCampo.exercicios) {
      errosPorCampo.exercicios = problema.message;
    } else if (!geral) geral = problema.message;
  }

  return {
    ok: false,
    erro: geral,
    errosPorCampo: Object.keys(errosPorCampo).length ? errosPorCampo : undefined,
    errosPorExercicio: Object.keys(errosPorExercicio).length ? errosPorExercicio : undefined,
  };
}
