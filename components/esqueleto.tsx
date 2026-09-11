import { cn } from "@/lib/utils";

/**
 * Bloco cinza que ocupa o lugar do conteúdo enquanto ele carrega.
 *
 * Esqueleto e não "carregando…": o esqueleto com a **forma do conteúdo** evita
 * o salto de layout quando o dado chega, e já diz o que vem — uma lista, um
 * cartão, um gráfico. Um spinner centralizado não diz nada e ainda mede errado.
 *
 * `motion-reduce:animate-none` porque pulsar a tela inteira é exatamente o tipo
 * de movimento que a preferência do sistema pede para desligar.
 */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse rounded-[7px] bg-canvas-sunken motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Envelope com o papel de "carregando" anunciado uma vez só. */
export function Carregando({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={rotulo}>
      {children}
    </div>
  );
}
