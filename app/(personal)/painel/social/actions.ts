"use server";

import { revalidatePath } from "next/cache";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITE_DA_LEGENDA } from "@/lib/domain/feed";
import {
  esquemaDeComentario,
  gravarComentario,
  gravarCurtida,
} from "@/lib/feed/escrita";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { preencher } from "@/lib/i18n/texto";

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

  const m = (await textosDoPainel()).t.social.erros;
  const analise = esquemaDeComentario.safeParse(bruto);
  if (!analise.success) {
    // O esquema é o mesmo do app (em português); a mensagem sai no idioma do
    // painel, decidida pelo campo e pelo tipo do problema — como no app.
    const problema = analise.error.issues[0];
    const erro =
      problema?.path[0] === "postId"
        ? m.postInvalido
        : problema?.code === "too_big"
          ? preencher(m.longo, { n: LIMITE_DA_LEGENDA })
          : m.vazio;
    return { erro, texto: bruto.texto };
  }

  const { trainer } = await requireTrainer();
  const ok = await gravarComentario(trainer.id, analise.data.postId, analise.data.texto);

  if (!ok) return { erro: m.falha, texto: bruto.texto };

  revalidatePath("/painel/social");
  // O mesmo post aparece na coluna "Atividade" do perfil do aluno.
  revalidatePath("/painel/alunos/[id]", "page");
  return {};
}

export async function curtirDoPainel(
  postId: string,
  curtido: boolean,
): Promise<{ ok: boolean }> {
  const { trainer } = await requireTrainer();
  const ok = await gravarCurtida(trainer.id, postId, curtido);
  if (ok) {
    revalidatePath("/painel/social");
    revalidatePath("/painel/alunos/[id]", "page");
  }
  return { ok };
}
