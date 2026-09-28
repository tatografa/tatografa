"use client";

import { ChartLine, ChevronRight, Sheet } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { formatarNumero } from "@/lib/domain/historico";
import {
  METRICAS_DO_GRAFICO,
  barrasDoExercicio,
  chaveDe,
  historicoPorData,
  historicoPorSerie,
  recordeDoExercicio,
  type MetricaDoGrafico,
} from "@/lib/domain/planilha-do-aluno";
import type { ExercicioDaDivisao, TreinoDaDivisao } from "@/lib/queries/divisao";
import type { Macrotreino } from "@/lib/queries/macrotreinos";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { cn } from "@/lib/utils";

/**
 * "Programa atual" do perfil do aluno, no desenho do protótipo: a planilha de
 * cada treino, e a aba "Gráfico" com as barras de cada exercício.
 *
 * **Abrir um exercício na planilha mostra o que o aluno fez nele** — o
 * proposto, o recorde e cada sessão, por data ou por série. É o motivo de a
 * planilha existir no painel: a prescrição o personal já vê na divisão de
 * treino; aqui ele vê a prescrição **ao lado** da execução.
 *
 * O histórico é o de `progressoDoAluno`, que agrupa por `(origem, id)` do
 * exercício e não pela linha de prescrição: um supino de um programa anterior
 * aparece no supino deste (04/09).
 */
