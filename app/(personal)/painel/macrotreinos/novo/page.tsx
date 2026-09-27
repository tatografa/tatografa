import { redirect } from "next/navigation";

import { pareceUuid } from "@/lib/domain/id";

/** "Novo programa" virou a aba "Novo" do painel de macrociclos, em Treinos. */
export default async function NovoProgramaAntigoPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno } = await searchParams;
  redirect(
    aluno && pareceUuid(aluno)
      ? `/painel/treinos?aluno=${aluno}&novo=1`
      : "/painel/treinos?novo=1",
  );
}
