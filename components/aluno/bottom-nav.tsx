"use client";

import { Dumbbell, TrendingUp, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Aba = {
  rotulo: string;
  href?: string;
  Icone: typeof Dumbbell;
};

/**
 * As quatro abas do doc 05. No M1 só "Treinar" tem para onde ir: Progresso,
 * Feed e Perfil aparecem para o aluno entender o mapa do app, mas sem `href` —
 * um link que leva a 404 é pior que um item visivelmente indisponível.
 */
const ABAS: Aba[] = [
  { rotulo: "Treinar", href: "/app", Icone: Dumbbell },
  { rotulo: "Progresso", Icone: TrendingUp },
  { rotulo: "Feed", Icone: Users },
  { rotulo: "Perfil", Icone: User },
];

export function BottomNav() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-border-soft bg-surface",
        // A barra é fixa na janela, mas o app tem largura máxima: sem o
        // `mx-auto` interno os ícones espalhariam pela tela toda no desktop.
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto flex max-w-[440px] items-stretch">
        {ABAS.map(({ rotulo, href, Icone }) => {
          // "Treinar" cobre todo o app do aluno, não só a home — mas o
          // prefixo precisa terminar em "/": um `startsWith("/app")` cru
          // acenderia a aba em qualquer rota futura começada por "app".
          const ativa = href
            ? caminho === href || caminho.startsWith(`${href}/`)
            : false;
          const conteudo = (
            <>
              <Icone size={16} aria-hidden />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em]">
                {rotulo}
              </span>
            </>
          );

          return (
            <li key={rotulo} className="flex-1">
              {href ? (
                <Link
                  href={href}
                  aria-current={ativa ? "page" : undefined}
                  // 64px de altura: alvo de toque bem acima dos 44px mínimos.
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 transition",
                    ativa ? "text-brand" : "text-ink-5 hover:text-ink-3",
                  )}
                >
                  {conteudo}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  title="Disponível em breve"
                  className="flex h-16 flex-col items-center justify-center gap-1 text-ink-5 opacity-45"
                >
                  {conteudo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
