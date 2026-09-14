import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Comparacao } from "@/components/reavaliacao/comparacao";
import { Card } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";
import { pareceUuid } from "@/lib/domain/id";
import { lerAluno } from "@/lib/queries/alunos";
import { comparar, lerReavaliacoesDeUmAluno } from "@/lib/queries/reavaliacao";

export const metadata: Metadata = { title: "Reavaliações do aluno" };

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
      <header className="space-y-2">
        <Link
          href="/painel/reavaliacoes"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-4 transition hover:text-ink"
        >
          <ChevronLeft size={14} aria-hidden /> Reavaliações
        </Link>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          {aluno.name}
        </h1>
      </header>

      {enviadas.length === 0 ? (
        <Card size="lg" className="text-center">
          <p className="text-[13px] text-ink-4">
            Este aluno ainda não respondeu nenhuma reavaliação.
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
                  {r.rotuloDoEnvio}
                  {anterior && (
                    <span className="ml-2 text-[12.5px] font-medium text-ink-4">
                      comparada com {anterior.rotuloDoEnvio}
                    </span>
                  )}
                </h2>
                <Comparacao
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
