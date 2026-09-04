import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  ResumoDoTreino,
  type RecordeNaTela,
} from "@/components/aluno/resumo-do-treino";
import { requireStudent } from "@/lib/auth/session";
import type { SerieDaExecucao } from "@/lib/domain/execucao";
import { agruparPorExercicio } from "@/lib/domain/historico";
import { recordesDaSessao, type SerieRecemFeita } from "@/lib/domain/recordes";
import { seriesDaSessao, ultimaSessaoConcluida } from "@/lib/queries/execucao";
import { chaveDoExercicio } from "@/lib/queries/exercicios";
import { recordesAntesDaSessao } from "@/lib/queries/recordes";
import { lerTreino, type ExercicioPrescrito } from "@/lib/queries/treinos";

export const metadata: Metadata = { title: "Treino concluído" };

/**
 * Conclusão do treino (doc 05, seção 6).
 *
 * O resumo é lido do banco, não recebido pela navegação: números vindos da URL
 * seriam editáveis, e o que a tela celebra tem que ser o que ficou gravado.
 * Vale em dobro para o recorde.
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

  const referencias = treino.exercicios.map((e) => ({
    exercise_id: e.exercicio.id,
    exercise_source: e.exercicio.source,
  }));

  const [series, recordeAnterior] = await Promise.all([
    seriesDaSessao(sessao.id),
    // "Antes desta sessão": incluir a sessão que acabou faria a marca nova ser
    // o próprio teto a superar, e nenhum recorde apareceria nunca.
    recordesAntesDaSessao(student.id, referencias, sessao.id),
  ]);

  return (
    <ResumoDoTreino
      label={treino.label}
      nome={treino.name}
      duracaoSegundos={sessao.duration_seconds}
      series={series}
      recordes={recordesDaTela(treino.exercicios, series, recordeAnterior)}
    />
  );
}

/**
 * Cruza as séries desta sessão com as marcas anteriores e devolve o que a tela
 * desenha.
 *
 * A varredura é na ordem da prescrição de propósito: é ela que dá a ordem do
 * destaque, e é ela que resolve a identidade do exercício — `session_sets` só
 * guarda `workout_exercise_id`, que é uma linha de prescrição.
 *
 * Série cuja linha sumiu da prescrição (o exercício próprio apagado do handoff
 * `prescricao.md`) fica de fora: sem a linha não há como saber que exercício
 * era, e um recorde sem nome não é conquista, é enigma.
 */
function recordesDaTela(
  exercicios: ExercicioPrescrito[],
  series: SerieDaExecucao[],
  recordeAnterior: Map<string, number>,
): RecordeNaTela[] {
  const porLinha = agruparPorExercicio(series);

  const nomePorChave = new Map<string, string>();
  const recemFeitas: SerieRecemFeita[] = [];

  for (const prescrito of exercicios) {
    const chave = chaveDoExercicio({
      exercise_id: prescrito.exercicio.id,
      exercise_source: prescrito.exercicio.source,
    });
    if (!nomePorChave.has(chave)) {
      nomePorChave.set(chave, prescrito.exercicio.name);
    }
    for (const serie of porLinha.get(prescrito.id) ?? []) {
      recemFeitas.push({
        chave,
        load_kg: serie.load_kg,
        reps: serie.reps,
        skipped: serie.skipped,
      });
    }
  }

  return recordesDaSessao(recemFeitas, recordeAnterior).flatMap((recorde) => {
    const nome = nomePorChave.get(recorde.chave);
    return nome ? [{ ...recorde, nome }] : [];
  });
}
