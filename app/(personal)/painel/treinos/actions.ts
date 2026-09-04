"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITES, normalizarRepeticoes, repeticoesValidas } from "@/lib/domain/prescricao";
import {
  buscarExercicios,
  type ExercicioDisponivel,
  type FiltroDeExercicio,
} from "@/lib/queries/exercicios";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

export type CampoDoEditor = "programa" | "label" | "nome" | "observacao" | "exercicios";

export type ErroDeExercicio = Partial<Record<"sets" | "reps" | "descanso", string>>;

export type EstadoDoEditor = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDoEditor, string>>;
  /** Erros por posição na lista — a linha do editor destaca o próprio campo. */
  errosPorExercicio?: Record<number, ErroDeExercicio>;
};

const MENSAGEM_REPS = "Use um número (12) ou uma faixa (8-10).";

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
  rest: z
    .number({ error: "Informe o descanso." })
    .int("Descanso em segundos inteiros.")
    .min(LIMITES.descansoMin, "Descanso não pode ser negativo.")
    .max(LIMITES.descansoMax, "Descanso longo demais."),
  technique: z.string().trim().max(60, "Técnica muito longa.").nullish(),
  notes: z.string().trim().max(280, "Observação muito longa.").nullish(),
});

const esquemaTreino = z.object({
  // O treino nasce dentro de um programa, não solto num aluno: quem escolhe o
  // aluno é a tela de macrotreinos, e o editor herda o contexto.
  programaId: z.string().uuid("Escolha um programa."),
  treinoId: z.string().uuid().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Informe a letra do treino.")
    .max(4, "No máximo 4 caracteres.")
    .transform((valor) => valor.toUpperCase()),
  nome: z.string().trim().min(2, "Dê um nome ao treino.").max(80, "Nome muito longo."),
  observacao: z.string().trim().max(500, "Observação muito longa.").nullish(),
  exercicios: z
    .array(esquemaExercicio)
    .min(1, "Adicione pelo menos um exercício.")
    .max(30, "No máximo 30 exercícios num treino."),
});

/**
 * Busca do catálogo chamada pelo editor (componente cliente).
 *
 * Roda no servidor mesmo sendo lista pequena: o dia em que o personal tiver
 * exercícios próprios, a consulta já está do lado certo, e a lista inteira
 * nunca precisa viajar para o navegador.
 */
export async function buscarExerciciosAction(
  filtro: FiltroDeExercicio,
): Promise<ExercicioDisponivel[]> {
  await requireTrainer();
  return buscarExercicios(filtro);
}

export async function salvarTreino(
  _anterior: EstadoDoEditor,
  formData: FormData,
): Promise<EstadoDoEditor> {
  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const bruto = {
    programaId: texto(formData, "programaId"),
    treinoId: texto(formData, "treinoId") || undefined,
    label: texto(formData, "label"),
    nome: texto(formData, "nome"),
    observacao: texto(formData, "observacao") || null,
    exercicios: leJson(formData, "exercicios"),
  };

  const analise = esquemaTreino.safeParse(bruto);
  if (!analise.success) return comErros(analise.error);

  const dados = analise.data;

  // O programa chega pela URL, então a conferência é obrigatória e é aqui: um
  // uuid trocado na requisição não pode montar treino na carteira de outro
  // personal. O RLS de `mesocycles` já recusaria a escrita, mas confirmar
  // antes devolve mensagem em vez de estourar no insert.
  const { data: programa } = await supabase
    .from("mesocycles")
    .select("id, status")
    .eq("id", dados.programaId)
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  if (!programa) {
    return { errosPorCampo: { programa: "Esse programa não é seu." } };
  }

  // Treino novo só entra em programa ativo: o aluno não vê programa arquivado,
  // e montar treino que ninguém vai receber é trabalho jogado fora. Editar
  // treino de programa arquivado continua valendo — o personal pode estar
  // arrumando algo antes de reativar.
  if (programa.status !== "ativo" && !dados.treinoId) {
    return {
      errosPorCampo: {
        programa: "Esse programa está arquivado. Ative ele antes de montar treinos.",
      },
    };
  }

  const mesocycleId = programa.id;
  let treinoId = dados.treinoId ?? null;

  if (treinoId) {
    // Confirma que o treino é deste macrotreino antes de atualizar: um id
    // trocado na requisição não pode mover treino de um aluno para outro.
    const { data: existente } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", treinoId)
      .eq("mesocycle_id", mesocycleId)
      .maybeSingle();

    if (!existente) {
      return { erro: "Treino não encontrado. Recarregue a página." };
    }

    const { error } = await supabase
      .from("workouts")
      .update({ label: dados.label, name: dados.nome, notes: dados.observacao })
      .eq("id", treinoId);

    if (error) return { erro: "Não deu para salvar o treino. Tente de novo." };
  } else {
    const { count } = await supabase
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("mesocycle_id", mesocycleId);

    const { data: criado, error } = await supabase
      .from("workouts")
      .insert({
        mesocycle_id: mesocycleId,
        label: dados.label,
        name: dados.nome,
        notes: dados.observacao,
        position: count ?? 0,
      })
      .select("id")
      .single();

    if (error || !criado) {
      return { erro: "Não deu para criar o treino. Tente de novo." };
    }
    treinoId = criado.id;
  }

  const erroPrescricao = await gravarPrescricao(treinoId, dados.exercicios);
  if (erroPrescricao) return { erro: erroPrescricao };

  revalidatePath("/painel/treinos");
  revalidatePath(`/painel/treinos/${treinoId}`);
  redirect(`/painel/treinos/${treinoId}?salvo=1`);
}

