"use client";

import { useEffect, useState } from "react";

import { ACRESCIMO_DE_DESCANSO, segundosRestantes } from "@/lib/domain/execucao";
import { comoRelogio } from "@/lib/domain/treino";

export interface TimerDeDescansoProps {
  /** Instante em que o descanso termina, em ms de época. */
  fimEm: number;
  aoPular: () => void;
  aoAcrescentar: (segundos: number) => void;
}

/**
 * Contagem regressiva do descanso.
 *
 * **Por timestamp, não por contador.** O componente guarda o instante do fim e
 * deriva o que falta do relógio a cada 500ms. Um `setInterval` que decrementa
 * um número para quando o celular bloqueia a tela ou a aba vai para o fundo, e
 * o aluno voltaria com o tempo congelado — que é justamente o momento em que
 * ele mais precisa do valor certo.
 *
 * O `visibilitychange` está aqui porque o intervalo pode ser estrangulado em
 * segundo plano: ao voltar, recalcula na hora em vez de esperar o próximo tick.
 */
export function TimerDeDescanso({
  fimEm,
  aoPular,
  aoAcrescentar,
}: TimerDeDescansoProps) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const marcar = () => setAgora(Date.now());
    const intervalo = setInterval(marcar, 500);
    document.addEventListener("visibilitychange", marcar);
    window.addEventListener("focus", marcar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", marcar);
      window.removeEventListener("focus", marcar);
    };
  }, []);

  const restante = segundosRestantes(fimEm, agora);
  const acabou = restante === 0;

  return (
    <section
      aria-label="Descanso"
      className="border-t border-dark-border bg-dark-surface-2 px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-[440px] items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-[9px] text-ink-4">
            {acabou ? "Descanso terminado" : "Descanso"}
          </p>
          {/*
            `aria-live="off"`: o número muda a cada segundo e um leitor de tela
            anunciando cada tique tornaria a tela inutilizável. O fim do
            descanso é anunciado uma vez pelo texto do eyebrow acima.
          */}
          <p
            aria-live="off"
            className="mt-0.5 font-mono text-[34px] leading-none font-bold tracking-[-0.02em] text-dark-text tabular-nums"
          >
            {comoRelogio(restante)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => aoAcrescentar(ACRESCIMO_DE_DESCANSO)}
          className="h-11 shrink-0 rounded-button border-[1.5px] border-dark-border-2 px-4 text-[13px] font-bold text-dark-text-2 transition active:scale-[0.98]"
        >
          +{ACRESCIMO_DE_DESCANSO}s
        </button>

        <button
          type="button"
          onClick={aoPular}
          className="h-11 shrink-0 rounded-button bg-dark-elev px-4 text-[13px] font-bold text-dark-text transition active:scale-[0.98]"
        >
          {acabou ? "Fechar" : "Pular"}
        </button>
      </div>
    </section>
  );
}
