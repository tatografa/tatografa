import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Marca do Reps Club: símbolo + palavra.
 *
 * `apenasSimbolo` existe para a sidebar recolhida, onde cabem 68px e a palavra
 * não entra. Uma prop e não um segundo componente: o símbolo é o mesmo arquivo,
 * e duas cópias divergiriam no dia em que o logo mudasse.
 */
export function Logo({
  className,
  size = 30,
  apenasSimbolo = false,
}: {
  className?: string;
  size?: number;
  apenasSimbolo?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.svg"
        alt=""
        width={size}
        height={size}
        className="rounded-[8px]"
        priority
      />
      {!apenasSimbolo && (
        <span className="text-[17px] font-extrabold tracking-[-0.01em]">
          reps club
        </span>
      )}
    </span>
  );
}
