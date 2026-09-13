"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { LIMITE_DA_LEGENDA } from "@/lib/domain/feed";
import { createClient } from "@/lib/supabase/server";

export type EstadoDaPublicacao = {
  erro?: string;
  errosPorCampo?: Partial<Record<"legenda" | "alcance" | "foto", string>>;
  campos?: { legenda?: string; alcance?: string };
};

/**
 * Os tipos que o bucket aceita (migration 0018) e a extensão de cada um.
 *
 * A lista vive aqui **e** no banco de propósito: esta dá a mensagem em
 * português antes de subir nada; a do bucket é a que vale, porque um cliente
 * adulterado não passa pelo formulário.
 */
const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** O mesmo teto do bucket. Repetido pelo mesmo motivo dos tipos. */
const LIMITE_DE_BYTES = 5 * 1024 * 1024;

const esquema = z.object({
  legenda: z
    .string()
    .trim()
    .max(LIMITE_DA_LEGENDA, `A legenda pode ter até ${LIMITE_DA_LEGENDA} caracteres.`),
  alcance: z.enum(["personal", "publico"], {
    error: "Escolha quem pode ver este post.",
  }),
});

/**
 * Publica um post do aluno: foto, legenda e alcance.
 *
 * **A ordem importa e é esta: sobe a foto, depois grava a linha.** Ao
 * contrário, a linha existiria apontando para um arquivo que ainda não está
 * lá, e o feed mostraria um card quebrado no intervalo. Se a gravação falhar
 * depois do upload, a foto é apagada aqui mesmo — objeto órfão no Storage não
 * aparece em lugar nenhum e ninguém o encontra depois.
 *
 * A checagem de "tem foto ou tem legenda" repete a constraint
 * `posts_tem_conteudo`. A do banco é a que vale; esta existe para a mensagem
 * chegar em português, e no campo certo.
 */
export async function publicarPost(
  _anterior: EstadoDaPublicacao,
  formData: FormData,
): Promise<EstadoDaPublicacao> {
  const bruto = {
    legenda: String(formData.get("legenda") ?? ""),
    alcance: String(formData.get("alcance") ?? ""),
  };

  const analise = esquema.safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoDaPublicacao["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as "legenda" | "alcance" | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo, campos: bruto };
  }

  const { legenda, alcance } = analise.data;
  const foto = formData.get("foto");
  const temFoto = foto instanceof File && foto.size > 0;

  if (!temFoto && !legenda) {
    return {
      errosPorCampo: { legenda: "Escreva algo ou escolha uma foto." },
      campos: bruto,
    };
  }

  if (temFoto) {
    if (!EXTENSAO_POR_TIPO[foto.type]) {
      return {
        errosPorCampo: { foto: "A foto precisa ser JPG, PNG ou WEBP." },
        campos: bruto,
      };
    }
    if (foto.size > LIMITE_DE_BYTES) {
      return {
        errosPorCampo: { foto: "A foto passa de 5 MB. Tire outra ou escolha uma menor." },
        campos: bruto,
      };
    }
  }

  const { student } = await requireStudent();
  const supabase = await createClient();

  let caminho: string | null = null;

  if (temFoto) {
    // A primeira pasta do caminho é o id do dono: é o que a policy de escrita
    // do Storage confere, sem consultar tabela nenhuma.
    caminho = `${student.id}/${randomUUID()}.${EXTENSAO_POR_TIPO[foto.type]}`;

    const { error: erroDoUpload } = await supabase.storage
      .from("treinos")
      .upload(caminho, await foto.arrayBuffer(), {
        contentType: foto.type,
        upsert: false,
      });

    if (erroDoUpload) {
      return { erro: "Não conseguimos enviar a foto agora. Tente de novo.", campos: bruto };
    }
  }

  const { error } = await supabase.from("posts").insert({
    student_id: student.id,
    caption: legenda || null,
    photo_path: caminho,
    visibility: alcance,
  });

  if (error) {
    if (caminho) await supabase.storage.from("treinos").remove([caminho]);
    return { erro: "Não conseguimos publicar agora. Tente de novo.", campos: bruto };
  }

  revalidatePath("/app/feed");
  redirect(alcance === "publico" ? "/app/feed" : "/app/feed?aba=personal");
}

export type EstadoDoComentario = {
  erro?: string;
  /** O texto volta para o campo quando a validação recusa. */
  texto?: string;
};

const esquemaDeComentario = z.object({
  postId: z.string().uuid("Post inválido."),
  texto: z
    .string()
    .trim()
    .min(1, "Escreva alguma coisa.")
    .max(LIMITE_DA_LEGENDA, `O comentário pode ter até ${LIMITE_DA_LEGENDA} caracteres.`),
});

/**
 * Comenta num post.
 *
 * Não confere se o post é visível: `post_comments_insert` já exige
 * `private.pode_ver_post` (migration 0018), e repetir a checagem aqui seria uma
 * segunda cópia da regra — que é justamente como as duas saem de sincronia.
 * O erro do RLS chega como falha e a tela diz que não deu.
 */
export async function comentar(
  _anterior: EstadoDoComentario,
  formData: FormData,
): Promise<EstadoDoComentario> {
  const bruto = {
    postId: String(formData.get("postId") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  };

  const analise = esquemaDeComentario.safeParse(bruto);
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message, texto: bruto.texto };
  }

  const { student } = await requireStudent();
  const supabase = await createClient();

  const { error } = await supabase.from("post_comments").insert({
    post_id: analise.data.postId,
    author_id: student.id,
    body: analise.data.texto,
  });

  if (error) {
    return { erro: "Não conseguimos enviar seu comentário agora.", texto: bruto.texto };
  }

  revalidatePath(`/app/feed/${analise.data.postId}`);
  revalidatePath("/app/feed");
  return {};
}

/**
 * Curte ou descurte. A chave primária `(post_id, user_id)` é o que garante uma
 * curtida por pessoa — sem ela, dois toques rápidos virariam dois registros.
 *
 * Devolve o estado final em vez de `void` porque a tela é otimista: ela já
 * pintou o coração, e precisa saber se deve desfazer.
 */
export async function alternarCurtida(
  postId: string,
  curtido: boolean,
): Promise<{ ok: boolean }> {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { error } = curtido
    ? await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", student.id)
    : await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: student.id });

  if (error) return { ok: false };

  revalidatePath(`/app/feed/${postId}`);
  revalidatePath("/app/feed");
  return { ok: true };
}
