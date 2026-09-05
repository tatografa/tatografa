"use client";

import { useState } from "react";

import {
  FiltroDeIntervalo,
  GraficoDeCarga,
} from "@/components/aluno/grafico-de-carga";
import {
  recortarIntervalo,
  ultimoRegistro,
  type Intervalo,
} from "@/lib/domain/progresso";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { cn } from "@/lib/utils";

/**
 * Evolução por exercício na ficha do aluno.
 *
 * **O gráfico é o mesmo do app do aluno** (`GraficoDeCarga`, M2-04), não uma
 * segunda versão: o personal e o aluno precisam ver a mesma linha, e duas
 * implementações da mesma curva divergem na primeira mudança de regra. O que
 * muda aqui é só o entorno — a tela é desktop, então a lista de exercícios e o
 * gráfico convivem lado a lado em vez de virarem duas telas.
 */
export function EvolucaoDoAluno({
  exercicios,
}: {
  exercicios: ExercicioComProgresso[];
}) {
  const [chave, setChave] = useState(exercicios[0]?.chave ?? null);
  const [intervalo, setIntervalo] = useState<Intervalo>(6);

  if (!exercicios.length) {
    return (
      <p className="text-[13.5px] leading-relaxed text-ink-3">
        Nada para comparar ainda. A curva aparece quando o aluno repetir um
        exercício.
      </p>
    );
  }

  const atual = exercicios.find((e) => e.chave === chave) ?? exercicios[0];

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
      <ul
        aria-label="Exercícios com histórico"
        className="max-h-[420px] space-y-1 overflow-y-auto pr-1"
      >
        {exercicios.map((exercicio) => (
          <li key={exercicio.chave}>
            <button
              type="button"
              onClick={() => setChave(exercicio.chave)}
              aria-current={exercicio.chave === atual.chave ? "true" : undefined}
              className={cn(
                "w-full rounded-[9px] px-3 py-2 text-left transition",
                exercicio.chave === atual.chave
                  ? "bg-canvas-sunken"
                  : "hover:bg-canvas-sunken/60",
              )}
            >
              <span className="block truncate text-[13.5px] font-semibold text-ink">
                {exercicio.nome}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-4">
                {ultimoRegistro(exercicio)} ·{" "}
                {exercicio.sessoes.length === 1
                  ? "1 treino"
                  : `${exercicio.sessoes.length} treinos`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/*
        Largura máxima no gráfico: o SVG escala com o contêiner, e numa tela de
        1280px ele passaria de 480px de altura — uma linha gigante para ler um
        número. Limitar aqui, e não no componente, mantém o gráfico do app do
        aluno de borda a borda no celular, que é o que o doc 05 pede.
      */}
      <div className="min-w-0 max-w-[620px] space-y-4">
        <div>
          <h3 className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">
            {atual.nome}
          </h3>
        </div>

        <FiltroDeIntervalo valor={intervalo} aoEscolher={setIntervalo} />

        <GraficoDeCarga
          nome={atual.nome}
          sessoes={recortarIntervalo(atual.sessoes, intervalo)}
        />
      </div>
    </div>
  );
}
