import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * O "← Treinos" que abre quase toda tela do app do aluno.
 *
 * Existe como componente por causa do **alvo de toque**: escrito à mão, este
 * link tinha 14px de altura — um terço do mínimo de 44px, num app operado de
 * pé, com a mão suada, entre uma série e outra. Eram cinco cópias da mesma
 * linha, e corrigir cinco vezes só adia a sexta.
 *
 * `min-h-11` com `-mt-2` para compensar: o alvo cresce sem empurrar o título
 * para baixo, então o desenho não muda.
 */
export function LinkDeVoltar({
  href,
  children,
  tom = "claro",
}: {
  href: string;
  children: React.ReactNode;
  /** `escuro` para as telas de execução, que rodam no tema escuro. */
  tom?: "claro" | "escuro";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "eyebrow -mt-2 inline-flex min-h-11 items-center transition",
        tom === "escuro"
          ? "text-dark-muted hover:text-dark-text-2"
          : "text-ink-4 hover:text-ink-2",
      )}
    >
      {children}
    </Link>
  );
}
