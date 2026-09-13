import Link from "next/link";

import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";
import { cn } from "@/lib/utils";

/**
 * Os dois links legais, nas telas públicas.
 *
 * Existe porque o onboarding pedia aceite de documento que não se podia ler, e
 * porque quem quer reler depois não deveria ter de procurar.
 */
export function RodapeLegal({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-4",
        className,
      )}
    >
      <Link href="/termos" className="transition hover:text-ink-2">
        Termos de uso
      </Link>
      <Link href="/privacidade" className="transition hover:text-ink-2">
        Privacidade
      </Link>
      <span className="text-ink-5">Versão {VERSAO_DOS_DOCUMENTOS}</span>
    </footer>
  );
}
