import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TelaSessaoDoHistorico } from "@/components/aluno/tela-sessao-do-historico";
import { requireStudent } from "@/lib/auth/session";
import { lerSessaoDoHistorico } from "@/lib/queries/historico";

export const metadata: Metadata = { title: "Treino do histórico" };

/**
 * Detalhe de uma sessão concluída.
 *
 * Sessão de outro aluno, id inexistente e sessão em andamento caem no mesmo
 * 404: a leitura já filtra por `student_id`, e responder coisa diferente para
 * cada caso contaria a um estranho que aquele id existe.
 */
export default async function SessaoDoHistorico(
  props: PageProps<"/app/historico/[sessaoId]">,
) {
  const { sessaoId } = await props.params;
  const { student } = await requireStudent();

  const sessao = await lerSessaoDoHistorico(student.id, sessaoId);
  if (!sessao) notFound();

  return <TelaSessaoDoHistorico sessao={sessao} />;
}
