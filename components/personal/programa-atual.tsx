"use client";

import { ChartLine, ChevronRight, Sheet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EvolucaoDoAluno } from "@/components/personal/evolucao-do-aluno";
import type { TreinoDaDivisao } from "@/lib/queries/divisao";
import type { Macrotreino } from "@/lib/queries/macrotreinos";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { cn } from "@/lib/utils";

/**
 * "Programa atual" do perfil do aluno, como no protótipo: a planilha de cada
 * treino, e ao lado a aba "Gráfico".
 *
 * **A planilha abre cada exercício** (a setinha do protótipo) no que o cartão
 * da divisão de treino prescreve além de séries e reps: RIR, descanso, técnica
 * e observação. Por `<details>`, que dá o abrir e fechar, o teclado e o
 * anúncio de "recolhido/expandido" sem uma linha de estado.
 *
 * **O gráfico é a evolução por exercício que já existia**, e não as barras por
 * treino do protótipo com "Carga / Repetição / Loads": a linha é a mesma que o
 * aluno vê no app dele (M2-04), e duas curvas diferentes para "quanto ele
 * evoluiu" fariam os dois conversarem sobre números diferentes.
 */
export function ProgramaAtual({
  programa,
  semana,
  treinos,
  exercicios,
  alunoId,
  primeiroNome,
}: {
  programa: Macrotreino | null;
  /** Contada no servidor, no fuso do produto. */
  semana: number | null;
  treinos: TreinoDaDivisao[];
  exercicios: ExercicioComProgresso[];
  alunoId: string;
  primeiroNome: string;
}) {
  const [aba, setAba] = useState<"planilha" | "grafico">("planilha");

  return (
    <section className="min-w-0 rounded-[12px] border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-[18px] py-3.5">
        <h2 className="text-[14px] font-medium text-ink">Programa atual</h2>
        <div role="tablist" aria-label="Como ver o programa" className="flex gap-1 rounded-[9px] border border-border bg-canvas p-[3px]">
          {(
            [
              ["planilha", "Planilha", Sheet],
              ["grafico", "Gráfico", ChartLine],
            ] as const
          ).map(([valor, rotulo, Icone]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={aba === valor}
              aria-controls={`programa-${valor}`}
              id={`aba-${valor}`}
              onClick={() => setAba(valor)}
              className={cn(
                "inline-flex min-h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-semibold transition",
                aba === valor ? "bg-surface text-ink shadow-cartao" : "text-ink-4 hover:text-ink",
              )}
            >
              <Icone size={13} aria-hidden />
              {rotulo}
            </button>
          ))}
        </div>
      </header>

      {aba === "planilha" ? (
        <div role="tabpanel" id="programa-planilha" aria-labelledby="aba-planilha">
          <Planilha
            programa={programa}
            semana={semana}
            treinos={treinos}
            alunoId={alunoId}
            primeiroNome={primeiroNome}
          />
        </div>
      ) : (
        <div role="tabpanel" id="programa-grafico" aria-labelledby="aba-grafico" className="p-[18px]">
          <EvolucaoDoAluno exercicios={exercicios} />
        </div>
      )}
    </section>
  );
}

