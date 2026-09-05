import Link from "next/link";

import { Logo } from "@/components/logo";
import { requireTrainer } from "@/lib/auth/session";

import { BotaoSair } from "./botao-sair";

/**
 * Moldura do painel do personal (desktop).
 *
 * Aqui mora a autorização de verdade: `requireTrainer()` confirma que existe
 * linha em `trainers` para o usuário logado. O proxy só evita render à toa.
 *
 * A sidebar colapsável do doc 04 entra na fase 1, junto com as páginas que ela
 * navega. Enquanto só existe o dashboard, uma barra no topo basta.
 */
export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { trainer } = await requireTrainer();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/painel" className="text-ink">
            <Logo size={26} />
          </Link>

          <nav className="flex items-center gap-1" aria-label="Seções do painel">
            <Link
              href="/painel"
              className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
            >
              Alunos
            </Link>
            <Link
              href="/painel/macrotreinos"
              className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
            >
              Macrotreinos
            </Link>
            <Link
              href="/painel/treinos"
              className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
            >
              Treinos
            </Link>
            <Link
              href="/painel/exercicios"
              className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
            >
              Exercícios
            </Link>
            <Link
              href="/painel/configuracoes"
              className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
            >
              Configurações
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] font-medium text-ink-2 sm:block">
              {trainer.name}
            </span>
            <BotaoSair />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
