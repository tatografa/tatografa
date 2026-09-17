"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Folha que sobe de baixo — o padrão do doc 05 §5 para o menu da execução.
 *
 * **Sobre `<dialog>` nativo, como o `Dialog`**, e pelo mesmo motivo: o
 * elemento entrega de graça o foco preso dentro do painel, Esc para fechar e o
 * resto da página inerte para leitor de tela. Um `<div>` com `position: fixed`
 * custaria caro para chegar perto disso, e é a tela que o aluno usa suado, de
 * pé, com uma mão só.
 *
 * **Componente à parte do `Dialog` porque a diferença não é de estilo.** O
 * diálogo do painel é uma caixa centrada num desktop; aqui o painel encosta na
 * borda de baixo, respeita a área segura do aparelho e se apoia no polegar. O
 * tema também é outro: a execução roda no escuro, e reaproveitar o `Dialog`
 * exigiria condicionar cada cor dele por uma prop.
 */
export function BottomSheet({
  aberto,
  aoFechar,
  titulo,
  children,
  className,
}: BottomSheetProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  // Id gerado e não fixo: duas folhas montadas ao mesmo tempo repetiriam o id
  // e o leitor de tela leria o título da outra.
  const tituloId = `${React.useId()}-titulo`;

  React.useEffect(() => {
    const folha = ref.current;
    if (!folha) return;
    if (aberto && !folha.open) folha.showModal();
    if (!aberto && folha.open) folha.close();
  }, [aberto]);

  if (!aberto) return null;

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(evento) => {
        // O backdrop é o próprio <dialog>: clique dentro do painel tem outro
        // alvo e não chega aqui.
        if (evento.target === ref.current) aoFechar();
      }}
      aria-labelledby={tituloId}
      className={cn(
        // `mt-auto` encosta embaixo; a largura máxima acompanha a do conteúdo
        // da execução, para a folha não atravessar a tela inteira num tablet.
        "m-0 mt-auto w-full max-w-full rounded-t-[22px] bg-dark-surface-2 p-0",
        "backdrop:bg-ink/60",
        className,
      )}
    >
      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-[calc(18px+env(safe-area-inset-bottom))]">
        {/* Puxador. Decorativo: quem usa teclado fecha com Esc, e quem usa
            leitor de tela ouve o título — a barrinha só diz "isto arrasta"
            para o polegar. */}
        <div
          aria-hidden
          className="mx-auto mb-4 h-1 w-9 rounded-full bg-dark-border-2"
        />
        <h2
          id={tituloId}
          className="eyebrow mb-3 text-[10px] text-dark-muted"
        >
          {titulo}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
