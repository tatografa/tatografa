import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ResumoDoTreino } from "@/components/aluno/resumo-do-treino";
import { requireStudent } from "@/lib/auth/session";
import { seriesDaSessao, ultimaSessaoConcluida } from "@/lib/queries/execucao";
import { lerTreino } from "@/lib/queries/treinos";

export const metadata: Metadata = { title: "Treino concluído" };

/**
 * Conclusão do treino (doc 05, seção 6).
 *
 * O resumo é lido do banco, não recebido pela navegação: números vindos da URL
 * seriam editáveis, e o que a tela celebra tem que ser o que ficou gravado.
 */
export default async function FimDoTreino(
  props: PageProps<"/app/executar/[id]/fim">,
) {
  const { id } = await props.params;
  const { student } = await requireStudent();

  const treino = await lerTreino(id);
  if (!treino || treino.aluno.id !== student.id) notFound();

  const sessao = await ultimaSessaoConcluida(student.id, treino.id);
  // Sem sessão concluída não há o que resumir: acontece se alguém abrir a URL
  // direto. Volta para o treino em vez de mostrar um resumo zerado.
  if (!sessao) redirect(`/app/treinos/${treino.id}`);

  const series = await seriesDaSessao(sessao.id);

  return (
    <ResumoDoTreino
      label={treino.label}
      nome={treino.name}
      duracaoSegundos={sessao.duration_seconds}
      series={series}
    />
  );
}
