"use client";

import { ChartLine, ChevronRight, Sheet } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import {
  METRICAS_DO_GRAFICO,
  barrasDoExercicio,
  chaveDe,
  historicoPorData,
  historicoPorSerie,
  recordeDoExercicio,
  type FormatoDaPlanilha,
  type MetricaDoGrafico,
} from "@/lib/domain/planilha-do-aluno";
import type { Formatos } from "@/lib/i18n/formatos";
import { preencher } from "@/lib/i18n/texto";
import type { ExercicioDaDivisao, TreinoDaDivisao } from "@/lib/queries/divisao";
import type { Macrotreino } from "@/lib/queries/macrotreinos";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { cn } from "@/lib/utils";

import { usePainel } from "./idioma-do-painel";

/** O formato da planilha no idioma do painel. */
function formatoDa(f: Formatos, serie: string): FormatoDaPlanilha {
  return { data: f.dataCurta, numero: f.numero, serie: (n) => preencher(serie, { n }) };
}

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
  const { t } = usePainel();
  const p = t.ficha.programa;

  return (
    <section className="min-w-0 overflow-hidden rounded-[12px] border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border-soft px-[18px] py-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium text-ink">{p.titulo}</h2>
          {programa ? (
            <p className="mt-0.5 truncate text-[12px] text-ink-5">
              {preencher(p.semana, { nome: programa.name, semana: semana ?? 1, total: programa.total_weeks })}
            </p>
          ) : null}
        </div>
        {programa ? (
          <div role="tablist" aria-label={p.comoVer} className="flex rounded-[8px] bg-canvas p-0.5">
            {(
              [
                ["planilha", p.planilha, Sheet],
                ["grafico", p.grafico, ChartLine],
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
          <p className="mb-3.5 text-[13px] font-medium text-ink-4">{p.nenhum}</p>
          <Link
            href={`/painel/treinos?aluno=${alunoId}&novo=1`}
            className="inline-block rounded-[9px] bg-brand px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-hover"
          >
            {p.montar}
          </Link>
        </div>
      ) : (
        <>
          <div role="tabpanel" id={`${id}-${aba}`} aria-labelledby={`${id}-aba-${aba}`}>
            {treinos.length === 0 ? (
              <p className="px-[18px] py-4 text-[13px] text-ink-4">{p.semTreino}</p>
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
              {p.abrir}
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
  const { t } = usePainel();
  const p = t.ficha.programa;

  return treinos.map((treino) => (
    <div key={treino.id} className="border-t border-border-soft px-[18px] py-3.5 first:border-0">
      <h3 className="mb-2 text-[13px] font-bold text-ink">
        {preencher(t.comum.treino, { label: treino.label })}{" "}
        <span className="text-[12px] font-medium text-ink-4">— {treino.name}</span>
      </h3>
      {treino.exercicios.length ? (
        <>
          <div
            aria-hidden
            className="grid grid-cols-[minmax(0,1fr)_44px_72px] gap-2 pt-1 pb-1.5 text-[10.5px] font-medium tracking-[0.03em] text-ink-5 uppercase"
          >
            <span>{p.exercicio}</span>
            <span className="text-center">{p.series}</span>
            <span className="text-center">{p.repeticoes}</span>
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
                      <span className="sr-only">{p.seriesSr}</span>
                    </span>
                    <span className="text-center font-medium tabular-nums">
                      {e.reps_target}
                      <span className="sr-only">{p.repeticoesSr}</span>
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
        <p className="py-1.5 text-[12.5px] text-ink-4 italic">{p.nenhumExercicio}</p>
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
  const { t, f } = usePainel();
  const p = t.ficha.programa;
  const formato = formatoDa(f, p.serieN);
  const proposto = [
    `${e.sets}x${e.reps_target}`,
    e.rir_target ? `RIR ${e.rir_target}` : null,
    e.rest_seconds ? preencher(p.descanso, { tempo: descanso(e.rest_seconds) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const grupos = historico
    ? modo === "data"
      ? historicoPorData(historico.sessoes, formato)
      : historicoPorSerie(historico.sessoes, formato)
    : [];

  return (
    <div className="mb-2 ml-4 rounded-[8px] bg-canvas px-3 pt-2.5 pb-3.5">
      <p className="text-[12px] font-medium text-ink-4">
        {p.proposto}
        <span className="font-semibold text-ink-2">{proposto}</span>
      </p>
      {e.technique ? <p className="mt-1 text-[12px] text-ink-4">{preencher(p.tecnica, { tecnica: e.technique })}</p> : null}
      {e.notes ? <p className="mt-1 text-[12px] whitespace-pre-wrap text-ink-4">{e.notes}</p> : null}

      {historico && grupos.length ? (
        <>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div role="group" aria-label={p.agrupar} className="flex gap-1.5">
              {(
                [
                  ["data", p.data],
                  ["serie", p.serie],
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
            <p className="text-[11.5px] font-semibold text-brand">
              {preencher(p.recorde, { valor: recordeDoExercicio(historico, formato) })}
            </p>
          </div>
          <div
            role="region"
            aria-label={preencher(p.historicoDe, { nome: e.exercicio.name })}
            tabIndex={0}
            className="mt-2.5 flex max-h-[300px] flex-col gap-2.5 overflow-y-auto focus-visible:outline-2 focus-visible:outline-ink"
          >
            {grupos.map((g) => (
              <div key={g.titulo} className="rounded-[8px] border border-border bg-surface px-3 py-2.5">
                <p className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-ink">{g.titulo}</span>
                  <span className="text-[11px] text-ink-4">{preencher(p.maior, { valor: g.maior })}</span>
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
        <p className="mt-2 text-[12.5px] text-ink-4 italic">{p.nenhumaExecucao}</p>
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
  const { t } = usePainel();
  const p = t.ficha.programa;

  return (
    <>
      <div className="px-[18px] pt-3.5 pb-3">
        <p className="mb-1.5 text-[11px] font-bold tracking-[0.05em] text-ink-5 uppercase">{p.metrica}</p>
        <div role="group" aria-label={p.metricaDoGrafico} className="flex flex-wrap gap-1.5">
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
              {p.metricas[m.valor]}
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
                {preencher(t.comum.treino, { label: treino.label })}{" "}
                <span className="text-[12px] font-medium text-ink-4">— {treino.name}</span>
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
                  <p className="text-[12.5px] text-ink-4 italic">{p.nenhumExercicio}</p>
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
  const { t, f } = usePainel();
  const p = t.ficha.programa;
  const barras = historico
    ? barrasDoExercicio(historico.sessoes, metrica, formatoDa(f, p.serieN))
    : [];
  const L = 300;
  const A = 190;
  const base = 158;
  const topo = 22;
  const maior = Math.max(...barras.map((b) => b.valor), 0) || 1;
  const faixa = (L - 20) / Math.max(barras.length, 1);
  const largura = Math.min(faixa * 0.55, 34);
  const rotulo = p.metricas[metrica].toLowerCase();

  return (
    <div className="rounded-[10px] bg-canvas px-3.5 py-3">
      {/* A unidade vai no cabeçalho porque em cima da barra só cabe o número —
          e no peso corporal a "carga" são repetições. */}
      <p className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-ink">{nome}</span>
        {barras.length ? (
          <span className="text-[11px] text-ink-4">{preencher(p.em, { unidade: barras[0].unidade })}</span>
        ) : null}
      </p>
      {barras.length ? (
        <svg
          viewBox={`0 0 ${L} ${A}`}
          role="img"
          aria-label={preencher(p.barras, {
            nome,
            metrica: rotulo,
            valores: barras.map((b) => preencher(p.barra, { texto: b.texto, data: b.data })).join("; "),
          })}
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
                  {f.numero(b.valor)}
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
        <p className="py-3 text-center text-[12px] text-ink-4 italic">{p.nenhumaExecucao}</p>
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
