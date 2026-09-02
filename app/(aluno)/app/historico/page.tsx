import type { Metadata } from "next";

import { TelaHistorico } from "@/components/aluno/tela-historico";
import { requireStudent } from "@/lib/auth/session";
import { listarHistorico } from "@/lib/queries/historico";

export const metadata: Metadata = { title: "Histórico" };

export default async function HistoricoDoAluno() {
  const { student } = await requireStudent();
  const sessoes = await listarHistorico(student.id);

  return <TelaHistorico sessoes={sessoes} />;
}
