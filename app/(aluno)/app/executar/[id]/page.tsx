import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireStudent } from "@/lib/auth/session";
import { seriesDaSessao, sessaoAbertaDoAluno } from "@/lib/queries/execucao";
import { lerTreino } from "@/lib/queries/treinos";

import { Execucao } from "./execucao";
import { TelaComecar, TelaSessaoPendente } from "./inicio";

export const metadata: Metadata = { title: "Executar treino" };

/**
 * A tela de execução. Três estados, decididos no servidor:
 *
 * 1. sem sessão aberta → confirmação para começar;
 * 2. sessão aberta **deste** treino → a execução, retomada de onde parou;
 * 3. sessão aberta de **outro** treino → a escolha entre retomar aquele e
 *    encerrá-lo (o índice único parcial só permite uma sessão por aluno).
 *
 * Nada é gravado aqui: abrir a sessão é uma Server Action disparada por
 * formulário, senão um refresh da página criaria sessão atrás de sessão.
 */
export default async function ExecutarTreino(
  props: PageProps<"/app/executar/[id]">,
) {
  const { id } = await props.params;
  const { student } = await requireStudent();

  const treino = await lerTreino(id);
  // `lerTreino` já é filtrado pelo RLS, mas a conferência explícita está aqui
  // porque a policy libera o personal também: um personal logado no app do
  // aluno não pode abrir uma execução.
  if (!treino || treino.aluno.id !== student.id) notFound();
  // Treino sem exercício não tem o que executar, e uma sessão aberta nele
  // travaria o aluno até alguém descartá-la.
  if (!treino.exercicios.length) notFound();

  const aberta = await sessaoAbertaDoAluno(student.id);

  if (!aberta) return <TelaComecar treino={treino} />;

  if (aberta.workout_id !== treino.id) {
    return <TelaSessaoPendente treino={treino} pendente={aberta} />;
  }

  const series = await seriesDaSessao(aberta.id);

  return (
    <Execucao
      treino={treino}
      sessao={{ id: aberta.id, started_at: aberta.started_at }}
      seriesIniciais={series}
    />
  );
}
