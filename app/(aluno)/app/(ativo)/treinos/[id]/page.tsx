import { notFound } from "next/navigation";

import { TelaDetalheDoTreino } from "@/components/aluno/tela-detalhe-do-treino";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { lerTreino } from "@/lib/queries/treinos";

export default async function DetalheDoTreino(
  props: PageProps<"/app/treinos/[id]">,
) {
  const { id } = await props.params;

  const treino = await lerTreino(id);
  // Nulo é "não existe" tanto para id inventado quanto para treino de outro
  // aluno. Responder 404 nos dois casos evita contar a um estranho que aquele
  // id existe.
  if (!treino) notFound();

  const { idioma } = await textosDoApp();
  return <TelaDetalheDoTreino treino={treino} idioma={idioma} />;
}
