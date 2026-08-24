import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // A elevação (shadow-cta + subida de 1px) é o que marca a ação primária.
  primary:
    "bg-brand text-white shadow-cta hover:bg-brand-hover hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-surface text-ink border-[1.5px] border-border hover:bg-canvas-sunken hover:-translate-y-px active:translate-y-0",
  ghost: "bg-transparent text-ink-2 hover:bg-canvas-sunken hover:text-ink",
  // `danger` usa o mesmo vermelho da marca (doc 04). O que separa os dois é a
  // ausência de elevação: ação destrutiva não deve convidar ao clique.
  danger: "bg-danger text-white hover:bg-brand-hover",
};

const sizes: Record<Size, string> = {
  // `sm` fica abaixo dos 44px de alvo de toque: use só no painel (desktop, mouse).
  sm: "h-9 px-3 text-[13px] rounded-[10px]",
  md: "h-11 px-4 text-[14.5px] rounded-button",
  lg: "h-[52px] px-5 text-[16px] rounded-[13px]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Ocupa toda a largura disponível. Padrão de formulário no mobile. */
  block?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  block = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap transition",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
