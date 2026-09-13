import "server-only";

import { rotuloDoDia } from "@/lib/domain/historico";
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
    supabase.from("students").select("id, name").in("id", autores),
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

  // As contagens e os nomes podem falhar sozinhos sem derrubar o feed — um
  // card sem contador ainda é um card. Já a foto não: é o conteúdo do post.
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
