"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import {
  enderecoDeEmbed,
  LIMITE_DA_DESCRICAO,
  LIMITE_DA_SEGURANCA,
} from "@/lib/domain/video";
import type { TextosDoPainel } from "@/lib/i18n/painel";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { plural, preencher } from "@/lib/i18n/texto";
import { createClient } from "@/lib/supabase/server";

export type EstadoExercicio = {
  erro?: string;
  errosPorCampo?: Partial<
    Record<"nome" | "grupo" | "equipamento" | "descanso" | "video" | "descricao" | "seguranca", string>
  >;
  campos?: Record<string, string>;
  sucesso?: boolean;
  /** O exercício salvo, para a tela abrir ele no painel de detalhes. */
  id?: string;
};

/** Campo de texto opcional: vazio vira nulo, não string vazia no banco. */
const textoOpcional = (limite: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(limite, mensagem)
    .transform((v) => (v === "" ? null : v));

const GRUPOS = [
  "peito", "costas", "ombros", "trapezio", "biceps", "triceps", "antebraco",
  "quadriceps", "posterior", "gluteos", "panturrilha", "abdomen", "lombar", "cardio",
] as const;

const EQUIPAMENTOS = [
  "barra", "halter", "cabo", "maquina", "peso_corporal", "anilha", "smith",
  "elastico", "cardio",
] as const;

type Erros = TextosDoPainel["exercicios"]["erros"];

async function erros(): Promise<Erros> {
  return (await textosDoPainel()).t.exercicios.erros;
}

/* Montado por chamada: a mensagem de erro é do idioma de quem enviou. */
function esquema(e: Erros) {
  return z.object({
    nome: z.string().trim().min(3, e.nomeCurto).max(80, e.nomeLongo),
    grupo: z.enum(GRUPOS, { error: e.grupo }),
    equipamento: z.enum(EQUIPAMENTOS, { error: e.equipamento }),
    descanso: z.coerce
      .number({ error: e.informeDescanso })
      .int(e.descansoInteiro)
      .min(0, e.descansoNegativo)
      .max(600, e.descansoLongo),
    peso_corporal: z.coerce.boolean().default(false),
    unilateral: z.coerce.boolean().default(false),
    // O link é guardado como o personal colou (é o que ele reconhece se for
    // editar); a conversão para embed acontece na leitura. Validar aqui é saber
    // que a conversão vai dar certo.
    video: z
      .string()
      .trim()
      .max(500, e.linkLongo)
      .refine((v) => v === "" || enderecoDeEmbed(v) !== null, e.link)
      .transform((v) => (v === "" ? null : v)),
    descricao: textoOpcional(LIMITE_DA_DESCRICAO, preencher(e.textoLongo, { n: LIMITE_DA_DESCRICAO })),
    seguranca: textoOpcional(LIMITE_DA_SEGURANCA, preencher(e.textoLongo, { n: LIMITE_DA_SEGURANCA })),
  });
}

function lerFormulario(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    grupo: String(formData.get("grupo") ?? ""),
    equipamento: String(formData.get("equipamento") ?? ""),
    descanso: String(formData.get("descanso") ?? ""),
    peso_corporal: formData.get("peso_corporal") === "on",
    unilateral: formData.get("unilateral") === "on",
    video: String(formData.get("video") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    seguranca: String(formData.get("seguranca") ?? ""),
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

  const e = await erros();
  const analise = esquema(e).safeParse(bruto);
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
    video_url: analise.data.video,
    description: analise.data.descricao,
    safety_notes: analise.data.seguranca,
  };

  // `eq("trainer_id")` no update é redundante com o RLS, e fica de propósito:
  // um id forjado na requisição não deve nem chegar à policy para ser negado.
  const { data: salvo, error, count } = id
    ? await supabase
        .from("exercises")
        .update(linha, { count: "exact" })
        .eq("id", id)
        .eq("trainer_id", trainer.id)
        .select("id")
    : await supabase.from("exercises").insert(linha, { count: "exact" }).select("id");

  if (error) {
    // Há unique em (trainer_id, name): o mesmo personal não repete nome.
    if (error.code === "23505") {
      return {
        errosPorCampo: { nome: e.nomeRepetido },
        campos,
      };
    }
    return { erro: e.falhaSalvar, campos };
  }

  // Zero linhas sem erro: o id não é de um exercício deste personal (forjado,
  // ou apagado em outra aba entre abrir o diálogo e enviar). Sem esta checagem
  // o diálogo fecha dizendo "salvo" sobre uma escrita que não aconteceu — o
  // mesmo defeito que `salvarPrograma` já tratava, achado pela revisão do M2.
  if (count === 0 || !salvo?.length) {
    return { erro: e.naoEncontrado, campos };
  }

  revalidatePath("/painel/exercicios");
  return { sucesso: true, id: salvo[0].id };
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
  const e = await erros();
  if (!id) return { erro: e.naoInformado };

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
    return { erro: e.falhaConferir };
  }

  const emUso = count ?? 0;
  if (emUso > 0 && !confirmado) {
    return { erro: plural(emUso, e.confirme) };
  }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: e.falhaExcluir };

  revalidatePath("/painel/exercicios");
  return {};
}