export function ProgramaAtual({
  programa,
  semana,
  treinos,
  exercicios,
  alunoId,
}: {
  programa: Macrotreino | null;
  /** Contada no servidor, no fuso do produto. */
  semana: number | null;
  treinos: TreinoDaDivisao[];
  exercicios: ExercicioComProgresso[];
  alunoId: string;
}) {
  const [aba, setAba] = useState<"planilha" | "grafico">("planilha");
  const historico = new Map(exercicios.map((e) => [e.chave, e]));
  const id = useId();

  return (
    <section className="min-w-0 overflow-hidden rounded-[12px] border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border-soft px-[18px] py-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium text-ink">Programa atual</h2>
          {programa ? (
            <p className="mt-0.5 truncate text-[12px] text-ink-5">
              {programa.name} · semana {semana} de {programa.total_weeks}
            </p>
          ) : null}
        </div>
        {programa ? (
          <div role="tablist" aria-label="Como ver o programa" className="flex rounded-[8px] bg-canvas p-0.5">
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
                aria-controls={`${id}-${valor}`}
                id={`${id}-aba-${valor}`}
                onClick={() => setAba(valor)}
                className={cn(
                  "inline-flex items-center gap-[5px] rounded-[6px] px-2.5 py-1.5 text-[12px] font-semibold transition",
                  aba === valor ? "bg-surface text-ink shadow-cartao" : "text-ink-4 hover:text-ink",
                )}
              >
                <Icone size={13} aria-hidden />
                {rotulo}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {!programa ? (
        <div className="px-[18px] py-8 text-center">
          <p className="mb-3.5 text-[13px] font-medium text-ink-4">Nenhum programa de treino ativo</p>
          <Link
            href={`/painel/treinos?aluno=${alunoId}&novo=1`}
            className="inline-block rounded-[9px] bg-brand px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-hover"
          >
            Montar programa
          </Link>
        </div>
      ) : (
        <>
          <div role="tabpanel" id={`${id}-${aba}`} aria-labelledby={`${id}-aba-${aba}`}>
            {treinos.length === 0 ? (
              <p className="px-[18px] py-4 text-[13px] text-ink-4">O programa ainda não tem treino.</p>
            ) : aba === "planilha" ? (
              <Planilha treinos={treinos} historico={historico} />
            ) : (
              <Grafico treinos={treinos} historico={historico} />
            )}
          </div>
          <div className="border-t border-border-soft px-[18px] py-3">
            <Link
              href={`/painel/treinos?aluno=${alunoId}&programa=${programa.id}`}
              className="text-[12.5px] font-semibold text-brand transition hover:text-brand-hover"
            >
              Abrir a divisão de treino →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

type Historico = Map<string, ExercicioComProgresso>;

function daPrescricao(historico: Historico, e: ExercicioDaDivisao) {
  return historico.get(chaveDe(e.exercicio.source, e.exercicio.id)) ?? null;
}

// ------------------------------------------------------------ planilha ---

function Planilha({ treinos, historico }: { treinos: TreinoDaDivisao[]; historico: Historico }) {
  // Um exercício aberto por vez, como no protótipo: com dois abertos o
  // histórico de um empurra o do outro para fora da coluna.
  const [aberto, setAberto] = useState<string | null>(null);
  const [modo, setModo] = useState<"data" | "serie">("data");

  return treinos.map((treino) => (
    <div key={treino.id} className="border-t border-border-soft px-[18px] py-3.5 first:border-0">
      <h3 className="mb-2 text-[13px] font-bold text-ink">
        Treino {treino.label} <span className="text-[12px] font-medium text-ink-4">— {treino.name}</span>
      </h3>
      {treino.exercicios.length ? (
        <>
          <div
            aria-hidden
            className="grid grid-cols-[minmax(0,1fr)_44px_72px] gap-2 pt-1 pb-1.5 text-[10.5px] font-medium tracking-[0.03em] text-ink-5 uppercase"
          >
            <span>Exercício</span>
            <span className="text-center">Séries</span>
            <span className="text-center">Repetições</span>
          </div>
          <ul>
            {treino.exercicios.map((e) => {
              const estaAberto = aberto === e.id;
              return (
                <li key={e.id} className="border-t border-border-soft">
                  <button
                    type="button"
                    aria-expanded={estaAberto}
                    onClick={() => setAberto(estaAberto ? null : e.id)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_44px_72px] items-center gap-2 py-[7px] text-left text-[13px] text-ink-2 transition hover:text-ink"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <ChevronRight
                        size={11}
                        aria-hidden
                        className={cn("shrink-0 text-ink-5 transition", estaAberto && "rotate-90")}
                      />
                      <span className="truncate">{e.exercicio.name}</span>
                    </span>
                    <span className="text-center font-medium tabular-nums">
                      {e.sets}
                      <span className="sr-only"> séries</span>
                    </span>
                    <span className="text-center font-medium tabular-nums">
                      {e.reps_target}
                      <span className="sr-only"> repetições</span>
                    </span>
                  </button>
                  {estaAberto ? (
                    <HistoricoDoExercicio
                      prescricao={e}
                      historico={daPrescricao(historico, e)}
                      modo={modo}
                      aoMudarModo={setModo}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="py-1.5 text-[12.5px] text-ink-4 italic">Nenhum exercício neste treino.</p>
      )}
    </div>
  ));
}

function HistoricoDoExercicio({
  prescricao: e,
  historico,
  modo,
  aoMudarModo,
}: {
  prescricao: ExercicioDaDivisao;
  historico: ExercicioComProgresso | null;
  modo: "data" | "serie";
  aoMudarModo: (modo: "data" | "serie") => void;
}) {
  const proposto = [
    `${e.sets}x${e.reps_target}`,
    e.rir_target ? `RIR ${e.rir_target}` : null,
    e.rest_seconds ? `${descanso(e.rest_seconds)} de descanso` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const grupos = historico
    ? modo === "data"
      ? historicoPorData(historico.sessoes)
      : historicoPorSerie(historico.sessoes)
    : [];

  return (
    <div className="mb-2 ml-4 rounded-[8px] bg-canvas px-3 pt-2.5 pb-3.5">
      <p className="text-[12px] font-medium text-ink-4">
        Proposto: <span className="font-semibold text-ink-2">{proposto}</span>
      </p>
      {e.technique ? <p className="mt-1 text-[12px] text-ink-4">Técnica: {e.technique}</p> : null}
      {e.notes ? <p className="mt-1 text-[12px] whitespace-pre-wrap text-ink-4">{e.notes}</p> : null}

      {historico && grupos.length ? (
        <>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div role="group" aria-label="Agrupar o histórico" className="flex gap-1.5">
              {(
                [
                  ["data", "Data"],
                  ["serie", "Série"],
                ] as const
              ).map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={modo === valor}
                  onClick={() => aoMudarModo(valor)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition",
                    modo === valor ? "bg-brand text-white" : "bg-surface text-ink-3 hover:text-ink",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <p className="text-[11.5px] font-semibold text-brand">Recorde: {recordeDoExercicio(historico)}</p>
          </div>
          <div
            role="region"
            aria-label={`Histórico de ${e.exercicio.name}`}
            tabIndex={0}
            className="mt-2.5 flex max-h-[300px] flex-col gap-2.5 overflow-y-auto focus-visible:outline-2 focus-visible:outline-ink"
          >
            {grupos.map((g) => (
              <div key={g.titulo} className="rounded-[8px] border border-border bg-surface px-3 py-2.5">
                <p className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-ink">{g.titulo}</span>
                  <span className="text-[11px] text-ink-4">maior: {g.maior}</span>
                </p>
                <ul>
                  {g.itens.map((item) => (
                    <li key={item.rotulo} className="flex justify-between gap-2 py-[3px] text-[12px] text-ink-3">
                      <span>{item.rotulo}</span>
                      <span className="text-ink-2 tabular-nums">{item.valor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-2 text-[12.5px] text-ink-4 italic">Nenhuma execução registrada ainda.</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------- gráfico ---

function Grafico({ treinos, historico }: { treinos: TreinoDaDivisao[]; historico: Historico }) {
  const [metrica, setMetrica] = useState<MetricaDoGrafico>("carga");
  // O primeiro treino abre sozinho, como no protótipo: aba de gráfico que
  // abre vazia pede um clique para mostrar a primeira coisa.
  const [aberto, setAberto] = useState<string | null>(treinos[0]?.id ?? null);

  return (
    <>
      <div className="px-[18px] pt-3.5 pb-3">
        <p className="mb-1.5 text-[11px] font-bold tracking-[0.05em] text-ink-5 uppercase">Métrica</p>
        <div role="group" aria-label="Métrica do gráfico" className="flex flex-wrap gap-1.5">
          {METRICAS_DO_GRAFICO.map((m) => (
            <button
              key={m.valor}
              type="button"
              aria-pressed={metrica === m.valor}
              onClick={() => setMetrica(m.valor)}
              className={cn(
                "rounded-full border px-2.5 py-[5px] text-[11.5px] font-semibold transition",
                metrica === m.valor
                  ? "border-brand bg-brand text-white"
                  : "border-border text-ink-3 hover:text-ink",
              )}
            >
              {m.rotulo}
            </button>
          ))}
        </div>
      </div>
      {treinos.map((treino) => {
        const estaAberto = aberto === treino.id;
        return (
          <div key={treino.id} className="border-t border-border-soft">
            <button
              type="button"
              aria-expanded={estaAberto}
              onClick={() => setAberto(estaAberto ? null : treino.id)}
              className="flex w-full items-center gap-2 px-[18px] py-3.5 text-left"
            >
              <ChevronRight size={11} aria-hidden className={cn("text-ink-5 transition", estaAberto && "rotate-90")} />
              <span className="text-[13px] font-bold text-ink">
                Treino {treino.label} <span className="text-[12px] font-medium text-ink-4">— {treino.name}</span>
              </span>
            </button>
            {estaAberto ? (
              <div className="space-y-3 px-[18px] pb-4">
                {treino.exercicios.length ? (
                  treino.exercicios.map((e) => (
                    <BarrasDoExercicio
                      key={e.id}
                      nome={e.exercicio.name}
                      historico={daPrescricao(historico, e)}
                      metrica={metrica}
                    />
                  ))
                ) : (
                  <p className="text-[12.5px] text-ink-4 italic">Nenhum exercício neste treino.</p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

/**
 * O gráfico de barras de um exercício, em SVG à mão (02/09: nada de biblioteca
 * para um gráfico). O número de cada barra vai escrito em cima dela, e a frase
 * inteira no `aria-label` — o `title` de hover não é a única via para o dado.
 */
function BarrasDoExercicio({
  nome,
  historico,
  metrica,
}: {
  nome: string;
  historico: ExercicioComProgresso | null;
  metrica: MetricaDoGrafico;
}) {
  const barras = historico ? barrasDoExercicio(historico.sessoes, metrica) : [];
  const L = 300;
  const A = 190;
  const base = 158;
  const topo = 22;
  const maior = Math.max(...barras.map((b) => b.valor), 0) || 1;
  const faixa = (L - 20) / Math.max(barras.length, 1);
  const largura = Math.min(faixa * 0.55, 34);
  const rotulo = METRICAS_DO_GRAFICO.find((m) => m.valor === metrica)?.rotulo.toLowerCase();

  return (
    <div className="rounded-[10px] bg-canvas px-3.5 py-3">
      {/* A unidade vai no cabeçalho porque em cima da barra só cabe o número —
          e no peso corporal a "carga" são repetições. */}
      <p className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-ink">{nome}</span>
        {barras.length ? <span className="text-[11px] text-ink-4">em {barras[0].unidade}</span> : null}
      </p>
      {barras.length ? (
        <svg
          viewBox={`0 0 ${L} ${A}`}
          role="img"
          aria-label={`${nome}, ${rotulo}: ${barras.map((b) => `${b.texto} em ${b.data}`).join("; ")}.`}
          className="block h-auto w-full"
        >
          <line x1={10} y1={base} x2={L - 10} y2={base} className="stroke-border" strokeWidth={1} />
          {barras.map((b, i) => {
            const h = ((base - topo) * b.valor) / maior;
            const x = 10 + i * faixa + (faixa - largura) / 2;
            return (
              <g key={`${b.data}-${i}`}>
                <rect
                  x={x}
                  y={base - h}
                  width={largura}
                  height={Math.max(h, 1)}
                  rx={Math.min(largura / 2, h / 2)}
                  className="fill-brand"
                >
                  <title>{`${b.data} — ${b.texto}`}</title>
                </rect>
                <text
                  x={x + largura / 2}
                  y={base - h - 6}
                  textAnchor="middle"
                  className="fill-ink-2 text-[10px] font-bold"
                >
                  {formatarNumero(b.valor)}
                </text>
                <text
                  x={10 + i * faixa + faixa / 2}
                  y={base + 18}
                  textAnchor="middle"
                  className="fill-ink-4 text-[10.5px] font-semibold"
                >
                  {b.data}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <p className="py-3 text-center text-[12px] text-ink-4 italic">Nenhuma execução registrada ainda</p>
      )}
    </div>
  );
}

/** "90 s", "2 min", "1 min 30 s". */
function descanso(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${min} min ${resto} s` : `${min} min`;
}
