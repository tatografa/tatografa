"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label em mono maiúsculo, como manda o doc 04. */
  label?: string;
  /** Mensagem de erro. Presente = campo em estado de erro. */
  error?: string;
  /** Texto de apoio abaixo do campo. Some quando há erro. */
  hint?: string;
}

export function Textarea({
  className,
  label,
  error,
  hint,
  id,
  rows = 3,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const areaId = id ?? generatedId;
  const describedBy = error
    ? `${areaId}-erro`
    : hint
      ? `${areaId}-dica`
      : undefined;

  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label htmlFor={areaId} className="eyebrow text-ink-3">
          {label}
        </label>
      )}

      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-input border-[1.5px] bg-surface px-3.5 py-2.5",
          "text-[14.5px] leading-[1.5] text-ink transition placeholder:text-ink-5",
          "focus:border-brand focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={`${areaId}-erro`} role="alert" className="text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${areaId}-dica`} className="text-[12.5px] text-ink-4">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
