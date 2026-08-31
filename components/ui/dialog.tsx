"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface DialogProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  /** Largura máxima do painel. Padrão serve para formulário curto. */
  className?: string;
}

/**
 * Dialog modal sobre `<dialog>` nativo.
 *
 * O elemento nativo entrega de graça o que uma versão em div custaria caro:
 * foco preso dentro do painel, Esc para fechar, e o resto da página inerte
 * para leitor de tela.
 */
export function Dialog({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  className,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  if (!aberto) return null;

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(evento) => {
        // Clique no backdrop fecha. O backdrop é o próprio <dialog>: um clique
        // dentro do painel tem outro alvo e não chega aqui.
        if (evento.target === ref.current) aoFechar();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-[420px] rounded-card-lg bg-surface p-0",
        "backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]",
        className,
      )}
      aria-labelledby="dialog-titulo"
    >
      <div className="p-6">
        <header className="mb-5 space-y-1.5">
          <h2
            id="dialog-titulo"
            className="text-[19px] font-extrabold tracking-[-0.02em] text-ink"
          >
            {titulo}
          </h2>
          {descricao && (
            <p className="text-[13.5px] font-medium leading-[1.5] text-ink-3">
              {descricao}
            </p>
          )}
        </header>
        {children}
      </div>
    </dialog>
  );
}
