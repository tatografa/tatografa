"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label em mono maiúsculo, como manda o doc 04. */
  label?: string;
  /** Mensagem de erro. Presente = campo em estado de erro. */
  error?: string;
  /** Texto de apoio abaixo do campo. Some quando há erro. */
  hint?: string;
  /** Elemento à direita do label (ex.: "Esqueci minha senha"). */
  labelAction?: React.ReactNode;
}

export function Input({
  className,
  label,
  error,
  hint,
  labelAction,
  id,
  type = "text",
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-erro`
    : hint
      ? `${inputId}-dica`
      : undefined;

  return (
    <div className="flex flex-col gap-[7px]">
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <label htmlFor={inputId} className="eyebrow text-ink-3">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}

      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-input border-[1.5px] bg-surface px-3.5 text-[14px] font-medium text-ink transition",
          "placeholder:font-normal placeholder:text-ink-5",
          "focus:outline-none focus-visible:outline-none",
          error
            ? "border-danger focus:ring-[3px] focus:ring-danger/15"
            : "border-border focus:border-brand focus:ring-[3px] focus:ring-brand/15",
          "disabled:bg-canvas-sunken disabled:text-ink-4",
          className,
        )}
        {...props}
      />

      {error ? (
        <p
          id={`${inputId}-erro`}
          className="text-[12.5px] font-semibold text-danger"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-dica`} className="text-[12.5px] text-ink-4">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
