import Image from "next/image";

import { cn } from "@/lib/utils";

/** Marca do Reps Club: símbolo + palavra. */
export function Logo({
  className,
  size = 30,
}: {
  className?: string;
  size?: number;
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
      <span className="text-[17px] font-extrabold tracking-[-0.01em]">
        reps club
      </span>
    </span>
  );
}
