import { redirect } from "next/navigation";

import { lerMacrotreino } from "@/lib/queries/macrotreinos";

/**
 * "Novo treino" virou o "Novo treino" do quadro, dentro do programa. O
 * endereço antigo leva ao programa certo, onde o botão está.
 */
export default async function NovoTreinoAntigoPage({
  searchParams,
}: {
  searchParams: Promise<{ programa?: string }>;
}) {
  const { programa: programaId } = await searchParams;
  const programa = programaId ? await lerMacrotreino(programaId) : null;
  if (!programa) redirect("/painel/treinos");
  redirect(`/painel/treinos?aluno=${programa.aluno.id}&programa=${programa.id}`);
}
