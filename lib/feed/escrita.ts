import "server-only";

import { z } from "zod";

import { LIMITE_DA_LEGENDA } from "@/lib/domain/feed";
import { pareceUuid } from "@/lib/domain/id";
import { createClient } from "@/lib/supabase/server";

/**
 * Comentar e curtir, do jeito que **os dois papéis** fazem.
 *
 * O aluno e o personal escrevem nas mesmas duas tabelas, com as mesmas regras:
 * `post_comments.author_id` e `post_likes.user_id` apontam para `auth.users`,
 * não para `students`, e as policies da migration 0018 exigem
 * `private.pode_ver_post` dos dois lados. Duas cópias desta lógica divergiriam
 * na primeira vez que uma mudasse.
 *
 * O que **não** mora aqui é a autorização: quem confirma o papel é o layout,
 * com `requireStudent()` ou `requireTrainer()`, e a Server Action de cada lado
 * passa adiante o id que ele devolveu. Essas funções recebem o usuário pronto.
 */

export const esquemaDeComentario = z.object({
  postId: z.string().uuid("Post inválido."),
  texto: z
    .string()
    .trim()
    .min(1, "Escreva alguma coisa.")
    .max(LIMITE_DA_LEGENDA, `O comentário pode ter até ${LIMITE_DA_LEGENDA} caracteres.`),
});

export async function gravarComentario(
  usuarioId: string,
  postId: string,
  texto: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    author_id: usuarioId,
    body: texto,
  });

  return !error;
}

/**
 * Curte ou descurte. A chave primária `(post_id, user_id)` é o que garante uma
 * curtida por pessoa — sem ela, dois toques rápidos virariam dois registros.
 */
export async function gravarCurtida(
  usuarioId: string,
  postId: string,
  curtido: boolean,
): Promise<boolean> {
  if (!pareceUuid(postId)) return false;

  const supabase = await createClient();

  const { error } = curtido
    ? await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", usuarioId)
    : await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: usuarioId });

  return !error;
}
