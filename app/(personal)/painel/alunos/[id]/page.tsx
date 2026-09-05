import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaDoAluno } from "@/components/personal/ficha-do-aluno";
import { requireTrainer } from "@/lib/auth/session";
import { lerAluno } from "@/lib/queries/alunos";
import { listarHistorico } from "@/lib/queries/historico";
import { programaAtivoDoAluno } from "@/lib/queries/macrotreinos";
import { progressoDoAluno } from "@/lib/queries/progresso";

export const metadata: Metadata = { title: "Aluno" };

/**
 * A ficha do aluno (doc 06). Paga a dívida do M1: a lista do painel virou
 * cartão sem link porque esta rota não existia.
 *
 * As três leituras do histórico são as **mesmas** que o app do aluno usa —
 * `listarHistorico` e `progressoDoAluno` já funcionam para o personal, porque
 * `workout_sessions_select` libera `private.trainer_of(student_id)` e
 * `session_sets_select` passa por `can_read_session`. Nenhuma policy nova, e
 * nenhum número recalculado: o que o personal vê é o que o aluno vê.
 */
export default async function AlunoDoPainel(
  props: PageProps<"/painel/alunos/[id]">,
) {
  const { id } = await props.params;
  await requireTrainer();

  // Aluno de outro personal e id inexistente dão o mesmo 404: distinguir
  // contaria a um estranho que aquele id existe.
  const aluno = await lerAluno(id);
  if (!aluno) notFound();

  const [programa, sessoes, exercicios] = await Promise.all([
    programaAtivoDoAluno(aluno.id),
    listarHistorico(aluno.id),
    progressoDoAluno(aluno.id),
  ]);

  return (
    <FichaDoAluno
      aluno={aluno}
      programa={programa}
      sessoes={sessoes}
      exercicios={exercicios}
    />
  );
}
