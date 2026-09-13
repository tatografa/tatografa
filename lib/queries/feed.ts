import "server-only";

import { rotuloDoDia } from "@/lib/domain/historico";
import { pareceUuid } from "@/lib/domain/id";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

/**
 * Quantos posts uma aba carrega. Feed sem teto cresce para sempre numa tela
 * aberta no celular, e a foto é o que mais pesa.
 */
export const LIMITE_DO_FEED = 30;

/** Validade da URL assinada da foto. */
const MINUTOS_DA_URL = 60;

export type AbaDoFeed = "publico" | "personal";

export type AutorDoPost = {
  id: string;
  nome: string;
  /** Iniciais para o avatar: não há upload de foto de perfil ainda. */
  iniciais: string;
};

export type PostDoFeed = {
  id: string;
  autor: AutorDoPost;
  /** Verdadeiro quando o post é de quem está olhando. */
  meu: boolean;
  legenda: string | null;
  /** URL assinada, ou nulo quando o post não tem foto. */
  fotoUrl: string | null;
  visibilidade: Enums<"post_visibility">;
  criadoEm: string;
  /**
   * "Hoje", "Ontem" ou "ter, 8 de set" — formatado **no servidor**, com fuso
   * fixo, pelo mesmo `rotuloDoDia` do histórico. A hora vem do aparelho
   * (`HoraLocal`), mas a data não pode: sem ela o card fica sem identidade até
   * a hidratação. Mesma decisão de 2026-09-01.
   */
  rotuloDoDia: string;
  curtidas: number;
  /** Se quem está olhando já curtiu — decide o estado do botão. */
  curtiPor: boolean;
  comentarios: number;
};

/**
 * Os posts de uma aba.
 *
 * **As duas abas do doc 05, traduzidas em regra:**
 * - `publico` — o mural da turma: o que os alunos do mesmo personal marcaram
 *   como visível para os colegas, incluindo os do próprio aluno.
 * - `personal` — a conversa com quem treina você: só os **seus** posts, das
 *   duas visibilidades. É onde o personal comenta.
 *
 * O RLS já limita o que sai do banco; o filtro aqui é de **produto**, não de
 * segurança. Um erro nesta função mostra post a menos, nunca a mais — e é
 * assim que tem de ser.
 */
