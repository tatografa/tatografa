import type { Metadata } from "next";

import { TelaProgresso } from "@/components/aluno/tela-progresso";
import { requireStudent } from "@/lib/auth/session";
import { progressoDoAluno } from "@/lib/queries/progresso";

export const metadata: Metadata = { title: "Progresso" };

/**
 * A evolução do aluno por exercício (doc 05).
 *
 * Tudo é lido de uma vez e agrupado no servidor: a tela é consultada na
 * academia, e abrir um acordeão ou trocar o intervalo não deveria depender da
 * internet de lá.
 */
export default async function Progresso() {
  const { student } = await requireStudent();
  const exercicios = await progressoDoAluno(student.id);

  return <TelaProgresso exercicios={exercicios} />;
}
