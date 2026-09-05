import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TelaSessaoDoHistorico } from "@/components/aluno/tela-sessao-do-historico";
import { requireTrainer } from "@/lib/auth/session";
import { lerAluno } from "@/lib/queries/alunos";
import { lerSessaoDoHistorico } from "@/lib/queries/historico";

export const metadata: Metadata = { title: "Sessão do aluno" };

/**
 * Uma sessão do aluno, série a série, vista pelo personal.
 *
 * A tela é **a mesma** do app do aluno: só o link de voltar muda. Reescrever o
 * detalhe aqui duplicaria a regra de série ausente, pulada e órfã — três
 * estados que o M1-06 levou um card inteiro para acertar —, e as duas cópias
 * divergiriam na primeira correção.
 */
export default async function SessaoDoAluno(
  props: PageProps<"/painel/alunos/[id]/sessoes/[sessaoId]">,
) {
  const { id, sessaoId } = await props.params;
  await requireTrainer();

  const aluno = await lerAluno(id);
  if (!aluno) notFound();

  // `lerSessaoDoHistorico` filtra por `student_id`, então uma sessão de outro
  // aluno com este id na URL devolve nulo em vez de vazar o treino alheio.
  const sessao = await lerSessaoDoHistorico(aluno.id, sessaoId);
  if (!sessao) notFound();

  return (
    <TelaSessaoDoHistorico
      sessao={sessao}
      voltarPara={{ href: `/painel/alunos/${aluno.id}`, rotulo: aluno.name }}
    />
  );
}
