import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `plain` não tem borda: a separação vem do fundo. */
  variant?: "bordered" | "plain" | "brand";
  /** 14px é o card de lista; 16px o card em destaque. */
  size?: "md" | "lg";
}

export function Card({
  className,
  variant = "bordered",
  size = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface",
        size === "lg" ? "rounded-card-lg p-4.5" : "rounded-card p-3.5",
        variant === "bordered" && "border border-border-soft",
        variant === "brand" && "border-[1.5px] border-brand",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[17px] font-extrabold tracking-[-0.01em] text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[14px] leading-relaxed text-ink-3", className)}
      {...props}
    />
  );
}
