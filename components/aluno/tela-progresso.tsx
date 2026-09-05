"use client";

import { ChevronDown, LineChart, Table2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { classesDeBotao } from "@/components/ui";
import {
  dataCurta,
  linhaDoGrafico,
  LIMITE_DE_SESSOES,
  recortarIntervalo,
  textoDaSerie,
  ultimoRegistro,
  type Intervalo,
  type SessaoDoExercicio,
} from "@/lib/domain/progresso";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { cn } from "@/lib/utils";

import { FiltroDeIntervalo, GraficoDeCarga } from "./grafico-de-carga";

/** Quantas sessões o acordeão aberto mostra (doc 05). */
const SESSOES_NA_PLANILHA = 3;

type Modo = "planilha" | "grafico";

/**
 * A tela de progresso (doc 05). Recebe o histórico pronto, sem banco — é o que
 * permite conferir no navegador com props fixas, já que o host do Supabase é
 * bloqueado neste ambiente.
 *
 * O histórico inteiro chega de uma vez, e por isso abrir um acordeão ou trocar
 * o intervalo não vai ao servidor: é uma tela consultada na academia, entre uma
 * série e outra, com a internet que houver.
 */
export function TelaProgresso({
  exercicios,
}: {
  exercicios: ExercicioComProgresso[];
}) {
  const [modo, setModo] = useState<Modo>("planilha");
  const [aberto, setAberto] = useState<string | null>(null);

  if (!exercicios.length) return <SemHistorico />;

  const emDetalhe = exercicios.find((e) => e.chave === aberto) ?? null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Progresso
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-4">
          {exercicios.length === 1
            ? "1 exercício com histórico"
            : `${exercicios.length} exercícios com histórico`}
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Como ver o progresso"
        className="flex gap-1 rounded-input bg-canvas-sunken p-1"
      >
        <Aba
          ativa={modo === "planilha"}
          Icone={Table2}
          rotulo="Planilha"
          aoEscolher={() => {
            setModo("planilha");
            setAberto(null);
          }}
        />
        <Aba
          ativa={modo === "grafico"}
          Icone={LineChart}
          rotulo="Gráfico"
          aoEscolher={() => setModo("grafico")}
        />
      </div>

      {modo === "planilha" ? (
        <Planilha exercicios={exercicios} />
      ) : emDetalhe ? (
        <Detalhe exercicio={emDetalhe} aoVoltar={() => setAberto(null)} />
      ) : (
        <ListaDeGraficos exercicios={exercicios} aoAbrir={setAberto} />
      )}
    </div>
  );
}

function Aba({
  ativa,
  rotulo,
  Icone,
  aoEscolher,
}: {
  ativa: boolean;
  rotulo: string;
  Icone: typeof Table2;
  aoEscolher: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoEscolher}
      className={cn(
        "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[9px] text-[13px] font-bold transition",
        ativa
          ? "bg-surface text-ink shadow-sm"
          : "text-ink-4 hover:text-ink-2",
      )}
    >
      <Icone size={15} aria-hidden />
      {rotulo}
    </button>
  );
}

// ------------------------------------------------------------- planilha ----

/**
 * O acordeão por exercício.
 *
 * `<details>`/`<summary>` de propósito, e não um botão com estado: abre e fecha
 * antes de hidratar, dá o comportamento de teclado e de leitor de tela pronto,
 * e uma tela de consulta não deveria depender de JavaScript para revelar o
 * número que o aluno veio ver.
 */
