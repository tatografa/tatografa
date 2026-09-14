import "server-only";

import type { PeriodoDoSocial } from "@/lib/domain/feed";
import { rotuloDoDia } from "@/lib/domain/historico";
import { iniciaisDe } from "@/lib/domain/nome";
import { type ComentarioDoPost } from "@/lib/queries/feed";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

/** Quantos posts a tela carrega por período. */
export const LIMITE_DO_SOCIAL = 60;

/** Validade da URL assinada da foto. */
const MINUTOS_DA_URL = 60;

export type PostDaCarteira = {
  id: string;
  aluno: { id: string; nome: string; iniciais: string };
  legenda: string | null;
  fotoUrl: string | null;
  visibilidade: Enums<"post_visibility">;
  criadoEm: string;
  rotuloDoDia: string;
  curtidas: number;
  curtiPor: boolean;
  comentarios: ComentarioDoPost[];
  /** Verdadeiro quando o personal ainda não respondeu nada neste post. */
  semResposta: boolean;
};

/**
 * Os posts dos alunos do personal, do mais recente para o mais antigo.
 *
 * **Esta tela é a outra ponta de `visibility = 'personal'`.** O aluno escolhe
 * "só o meu personal" — que é o padrão do compositor e o que a política de
 * privacidade recomenda — e sem esta consulta esse post não tinha para onde ir:
 * o RLS liberava, e nenhuma tela lia. O feed do aluno não serve: a aba "Da
 * turma" só mostra `publico`, e "Com meu personal" mostra os posts **do próprio
 * aluno**.
 *
 * Cinco consultas fixas — posts, alunos, curtidas, minhas curtidas e
 * comentários —, mais as URLs assinadas em lote. Uma por post seria N+1 numa
 * tela que cresce com a carteira.
 *
 * Os comentários vêm inteiros, e não contados: o valor da tela é **a conversa**,
 * e abrir um post para ler duas linhas seria um toque a mais em cada um.
 */
export async function lerPostsDaCarteira(
  trainerId: string,
  periodo: PeriodoDoSocial,
): Promise<PostDaCarteira[]> {
  const supabase = await createClient();

  let consulta = supabase
    .from("posts")
    .select("id, student_id, caption, photo_path, visibility, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMITE_DO_SOCIAL);

  if (periodo !== "tudo") {
    const desde = new Date(Date.now() - Number(periodo) * 24 * 60 * 60 * 1000);
    consulta = consulta.gte("created_at", desde.toISOString());
  }

  const { data: posts, error } = await consulta;
  if (error) throw error;
  if (!posts?.length) return [];

  const ids = posts.map((p) => p.id);
  const autores = [...new Set(posts.map((p) => p.student_id))];
  const caminhos = posts.map((p) => p.photo_path).filter((c) => c !== null);

  const [alunos, curtidas, minhasCurtidas, comentarios, urls] = await Promise.all([
    // Sem RPC aqui, ao contrário do feed do aluno: `students_select` já devolve
    // ao personal a carteira inteira (`trainer_id = auth.uid()`).
    supabase.from("students").select("id, name").in("id", autores),
    supabase.from("post_likes").select("post_id").in("post_id", ids),
    supabase
      .from("post_likes")
      .select("post_id")
      .in("post_id", ids)
      .eq("user_id", trainerId),
    supabase
      .from("post_comments")
      .select("id, post_id, author_id, body, created_at")
      .in("post_id", ids)
      .order("created_at"),
    caminhos.length
      ? supabase.storage.from("treinos").createSignedUrls(caminhos, MINUTOS_DA_URL * 60)
      : Promise.resolve({ data: [] as { path: string | null; signedUrl: string }[] }),
  ]);

  if (alunos.error) throw alunos.error;
  if (comentarios.error) throw comentarios.error;

  const nomePor = new Map((alunos.data ?? []).map((a) => [a.id, a.name]));
  const urlPor = new Map(
    (urls.data ?? []).filter((u) => u.path).map((u) => [u.path as string, u.signedUrl]),
  );

  const totalCurtidas = new Map<string, number>();
  for (const { post_id } of curtidas.data ?? []) {
    totalCurtidas.set(post_id, (totalCurtidas.get(post_id) ?? 0) + 1);
  }
  const curti = new Set((minhasCurtidas.data ?? []).map((l) => l.post_id));

  const porPost = new Map<string, ComentarioDoPost[]>();
  for (const c of comentarios.data ?? []) {
    const doPersonal = c.author_id === trainerId;
    const nome = doPersonal ? "Você" : (nomePor.get(c.author_id) ?? "Aluno");
    const lista = porPost.get(c.post_id) ?? [];
    lista.push({
      id: c.id,
      autorNome: nome,
      autorIniciais: iniciaisDe(nome === "Você" ? "V" : nome),
      doPersonal,
      meu: doPersonal,
      texto: c.body,
      criadoEm: c.created_at,
      rotuloDoDia: rotuloDoDia(c.created_at),
    });
    porPost.set(c.post_id, lista);
  }

  return posts.map((p) => {
    const nome = nomePor.get(p.student_id) ?? "Aluno";
    const doPost = porPost.get(p.id) ?? [];
    return {
      id: p.id,
      aluno: { id: p.student_id, nome, iniciais: iniciaisDe(nome) },
      legenda: p.caption,
      fotoUrl: p.photo_path ? (urlPor.get(p.photo_path) ?? null) : null,
      visibilidade: p.visibility,
      criadoEm: p.created_at,
      rotuloDoDia: rotuloDoDia(p.created_at),
      curtidas: totalCurtidas.get(p.id) ?? 0,
      curtiPor: curti.has(p.id),
      comentarios: doPost,
      semResposta: !doPost.some((c) => c.doPersonal),
    };
  });
}
