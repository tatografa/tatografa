import { redirect } from "next/navigation";

import { lerMacrotreino } from "@/lib/queries/macrotreinos";

/**
 * O endereço antigo de um programa. Leva ao mesmo programa na divisão de
 * treino; id torto ou de outro personal cai na tela sem ele, como qualquer
 * palpite de URL ali.
 */
export default async function ProgramaAntigoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const programa = await lerMacrotreino(id);
  if (!programa) redirect("/painel/treinos");
  redirect(`/painel/treinos?aluno=${programa.aluno.id}&programa=${programa.id}`);
}
