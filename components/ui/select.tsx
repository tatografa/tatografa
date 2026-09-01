"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Label em mono maiúsculo, como manda o doc 04. */
  label?: string;
  /** Mensagem de erro. Presente = campo em estado de erro. */
  error?: string;
  /** Texto de apoio abaixo do campo. Some quando há erro. */
  hint?: string;
}

/**
 * Select nativo com a moldura do design system.
 *
 * Nativo de propósito: no desktop o teclado e a busca por digitação vêm de
 * graça, e no mobile o sistema abre a roda nativa. Uma versão em div custaria
 * isso tudo em troca de estilo do menu, que não é requisito aqui.
 */
export function Select({
  className,
  label,
  error,
  hint,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const describedBy = error
    ? `${selectId}-erro`
    : hint
      ? `${selectId}-dica`
      : undefined;

  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label htmlFor={selectId} className="eyebrow text-ink-3">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full appearance-none rounded-input border-[1.5px] bg-surface",
            "pl-3.5 pr-10 text-[14.5px] font-medium text-ink transition",
            "focus:border-brand focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error ? "border-danger" : "border-border",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4"
        />
      </div>

      {error ? (
        <p id={`${selectId}-erro`} role="alert" className="text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-dica`} className="text-[12.5px] text-ink-4">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
