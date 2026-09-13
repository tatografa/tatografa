import type { Metadata } from "next";

import { requireStudent } from "@/lib/auth/session";
import { lerFeed, type AbaDoFeed } from "@/lib/queries/feed";

import { FeedNavegavel } from "./feed-navegavel";

export const metadata: Metadata = { title: "Feed" };

/**
 * O feed do aluno (doc 05, tela 9).
 *
 * A aba vem da URL e é **validada aqui**, não confiada: `?aba=` é texto que o
 * aluno pode editar, e um valor desconhecido tem de cair na aba padrão em vez
 * de virar uma consulta com filtro inválido.
 */
export default async function FeedPage({ searchParams }: PageProps<"/app/feed">) {
  const { aba } = await searchParams;
  const escolhida: AbaDoFeed = aba === "personal" ? "personal" : "publico";

  const { student, personal } = await requireStudent();
  const posts = await lerFeed(student.id, escolhida);

  return (
    <FeedNavegavel
      posts={posts}
      aba={escolhida}
      nomeDoPersonal={personal.name}
    />
  );
}
