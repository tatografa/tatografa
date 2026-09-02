"use client";

import { Minus, Plus } from "lucide-react";

import { ajustar } from "@/lib/domain/execucao";
import { cn } from "@/lib/utils";

export interface StepperProps {
  /** Lido por leitor de tela e usado nos `aria-label` dos dois botões. */
  rotulo: string;
  valor: number;
  passo: number;
  minimo: number;
  maximo: number;
  /** "kg" ao lado do número. Repetições não têm unidade. */
  unidade?: string;
  aoMudar: (valor: number) => void;
}

/**
 * Stepper de carga e de repetições da tela de execução.
 *
 * Os botões têm 44px de alvo de toque com o círculo de 26px desenhado dentro:
 * o doc pede o círculo pequeno, mas o aluno usa isto de pé, suado e com uma
 * mão só — alvo menor que 44px erra o toque.
 *
 * `type="button"` é explícito porque o stepper aparece dentro de formulário na
 * tela de início; sem isso o "+" enviaria o formulário.
 */
export function Stepper({
  rotulo,
  valor,
  passo,
  minimo,
  maximo,
  unidade,
  aoMudar,
}: StepperProps) {
  return (
    <div className="flex items-center justify-center">
      <BotaoDePasso
        rotulo={`Diminuir ${rotulo}`}
        desabilitado={valor <= minimo}
        aoTocar={() => aoMudar(ajustar(valor, -passo, minimo, maximo))}
      >
        <Minus aria-hidden size={14} strokeWidth={3} />
      </BotaoDePasso>

      <p
        className="min-w-[38px] text-center text-[19px] font-extrabold tracking-[-0.01em] text-dark-text tabular-nums"
        aria-label={`${rotulo}: ${formatar(valor)}${unidade ? ` ${unidade}` : ""}`}
      >
        {formatar(valor)}
        {unidade ? (
          <span className="ml-0.5 text-[10px] font-normal text-ink-4">
            {unidade}
          </span>
        ) : null}
      </p>

      <BotaoDePasso
        rotulo={`Aumentar ${rotulo}`}
        desabilitado={valor >= maximo}
        aoTocar={() => aoMudar(ajustar(valor, passo, minimo, maximo))}
      >
        <Plus aria-hidden size={14} strokeWidth={3} />
      </BotaoDePasso>
    </div>
  );
}

function BotaoDePasso({
  rotulo,
  desabilitado,
  aoTocar,
  children,
}: {
  rotulo: string;
  desabilitado: boolean;
  aoTocar: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={aoTocar}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      <span
        className={cn(
          "flex size-[26px] items-center justify-center rounded-full",
          "bg-dark-elev text-dark-text-2 transition active:scale-95",
        )}
      >
        {children}
      </span>
    </button>
  );
}

/** 60 vira "60"; 62,5 vira "62,5". Vírgula porque a interface é em português. */
function formatar(valor: number): string {
  return Number.isInteger(valor)
    ? String(valor)
    : String(valor).replace(".", ",");
}
