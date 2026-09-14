import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "neutro" | "brand" | "brand-solido" | "sucesso" | "atencao";

const tones: Record<Tone, string> = {
  neutro: "bg-badge-neutral text-ink-2",
  brand: "bg-brand-soft text-brand",
  // Selo que precisa saltar dentro de um card já discreto (doc 05: "SUGERIDO",
  // branco sobre a marca).
  "brand-solido": "bg-brand text-white",
  sucesso: "bg-success-soft text-success",
  // `warning-bg` é o par do doc 04 para o aviso de reavaliação.
  atencao: "bg-warning-bg text-warning",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Pílula curta em mono maiúsculo: selo de técnica, status, contagem. */
export function Badge({ className, tone = "neutro", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-1",
        "font-mono text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
