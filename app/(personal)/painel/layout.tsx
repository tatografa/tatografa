import Link from "next/link";

import { Logo } from "@/components/logo";
import { BotaoSair } from "@/components/botao-sair";
import { requireTrainer } from "@/lib/auth/session";

/** As seções do painel, na ordem do doc 06. */
const NAVEGACAO = [
  { href: "/painel", rotulo: "Painel" },
  { href: "/painel/alunos", rotulo: "Alunos" },
  { href: "/painel/macrotreinos", rotulo: "Macrotreinos" },
  { href: "/painel/treinos", rotulo: "Treinos" },
  { href: "/painel/exercicios", rotulo: "Exercícios" },
  { href: "/painel/agenda", rotulo: "Agenda" },
  { href: "/painel/reavaliacoes", rotulo: "Reavaliações" },
  { href: "/painel/social", rotulo: "Social" },
  { href: "/painel/treinar", rotulo: "Treinar" },
  { href: "/painel/configuracoes", rotulo: "Configurações" },
] as const;

/**
 * Moldura do painel do personal (desktop).
 *
 * Aqui mora a autorização de verdade: `requireTrainer()` confirma que existe
 * linha em `trainers` para o usuário logado. O proxy só evita render à toa.
 *
 * A sidebar colapsável do doc 04 continua não existindo: a barra no topo
 * navega as mesmas páginas, e trocar de moldura não muda nada do que o
 * personal consegue fazer. Fica como dívida conhecida, não como pendência.
 *
 * `NAVEGACAO` é uma lista e não dez `<Link>` escritos à mão porque nove deles
 * eram a mesma linha de classes copiada — e foi assim que "Alunos" ficou
 * apontando para `/painel` depois que a tela de alunos ganhou endereço próprio.
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
            {NAVEGACAO.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[9px] px-3 py-1.5 text-[13px] font-semibold text-ink-3 transition hover:bg-canvas-sunken hover:text-ink"
              >
                {item.rotulo}
              </Link>
            ))}
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
