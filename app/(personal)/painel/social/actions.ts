"use server";

import { revalidatePath } from "next/cache";

import { requireTrainer } from "@/lib/auth/session";
import {
  esquemaDeComentario,
  gravarComentario,
  gravarCurtida,
} from "@/lib/feed/escrita";

export type EstadoDaResposta = { erro?: string; texto?: string };

/**
 * O personal responde um post do aluno.
 *
 * A escrita é a mesma do lado do aluno (`lib/feed/escrita.ts`) — as policies da
 * 0018 tratam os dois papéis igual, porque `author_id` aponta para `auth.users`
 * e não para `students`. O que muda é só quem autoriza: aqui é
 * `requireTrainer()`.
 */
export async function responder(
  _anterior: EstadoDaResposta,
  formData: FormData,
): Promise<EstadoDaResposta> {
  const bruto = {
    postId: String(formData.get("postId") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  };

  const analise = esquemaDeComentario.safeParse(bruto);
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message, texto: bruto.texto };
  }

  const { trainer } = await requireTrainer();
  const ok = await gravarComentario(trainer.id, analise.data.postId, analise.data.texto);

  if (!ok) return { erro: "Não conseguimos enviar sua resposta agora.", texto: bruto.texto };

  revalidatePath("/painel/social");
  return {};
}

export async function curtirDoPainel(
  postId: string,
  curtido: boolean,
): Promise<{ ok: boolean }> {
  const { trainer } = await requireTrainer();
  const ok = await gravarCurtida(trainer.id, postId, curtido);
  if (ok) revalidatePath("/painel/social");
  return { ok };
}
