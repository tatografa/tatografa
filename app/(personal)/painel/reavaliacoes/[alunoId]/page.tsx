import { notFound } from "next/navigation";

import { Comparacao } from "@/components/reavaliacao/comparacao";
import { Card } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";
import { pareceUuid } from "@/lib/domain/id";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { preencher } from "@/lib/i18n/texto";
import { lerAluno } from "@/lib/queries/alunos";
import { comparar, lerReavaliacoesDeUmAluno } from "@/lib/queries/reavaliacao";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";

/**
 * As reavaliações respondidas de um aluno, cada uma comparada com a anterior.
 *
 * **Rota aninhada: o id da URL é uma afirmação.** O RLS devolve ao personal
 * todos os alunos da carteira, então `/painel/reavaliacoes/<aluno>` passaria
 * pela policy com o id de qualquer um deles — o que amarra a tela ao aluno
 * certo é o filtro por `student_id` dentro da consulta, não a policy.
 */
export default async function ReavaliacoesDoAluno({
  params,
}: PageProps<"/painel/reavaliacoes/[alunoId]">) {
  const { alunoId } = await params;
  if (!pareceUuid(alunoId)) notFound();

  const { trainer } = await requireTrainer();
  const { idioma, t, f } = await textosDoPainel();
  const d = t.agenda.doAluno;

  const [aluno, todas] = await Promise.all([
    lerAluno(alunoId),
    lerReavaliacoesDeUmAluno(trainer.id, alunoId, { comFotos: true }),
  ]);

  if (!aluno) notFound();

  // Só as respondidas: a aberta ainda não tem nada para comparar, e ela já
  // aparece na fila da página anterior.
  const enviadas = todas.filter((r) => r.enviadaEm !== null);

  return (
    <div className="space-y-8">
      <CabecalhoDaPagina
        titulo={aluno.name}
        subtitulo={d.subtitulo}
        voltar={{ href: "/painel/agenda", rotulo: d.voltar }}
      />

      {enviadas.length === 0 ? (
        <Card size="lg" className="text-center">
          <p className="text-[13px] text-ink-4">
            {d.nenhuma}
          </p>
        </Card>
      ) : (
        <div className="space-y-10">
          {enviadas.map((r, i) => {
            // `enviadas` vem da mais recente para a mais antiga, então a
            // anterior no tempo é a **próxima** da lista.
            const anterior = enviadas[i + 1] ?? null;
            return (
              <section key={r.id} className="space-y-3">
                <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                  {/* "Hoje" no começo do título, "hoje" no meio da frase. */}
                  {r.enviadaEm ? f.dia(r.enviadaEm) : null}
                  {anterior?.enviadaEm ? (
                    <span className="ml-2 text-[12.5px] font-medium text-ink-4">
                      {preencher(d.comparada, { dia: f.diaNaFrase(anterior.enviadaEm) })}
                    </span>
                  ) : null}
                </h2>
                <Comparacao
                  idioma={idioma}
                  atual={r}
                  anterior={anterior}
                  linhas={comparar(r, anterior)}
                />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