function Planilha({
  programa,
  semana,
  treinos,
  alunoId,
  primeiroNome,
}: {
  programa: Macrotreino | null;
  semana: number | null;
  treinos: TreinoDaDivisao[];
  alunoId: string;
  primeiroNome: string;
}) {
  if (!programa) {
    return (
      <div className="space-y-2 px-[18px] py-5">
        <p className="text-[14px] font-semibold text-ink">{primeiroNome} está sem programa ativo</p>
        <p className="text-[13px] leading-relaxed text-ink-4">
          Sem programa, o app não mostra treino nenhum. O histórico continua guardado.
        </p>
        <Link
          href={`/painel/treinos?aluno=${alunoId}&novo=1`}
          className="inline-block text-[13px] font-semibold text-brand transition hover:text-brand-hover"
        >
          Montar um programa →
        </Link>
      </div>
    );
  }

  const fracao = semana ? semana / programa.total_weeks : 0;

  return (
    <>
      <div className="space-y-2 border-b border-border-soft px-[18px] py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="min-w-0 truncate text-[14px] font-semibold text-ink">{programa.name}</p>
          <p className="shrink-0 text-[12px] text-ink-4">
            Semana {semana} de {programa.total_weeks}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Semanas do programa"
          aria-valuemin={0}
          aria-valuemax={programa.total_weeks}
          aria-valuenow={semana ?? 0}
          className="h-1.5 overflow-hidden rounded-full bg-canvas-sunken"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round(fracao * 100)}%` }} />
        </div>
      </div>

      {treinos.length ? (
        treinos.map((treino) => (
          <div key={treino.id} className="border-b border-border-soft px-[18px] py-3.5 last:border-0">
            <h3 className="mb-2 text-[13px] text-ink">
              <span className="font-semibold">Treino {treino.label}</span>
              <span className="text-ink-4"> — {treino.name}</span>
            </h3>
            <div
              aria-hidden
              className="grid grid-cols-[minmax(0,1fr)_52px_72px] border-b border-border-soft pb-1.5 text-[11px] tracking-[0.04em] text-ink-5 uppercase"
            >
              <span>Exercício</span>
              <span className="text-center">Séries</span>
              <span className="text-center">Reps</span>
            </div>
            {treino.exercicios.length ? (
              <ul>
                {treino.exercicios.map((e) => (
                  <li key={e.id} className="border-b border-border-soft last:border-0">
                    <details className="group">
                      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_52px_72px] items-center py-2 text-[13px] text-ink-2 transition hover:text-ink [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <ChevronRight
                            size={12}
                            aria-hidden
                            className="shrink-0 text-ink-5 transition group-open:rotate-90"
                          />
                          <span className="truncate">{e.exercicio.name}</span>
                        </span>
                        <span className="text-center tabular-nums">
                          {e.sets}
                          <span className="sr-only"> séries</span>
                        </span>
                        <span className="text-center tabular-nums">
                          {e.reps_target}
                          <span className="sr-only"> repetições</span>
                        </span>
                      </summary>
                      <dl className="mb-2.5 ml-[18px] grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-[8px] bg-canvas px-3 py-2 text-[12px]">
                        <dt className="text-ink-4">RIR</dt>
                        <dd className="text-ink-2">{e.rir_target ?? "Não prescrito"}</dd>
                        <dt className="text-ink-4">Descanso</dt>
                        <dd className="text-ink-2">{descanso(e.rest_seconds)}</dd>
                        {e.technique ? (
                          <>
                            <dt className="text-ink-4">Técnica</dt>
                            <dd className="text-ink-2">{e.technique}</dd>
                          </>
                        ) : null}
                        {e.notes ? (
                          <>
                            <dt className="text-ink-4">Observação</dt>
                            <dd className="whitespace-pre-wrap text-ink-2">{e.notes}</dd>
                          </>
                        ) : null}
                      </dl>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-[12.5px] text-ink-5">Nenhum exercício neste treino.</p>
            )}
          </div>
        ))
      ) : (
        <p className="px-[18px] py-4 text-[13px] text-ink-4">O programa ainda não tem treino.</p>
      )}

      <div className="border-t border-border-soft px-[18px] py-3">
        <Link
          href={`/painel/treinos?aluno=${alunoId}&programa=${programa.id}`}
          className="text-[13px] font-semibold text-brand transition hover:text-brand-hover"
        >
          Abrir a divisão de treino →
        </Link>
      </div>
    </>
  );
}

/** "90 s", "2 min", "1 min 30 s". */
function descanso(segundos: number): string {
  if (!segundos) return "Sem descanso prescrito";
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${min} min ${resto} s` : `${min} min`;
}