type ExercicioValidado = z.infer<typeof esquemaExercicio>;

/**
 * Grava a lista de exercícios do treino preservando as linhas que continuam.
 *
 * Apagar tudo e recriar seria mais simples e destruiria o histórico: as séries
 * executadas em `session_sets` apontam para `workout_exercises.id` com
 * `on delete cascade`. Então a linha que permanece é *atualizada* com o mesmo
 * id, e só o que o personal removeu de fato é apagado.
 */
async function gravarPrescricao(
  treinoId: string,
  exercicios: ExercicioValidado[],
): Promise<string | null> {
  const supabase = await createClient();

  const { data: atuais, error: erroLeitura } = await supabase
    .from("workout_exercises")
    .select("id")
    .eq("workout_id", treinoId);

  if (erroLeitura) return "Não deu para ler a prescrição atual. Tente de novo.";

  const idsAtuais = new Set((atuais ?? []).map((linha) => linha.id));

  // Um id que não pertence a este treino é tratado como linha nova. Sem isso,
  // uma requisição forjada poderia sequestrar a linha de outro treino do mesmo
  // personal — o RLS deixaria passar, porque os dois são dele.
  // Um id repetido na mesma lista faria o upsert tocar a mesma linha duas
  // vezes, e o Postgres recusa o lote inteiro ("cannot affect row a second
  // time"). A segunda ocorrência vira linha nova, que é o que o personal viu
  // na tela: dois exercícios.
  const jaUsados = new Set<string>();
  const linhas: TablesInsert<"workout_exercises">[] = exercicios.map((e, indice) => ({
    id: e.id && idsAtuais.has(e.id) && !jaUsados.has(e.id) ? aoUsar(jaUsados, e.id) : randomUUID(),
    workout_id: treinoId,
    exercise_id: e.exerciseId,
    exercise_source: e.source,
    position: indice,
    sets: e.sets,
    reps_target: e.reps,
    rest_seconds: e.rest,
    technique: e.technique?.trim() ? e.technique.trim() : null,
    notes: e.notes?.trim() ? e.notes.trim() : null,
  }));

  // Grava antes de apagar: se o upsert falhar, o treino continua inteiro.
  const { error: erroUpsert } = await supabase.from("workout_exercises").upsert(linhas);
  if (erroUpsert) return "Não deu para salvar os exercícios. Tente de novo.";

  const mantidos = new Set(linhas.map((linha) => linha.id as string));
  const remover = [...idsAtuais].filter((id) => !mantidos.has(id));

  if (remover.length > 0) {
    const { error } = await supabase.from("workout_exercises").delete().in("id", remover);
    if (error) return "Os exercícios foram salvos, mas não deu para remover os apagados.";
  }

  return null;
}

/** Exclui o treino inteiro. O banco leva a prescrição junto, por cascata. */
export async function excluirTreino(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await requireTrainer();
  const supabase = await createClient();

  // O RLS de `workouts` já exige ser o personal dono do macrotreino.
  await supabase.from("workouts").delete().eq("id", id);

  revalidatePath("/painel/treinos");
  redirect("/painel/treinos");
}

// --------------------------------------------------------------- ajuda -----

/** Marca o id como consumido e devolve ele, para caber numa expressão só. */
function aoUsar(usados: Set<string>, id: string): string {
  usados.add(id);
  return id;
}

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

/**
 * A lista de exercícios chega como JSON num campo escondido: é uma estrutura
 * aninhada, e `FormData` plano viraria `exercicios[0][sets]` na mão.
 */
function leJson(formData: FormData, campo: string): unknown {
  try {
    return JSON.parse(String(formData.get(campo) ?? "[]"));
  } catch {
    return [];
  }
}

/** Espalha os problemas do zod entre campos do formulário e linhas da lista. */
function comErros(erro: z.ZodError): EstadoDoEditor {
  const errosPorCampo: EstadoDoEditor["errosPorCampo"] = {};
  const errosPorExercicio: Record<number, ErroDeExercicio> = {};

  for (const problema of erro.issues) {
    const [primeiro, indice, subcampo] = problema.path;

    if (primeiro === "exercicios" && typeof indice === "number") {
      const linha = errosPorExercicio[indice] ?? {};
      const chave =
        subcampo === "sets" ? "sets" : subcampo === "reps" ? "reps" : subcampo === "rest" ? "descanso" : null;
      if (chave && !linha[chave]) linha[chave] = problema.message;
      // Erro sem campo conhecido (exercício ou origem inválidos) vira erro da
      // lista: o personal não digitou isso, então não há campo para destacar.
      if (!chave && !errosPorCampo.exercicios) {
        errosPorCampo.exercicios = problema.message;
      }
      errosPorExercicio[indice] = linha;
      continue;
    }

    const campo = mapaDeCampos[String(primeiro)];
    if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
  }

  return {
    errosPorCampo: Object.keys(errosPorCampo).length ? errosPorCampo : undefined,
    errosPorExercicio: Object.keys(errosPorExercicio).length ? errosPorExercicio : undefined,
  };
}

const mapaDeCampos: Record<string, CampoDoEditor | undefined> = {
  programaId: "programa",
  treinoId: "programa",
  label: "label",
  nome: "nome",
  observacao: "observacao",
  exercicios: "exercicios",
};
