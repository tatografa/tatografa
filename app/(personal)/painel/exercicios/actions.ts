"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type EstadoExercicio = {
  erro?: string;
  errosPorCampo?: Partial<
    Record<"nome" | "grupo" | "equipamento" | "descanso", string>
  >;
  campos?: Record<string, string>;
  sucesso?: boolean;
};

const GRUPOS = [
  "peito", "costas", "ombros", "trapezio", "biceps", "triceps", "antebraco",
  "quadriceps", "posterior", "gluteos", "panturrilha", "abdomen", "lombar", "cardio",
] as const;

const EQUIPAMENTOS = [
  "barra", "halter", "cabo", "maquina", "peso_corporal", "anilha", "smith",
  "elastico", "cardio",
] as const;

const esquema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome precisa de pelo menos 3 caracteres.")
    .max(80, "O nome ficou longo demais."),
  grupo: z.enum(GRUPOS, { error: "Escolha o grupo muscular." }),
  equipamento: z.enum(EQUIPAMENTOS, { error: "Escolha o equipamento." }),
  descanso: z.coerce
    .number({ error: "Informe o descanso." })
    .int("O descanso é em segundos inteiros.")
    .min(0, "O descanso não pode ser negativo.")
    .max(600, "Descanso acima de 10 minutos não é prescrição, é intervalo."),
  peso_corporal: z.coerce.boolean().default(false),
  unilateral: z.coerce.boolean().default(false),
});

function lerFormulario(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    grupo: String(formData.get("grupo") ?? ""),
    equipamento: String(formData.get("equipamento") ?? ""),
    descanso: String(formData.get("descanso") ?? ""),
    peso_corporal: formData.get("peso_corporal") === "on",
    unilateral: formData.get("unilateral") === "on",
  };
}

function errosDe(erro: z.ZodError): EstadoExercicio["errosPorCampo"] {
  const saida: EstadoExercicio["errosPorCampo"] = {};
  for (const problema of erro.issues) {
    const campo = problema.path[0] as keyof NonNullable<
      EstadoExercicio["errosPorCampo"]
    >;
    if (campo && !saida[campo]) saida[campo] = problema.message;
  }
  return saida;
}

export async function salvarExercicio(
  _anterior: EstadoExercicio,
  formData: FormData,
): Promise<EstadoExercicio> {
  const bruto = lerFormulario(formData);
  const id = String(formData.get("id") ?? "");
  const campos = Object.fromEntries(
    Object.entries(bruto).map(([k, v]) => [k, String(v)]),
  );

  const analise = esquema.safeParse(bruto);
  if (!analise.success) {
    return { errosPorCampo: errosDe(analise.error), campos };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const linha = {
    trainer_id: trainer.id,
    name: analise.data.nome,
    muscle_group: analise.data.grupo,
    equipment: analise.data.equipamento,
    default_rest_seconds: analise.data.descanso,
    is_bodyweight: analise.data.peso_corporal,
    is_unilateral: analise.data.unilateral,
  };

  // `eq("trainer_id")` no update é redundante com o RLS, e fica de propósito:
  // um id forjado na requisição não deve nem chegar à policy para ser negado.
  const { error } = id
    ? await supabase
        .from("exercises")
        .update(linha)
        .eq("id", id)
        .eq("trainer_id", trainer.id)
    : await supabase.from("exercises").insert(linha);

  if (error) {
    // Há unique em (trainer_id, name): o mesmo personal não repete nome.
    if (error.code === "23505") {
      return {
        errosPorCampo: { nome: "Você já tem um exercício com esse nome." },
        campos,
      };
    }
    return { erro: "Não deu para salvar. Tente de novo.", campos };
  }

  revalidatePath("/painel/exercicios");
  return { sucesso: true };
}

export type EstadoExclusao = { erro?: string };

/**
 * Apaga um exercício próprio.
 *
 * `workout_exercises.exercise_id` **não tem fk**, então o banco não impede
 * apagar um exercício que está numa prescrição — a linha vira órfã e
 * `lerTreino` a pula (handoff da prescrição, item 5). A tela avisa antes com a
 * contagem, e esta conferência é a rede: sem ela, uma requisição forjada
 * silenciosamente esvaziaria um treino que o aluno usa.
 */
export async function excluirExercicio(
  _anterior: EstadoExclusao,
  formData: FormData,
): Promise<EstadoExclusao> {
  const id = String(formData.get("id") ?? "");
  const confirmado = formData.get("confirmado") === "on";
  if (!id) return { erro: "Exercício não informado." };

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { count, error: erroContagem } = await supabase
    .from("workout_exercises")
    .select("id", { count: "exact", head: true })
    .eq("exercise_source", "custom")
    .eq("exercise_id", id);

  // Contagem que falha não pode virar "zero": seria apagar sem o aviso que
  // existe justamente para proteger a prescrição.
  if (erroContagem) {
    return { erro: "Não deu para conferir se o exercício está em uso." };
  }

  const emUso = count ?? 0;
  if (emUso > 0 && !confirmado) {
    return {
      erro: `Esse exercício está em ${emUso} ${emUso === 1 ? "treino" : "treinos"}. Confirme para remover mesmo assim.`,
    };
  }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: "Não deu para excluir. Tente de novo." };

  revalidatePath("/painel/exercicios");
  return {};
}
