"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/session";
import { LIMITE_DA_LEGENDA } from "@/lib/domain/feed";
import { pareceUuid } from "@/lib/domain/id";
import {
  esquemaDeComentario,
  gravarComentario,
  gravarCurtida,
} from "@/lib/feed/escrita";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { preencher } from "@/lib/i18n/texto";
import { resumoDaSessaoConcluida } from "@/lib/queries/feed";
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

/**
 * As mensagens no idioma do app — por isso o esquema é montado na hora: o
 * idioma é o da requisição (o cookie), não o do módulo.
 */
async function mensagens() {
  return (await textosDoApp()).t.feed.acoes;
}

function esquemaDoPost(m: Awaited<ReturnType<typeof mensagens>>) {
  return z.object({
    legenda: z
      .string()
      .trim()
      .max(LIMITE_DA_LEGENDA, preencher(m.legendaLonga, { n: LIMITE_DA_LEGENDA })),
    alcance: z.enum(["personal", "publico"], { error: m.alcance }),
  });
}

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

  const m = await mensagens();
  const analise = esquemaDoPost(m).safeParse(bruto);
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
      errosPorCampo: { legenda: m.vazio },
      campos: bruto,
    };
  }

  if (temFoto) {
    if (!EXTENSAO_POR_TIPO[foto.type]) {
      return {
        errosPorCampo: { foto: m.tipoDaFoto },
        campos: bruto,
      };
    }
    if (foto.size > LIMITE_DE_BYTES) {
      return {
        errosPorCampo: { foto: m.tamanhoDaFoto },
        campos: bruto,
      };
    }
  }

  const { student } = await requireStudent();
  const supabase = await createClient();

  /*
   * A sessão vem de um campo escondido, então **não se confia nela**: é
   * conferida aqui de novo, como sendo do aluno e concluída. Um id inválido não
   * derruba a publicação — vira post avulso, que é o que ele já era antes desta
   * ligação existir. Recusar o post inteiro puniria o aluno por uma URL torta.
   */
  const sessao = String(formData.get("sessao") ?? "");
  const sessaoValida =
    sessao && (await resumoDaSessaoConcluida(student.id, sessao)) ? sessao : null;

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
      return { erro: m.falhaFoto, campos: bruto };
    }
  }

  const { error } = await supabase.from("posts").insert({
    student_id: student.id,
    caption: legenda || null,
    photo_path: caminho,
    visibility: alcance,
    session_id: sessaoValida,
  });

  if (error) {
    if (caminho) await supabase.storage.from("treinos").remove([caminho]);
    return { erro: m.falhaPublicar, campos: bruto };
  }

  revalidatePath("/app/feed");
  redirect(alcance === "publico" ? "/app/feed" : "/app/feed?aba=personal");
}

export type EstadoDoComentario = {
  erro?: string;
  /** O texto volta para o campo quando a validação recusa. */
  texto?: string;
};

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

  const m = await mensagens();
  const analise = esquemaDeComentario.safeParse(bruto);
  if (!analise.success) {
    // O esquema é o mesmo do painel (em português); aqui só a mensagem muda de
    // idioma, decidida pelo campo e pelo tipo do problema.
    const problema = analise.error.issues[0];
    const erro =
      problema?.path[0] === "postId"
        ? m.postInvalido
        : problema?.code === "too_big"
          ? preencher(m.comentarioLongo, { n: LIMITE_DA_LEGENDA })
          : m.comentarioVazio;
    return { erro, texto: bruto.texto };
  }

  const { student } = await requireStudent();
  const ok = await gravarComentario(student.id, analise.data.postId, analise.data.texto);

  if (!ok) {
    return { erro: m.falhaComentario, texto: bruto.texto };
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
  const ok = await gravarCurtida(student.id, postId, curtido);
  if (!ok) return { ok: false };

  revalidatePath(`/app/feed/${postId}`);
  revalidatePath("/app/feed");
  return { ok: true };
}

export type EstadoDaExclusao = { erro?: string };

/**
 * Apaga um post do próprio aluno.
 *
 * **A linha sai antes do arquivo, e é de propósito.** Ao contrário, uma falha
 * no meio deixaria o post no feed apontando para uma foto que não existe mais —
 * card quebrado, e pior: o aluno acharia que apagou e a foto ainda estaria lá.
 * Nesta ordem, o pior caso é um objeto órfão no Storage, que ninguém alcança
 * porque a policy de leitura exige um post visível apontando para ele.
 *
 * Curtidas e comentários vão junto por cascata. Quem apaga é só o autor: o
 * personal não apaga post de aluno (`posts_delete`, migration 0018).
 */
export async function apagarPost(
  _anterior: EstadoDaExclusao,
  formData: FormData,
): Promise<EstadoDaExclusao> {
  const postId = String(formData.get("postId") ?? "");
  const m = await mensagens();
  if (!pareceUuid(postId)) return { erro: m.postInvalido };

  const { student } = await requireStudent();
  const supabase = await createClient();

  // O caminho da foto precisa ser lido antes: depois do delete ele não existe
  // mais em lugar nenhum, e o arquivo ficaria no Storage sem ninguém saber.
  const { data: post } = await supabase
    .from("posts")
    .select("photo_path")
    .eq("id", postId)
    .eq("student_id", student.id)
    .maybeSingle();

  if (!post) return { erro: m.postSumiu };

  // `delete` barrado pelo RLS não levanta erro: afeta zero linhas em silêncio.
  // Por isso o `select` de volta — é ele que prova que a linha saiu.
  const { data: apagados, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .select("id");

  if (error || !apagados?.length) {
    return { erro: m.falhaApagar };
  }

  if (post.photo_path) {
    await supabase.storage.from("treinos").remove([post.photo_path]);
  }

  revalidatePath("/app/feed");
  redirect("/app/feed");
}