export async function lerFeed(
  alunoId: string,
  aba: AbaDoFeed,
): Promise<PostDoFeed[]> {
  const supabase = await createClient();

  let consulta = supabase
    .from("posts")
    .select("id, student_id, caption, photo_path, visibility, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMITE_DO_FEED);

  consulta =
    aba === "personal"
      ? consulta.eq("student_id", alunoId)
      : consulta.eq("visibility", "publico");

  const { data: posts, error } = await consulta;
  if (error) throw error;
  if (!posts?.length) return [];

  const ids = posts.map((p) => p.id);
  const autores = [...new Set(posts.map((p) => p.student_id))];
  const caminhos = posts.map((p) => p.photo_path).filter((c) => c !== null);

  // Tudo em lote, em paralelo: uma consulta por tipo de dado, nunca uma por
  // post. São quatro idas ao servidor para trinta posts.
  const [nomes, curtidas, minhasCurtidas, comentarios, urls] = await Promise.all([
    // RPC e não `from("students")`: `students_select` devolve ao aluno **só a
    // própria linha**, então buscar direto trazia um nome e deixava todo colega
    // como "Aluno". `nomes_no_feed` (migration 0020) devolve só `(id, name)` e
    // só de quem compartilha turma com quem pergunta.
    supabase.rpc("nomes_no_feed", { p_ids: autores }),
    supabase.from("post_likes").select("post_id").in("post_id", ids),
    supabase
      .from("post_likes")
      .select("post_id")
      .in("post_id", ids)
      .eq("user_id", alunoId),
    supabase.from("post_comments").select("post_id").in("post_id", ids),
    caminhos.length
      ? supabase.storage
          .from("treinos")
          .createSignedUrls(caminhos, MINUTOS_DA_URL * 60)
      : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
  ]);

  if (nomes.error) throw nomes.error;

  const nomePor = new Map((nomes.data ?? []).map((a) => [a.id, a.name]));
  const urlPor = new Map(
    (urls.data ?? [])
      .filter((u) => u.path)
      .map((u) => [u.path as string, u.signedUrl]),
  );

  const contar = (linhas: { post_id: string }[] | null) => {
    const mapa = new Map<string, number>();
    for (const { post_id } of linhas ?? []) {
      mapa.set(post_id, (mapa.get(post_id) ?? 0) + 1);
    }
    return mapa;
  };

  const totalCurtidas = contar(curtidas.data);
  const totalComentarios = contar(comentarios.data);
  const curti = new Set((minhasCurtidas.data ?? []).map((l) => l.post_id));

  return posts.map((p) => {
    const nome = nomePor.get(p.student_id) ?? "Aluno";
    return {
      id: p.id,
      autor: { id: p.student_id, nome, iniciais: iniciaisDe(nome) },
      meu: p.student_id === alunoId,
      legenda: p.caption,
      fotoUrl: p.photo_path ? (urlPor.get(p.photo_path) ?? null) : null,
      visibilidade: p.visibility,
      criadoEm: p.created_at,
      rotuloDoDia: rotuloDoDia(p.created_at),
      curtidas: totalCurtidas.get(p.id) ?? 0,
      curtiPor: curti.has(p.id),
      comentarios: totalComentarios.get(p.id) ?? 0,
    };
  });
}

/**
 * Iniciais do nome, no máximo duas.
 *
 * Fica aqui e não numa função de tela porque o avatar do feed e o do detalhe
 * precisam da mesma regra — duas cópias divergiriam na primeira pessoa com
 * nome composto.
 */
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export type ComentarioDoPost = {
  id: string;
  autorNome: string;
  autorIniciais: string;
  /** O personal da turma comentando — vira selo, como no card do feed. */
  doPersonal: boolean;
  meu: boolean;
  texto: string;
  criadoEm: string;
  rotuloDoDia: string;
};

export type PostDetalhado = PostDoFeed & {
  comentarios: number;
  listaDeComentarios: ComentarioDoPost[];
};

/**
 * Um post com os comentários.
 *
 * Devolve `null` para id inexistente, post de fora da turma e id fora do
 * formato — os três são "não existe" para quem está olhando, e distinguir
 * contaria a um estranho que aquele post existe. Mesma regra do histórico.
 *
 * **O nome do autor do comentário vem de duas fontes**, porque o comentário
 * pode ser do personal: `post_comments.author_id` aponta para `auth.users`, não
 * para `students`. O personal é resolvido pelo `personal` que a sessão já traz;
 * os alunos, pelo mesmo `nomes_no_feed` do feed.
 */
export async function lerPost(
  alunoId: string,
  postId: string,
  personal: { id: string; nome: string },
): Promise<PostDetalhado | null> {
  if (!pareceUuid(postId)) return null;

  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, student_id, caption, photo_path, visibility, created_at")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  if (!post) return null;

  const [nomes, curtidas, minhaCurtida, comentarios, url] = await Promise.all([
    supabase.rpc("nomes_no_feed", { p_ids: [post.student_id] }),
    supabase.from("post_likes").select("post_id").eq("post_id", postId),
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", alunoId)
      .maybeSingle(),
    supabase
      .from("post_comments")
      .select("id, author_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at"),
    post.photo_path
      ? supabase.storage
          .from("treinos")
          .createSignedUrl(post.photo_path, MINUTOS_DA_URL * 60)
      : Promise.resolve({ data: null }),
  ]);

  if (nomes.error) throw nomes.error;
  if (comentarios.error) throw comentarios.error;

  const autoresDeComentario = [
    ...new Set((comentarios.data ?? []).map((c) => c.author_id)),
  ].filter((id) => id !== personal.id);

  const { data: nomesDosComentarios } = autoresDeComentario.length
    ? await supabase.rpc("nomes_no_feed", { p_ids: autoresDeComentario })
    : { data: [] };

  const nomePor = new Map<string, string>([
    ...(nomes.data ?? []).map((a) => [a.id, a.name] as const),
    ...(nomesDosComentarios ?? []).map((a) => [a.id, a.name] as const),
    [personal.id, personal.nome],
  ]);

  const nomeDoAutor = nomePor.get(post.student_id) ?? "Aluno";

  return {
    id: post.id,
    autor: {
      id: post.student_id,
      nome: nomeDoAutor,
      iniciais: iniciaisDe(nomeDoAutor),
    },
    meu: post.student_id === alunoId,
    legenda: post.caption,
    fotoUrl: url.data?.signedUrl ?? null,
    visibilidade: post.visibility,
    criadoEm: post.created_at,
    rotuloDoDia: rotuloDoDia(post.created_at),
    curtidas: curtidas.data?.length ?? 0,
    curtiPor: minhaCurtida.data !== null,
    comentarios: comentarios.data?.length ?? 0,
    listaDeComentarios: (comentarios.data ?? []).map((c) => {
      const nome = nomePor.get(c.author_id) ?? "Alguém da turma";
      return {
        id: c.id,
        autorNome: nome,
        autorIniciais: iniciaisDe(nome),
        doPersonal: c.author_id === personal.id,
        meu: c.author_id === alunoId,
        texto: c.body,
        criadoEm: c.created_at,
        rotuloDoDia: rotuloDoDia(c.created_at),
      };
    }),
  };
}