function Planilha({ exercicios }: { exercicios: ExercicioComProgresso[] }) {
  return (
    <ul className="space-y-2">
      {exercicios.map((exercicio) => {
        const recentes = exercicio.sessoes.slice(0, SESSOES_NA_PLANILHA);
        return (
          <li key={exercicio.chave}>
            <details className="group rounded-card border border-border-soft bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-semibold text-ink">
                    {exercicio.nome}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-4">
                    {exercicio.sessoes.length === 1
                      ? "1 treino"
                      : `${exercicio.sessoes.length} treinos`}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[14px] font-bold text-ink tabular-nums">
                    {ultimoRegistro(exercicio)}
                  </span>
                  <ChevronDown
                    aria-hidden
                    size={16}
                    className="text-ink-5 transition group-open:rotate-180"
                  />
                </span>
              </summary>

              <div className="space-y-3 border-t border-border-soft px-4 py-3.5">
                {recentes.map((sessao) => (
                  <SessaoNaPlanilha key={sessao.sessaoId} sessao={sessao} />
                ))}

                {exercicio.sessoes.length > SESSOES_NA_PLANILHA ? (
                  <p className="text-[12px] text-ink-5">
                    As {SESSOES_NA_PLANILHA} mais recentes. O resto está no
                    gráfico.
                  </p>
                ) : null}

                <AvisoDeTeto sessoes={exercicio.sessoes} />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

function SessaoNaPlanilha({ sessao }: { sessao: SessaoDoExercicio }) {
  return (
    <div>
      <p className="eyebrow text-ink-4">{dataCurta(sessao.concluidaEm)}</p>
      <ul className="mt-1.5 space-y-1">
        {sessao.series.map((serie) => (
          <li
            key={serie.set_number}
            className="flex items-baseline justify-between text-[13px] tabular-nums"
          >
            <span className="text-ink-4">Série {serie.set_number}</span>
            <span className="font-semibold text-ink">{textoDaSerie(serie)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------- gráfico ----

function ListaDeGraficos({
  exercicios,
  aoAbrir,
}: {
  exercicios: ExercicioComProgresso[];
  aoAbrir: (chave: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {exercicios.map((exercicio) => (
        <li key={exercicio.chave}>
          <button
            type="button"
            onClick={() => aoAbrir(exercicio.chave)}
            className="flex w-full items-center justify-between gap-3 rounded-card border border-border-soft bg-surface px-4 py-3.5 text-left transition hover:border-border"
          >
            <span className="min-w-0">
              <span className="block truncate text-[14.5px] font-semibold text-ink">
                {exercicio.nome}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-4">
                {ultimoRegistro(exercicio)} ·{" "}
                {exercicio.sessoes.length === 1
                  ? "1 treino"
                  : `${exercicio.sessoes.length} treinos`}
              </span>
            </span>
            <Previa sessoes={exercicio.sessoes} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** A prévia do doc 05: a mesma linha, sem eixo, sem ponto e sem interação. */
function Previa({ sessoes }: { sessoes: SessaoDoExercicio[] }) {
  const linha = linhaDoGrafico(sessoes, 72, 26, 3);
  if (!linha) return <span aria-hidden className="w-[72px] shrink-0" />;

  return (
    <svg
      viewBox="0 0 72 26"
      aria-hidden
      className="w-[72px] shrink-0 overflow-visible"
    >
      {/* Um treino só não faz linha: um `M` sozinho não desenha nada, e a
          prévia ficaria vazia como a de um exercício de peso corporal. */}
      {linha.pontos.length === 1 ? (
        <circle
          cx={linha.pontos[0].x}
          cy={linha.pontos[0].y}
          r={3}
          fill="var(--color-brand)"
        />
      ) : (
        <path
          d={linha.caminho}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function Detalhe({
  exercicio,
  aoVoltar,
}: {
  exercicio: ExercicioComProgresso;
  aoVoltar: () => void;
}) {
  /*
   * Abre em 6 sessões, e não em "Total", por causa do alvo de toque: as faixas
   * clicáveis dividem a largura da tela entre os pontos, então com seis elas
   * passam dos 44px que o card pede, e com doze não passam. Quem quiser a série
   * inteira troca o filtro sabendo que os pontos ficam mais apertados.
   */
  const [intervalo, setIntervalo] = useState<Intervalo>(6);
  const recorte = recortarIntervalo(exercicio.sessoes, intervalo);

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={aoVoltar}
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Exercícios
        </button>
        <h2 className="mt-2 text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          {exercicio.nome}
        </h2>
      </div>

      <FiltroDeIntervalo valor={intervalo} aoEscolher={setIntervalo} />

      <GraficoDeCarga nome={exercicio.nome} sessoes={recorte} />

      <AvisoDeTeto sessoes={exercicio.sessoes} />
    </div>
  );
}

/** Corte silencioso faria o aluno achar que perdeu treino. */
function AvisoDeTeto({ sessoes }: { sessoes: SessaoDoExercicio[] }) {
  if (sessoes.length < LIMITE_DE_SESSOES) return null;
  return (
    <p className="text-[12px] leading-relaxed text-ink-5">
      Mostrando os {LIMITE_DE_SESSOES} treinos mais recentes deste exercício.
    </p>
  );
}

// ----------------------------------------------------------- sem dado ------

function SemHistorico() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Progresso
        </h1>
      </header>

      <section className="rounded-card-lg border border-border-soft bg-surface p-5 text-center">
        <p className="text-[15px] font-bold text-ink">
          Sua evolução começa no primeiro treino
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
          Depois de dois treinos do mesmo exercício já dá para ver a linha subir
          — ou não, e aí você sabe o que ajustar.
        </p>
        <Link
          href="/app/treinos"
          className={classesDeBotao({ block: true, className: "mt-4" })}
        >
          Ver meus treinos
        </Link>
      </section>
    </div>
  );
}
