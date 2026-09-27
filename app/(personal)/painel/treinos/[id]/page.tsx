import { redirect } from "next/navigation";

import { lerTreino } from "@/lib/queries/treinos";

/**
 * O editor de um treino só morava aqui até 27/09. Agora o treino é um cartão
 * no quadro do programa; o endereço antigo leva ao programa dele.
 */
export default async function TreinoAntigoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const treino = await lerTreino(id);
  if (!treino) redirect("/painel/treinos");
  redirect(`/painel/treinos?aluno=${treino.aluno.id}&programa=${treino.macrotreino.id}`);
}
