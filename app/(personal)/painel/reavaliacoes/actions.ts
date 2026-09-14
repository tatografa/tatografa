"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type EstadoDaLiberacao = { erro?: string; ok?: boolean };

const esquema = z.object({
  alunoId: z.string().uuid("Escolha um aluno."),
});

/**
 * Libera uma reavaliação para um aluno.
 *
 * A linha nasce só com `released_at`; quem preenche o resto é o aluno. O
 * personal não digita medida do corpo de ninguém — o número tem que vir de
 * quem mediu.
 *
 * Não confere se o aluno é da carteira: `assessments_insert` já exige
 * `trainer_id = auth.uid()` **e** `private.trainer_of(student_id)` (migration
 * 0023), e repetir a regra aqui seria a segunda cópia que sai de sincronia. O
 * que a ação trata é o erro que o banco devolve.
 */
export async function liberarReavaliacao(
  _anterior: EstadoDaLiberacao,
  formData: FormData,
): Promise<EstadoDaLiberacao> {
  const analise = esquema.safeParse({ alunoId: String(formData.get("alunoId") ?? "") });
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase.from("assessments").insert({
    student_id: analise.data.alunoId,
    trainer_id: trainer.id,
  });

  if (error) {
    // `23505` é o índice parcial `assessments_uma_aberta_por_aluno_idx`: já
    // existe uma esperando resposta. Não é falha do personal, é a tela dele
    // estando velha — a mensagem diz o que já é verdade em vez de "erro".
    if (error.code === "23505") {
      return { erro: "Esse aluno já tem uma reavaliação esperando resposta." };
    }
    return { erro: "Não conseguimos liberar agora. Tente de novo." };
  }

  revalidatePath("/painel/reavaliacoes", "layout");
  return { ok: true };
}

export type EstadoDoCancelamento = { erro?: string };

/**
 * Cancela uma reavaliação que ainda não foi respondida.
 *
 * Respondida não se apaga: `assessments_delete` exige `submitted_at is null`
 * (migration 0023). O delete levaria as medidas por cascata, e quem perde a
 * leitura é justamente o personal.
 */
export async function cancelarReavaliacao(
  _anterior: EstadoDoCancelamento,
  formData: FormData,
): Promise<EstadoDoCancelamento> {
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) {
    return { erro: "Reavaliação inválida." };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("assessments")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: "Não conseguimos cancelar agora. Tente de novo." };

  // Delete barrado pelo RLS não levanta erro: afeta zero linhas em silêncio.
  // Sem esta conferência, a tela diria "cancelada" e a reavaliação continuaria
  // lá — que é exatamente o caso de o aluno ter respondido enquanto isso.
  if (count === 0) {
    return { erro: "Essa reavaliação já foi respondida e não pode ser cancelada." };
  }

  revalidatePath("/painel/reavaliacoes", "layout");
  return {};
}
