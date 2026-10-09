"use client";

import { TrendingUp, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useIdioma } from "./idioma-do-app";

type Rotulo = "treinar" | "progresso" | "feed" | "perfil";

type Aba = {
  /** A chave do rótulo no dicionário — e o que identifica a aba ativa. */
  rotulo: Rotulo;
  href: string;
  /**
   * Fica apagada quando o acesso está pausado.
   *
   * **"Treinar" não apaga, embora leve à tela de aviso**, e Perfil também não:
   * desativar as quatro deixaria o aluno pausado sem como voltar ao aviso
   * depois de abrir o perfil — barra inteira apagada é beco sem saída, não
   * informação.
   */
  sePausa?: boolean;
};

/**
 * As quatro abas, na ordem do protótipo A6 ("Treinar integrado"): "Treinar" na
 * ponta direita, onde o polegar direito alcança sem esticar.
 */
const ABAS: Aba[] = [
  { rotulo: "progresso", href: "/app/progresso", sePausa: true },
  { rotulo: "feed", href: "/app/feed", sePausa: true },
  { rotulo: "perfil", href: "/app/perfil" },
  { rotulo: "treinar", href: "/app" },
];

const ICONES: Record<Rotulo, React.ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  progresso: TrendingUp,
  feed: Users,
  perfil: User,
  treinar: Haltere,
};

/** Lado do botão e o espaço entre eles: o passo do círculo que desliza. */
const LADO = 52;
const VAO = 6;

/**
 * Qual aba acende: a de **prefixo mais longo** que casa com a rota.
 *
 * "Treinar" é `/app` e cobre todo o app do aluno, então `/app/progresso`
 * também casa com ela — as duas acenderiam ao mesmo tempo. Ganha a mais
 * específica. O prefixo termina em "/" de propósito: um `startsWith("/app")`
 * cru acenderia a aba numa rota futura chamada `/apps`.
 */
function abaAtiva(caminho: string): Rotulo | null {
  let escolhida: Aba | null = null;
  for (const aba of ABAS) {
    const casa = caminho === aba.href || caminho.startsWith(`${aba.href}/`);
    if (!casa) continue;
    if (!escolhida || aba.href.length > escolhida.href.length) escolhida = aba;
  }
  return escolhida?.rotulo ?? null;
}

/**
 * O menu de baixo no desenho do protótipo A6: uma pílula escura flutuando sobre
 * a tela, só com ícones.
 *
 * **O vermelho é a aba aberta, e só ela** — inclusive "Treinar", que fora da
 * própria tela fica cinza como as outras. A primeira versão deixava o Treinar
 * vermelho sempre e marcava a aba atual com um círculo branco, e o Otávio leu
 * dois destaques ao mesmo tempo (09/10). Agora o círculo vermelho desliza para
 * a aba escolhida.
 *
 * **Sem os rótulos escritos**, como no protótipo: o nome de cada aba vai no
 * `aria-label`, que é o que o leitor de tela anuncia. A troca custa a leitura
 * de relance para quem não reconhece o ícone — pedido do Otávio (09/10).
 */
export function BottomNav({ naTurma = true }: { naTurma?: boolean }) {
  const caminho = usePathname();
  const ativa = abaAtiva(caminho);
  const { t } = useIdioma();

  const indice = ABAS.findIndex((a) => a.rotulo === ativa);

  return (
    <nav
      aria-label={t.comum.nav.rotulo}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto relative flex gap-1.5 rounded-full bg-dark-surface p-1.5 shadow-menu">
        {indice >= 0 ? (
          <li
            aria-hidden
            className="absolute top-1.5 left-1.5 size-[52px] rounded-full bg-brand transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `translateX(${indice * (LADO + VAO)}px)` }}
          />
        ) : null}

        {ABAS.map(({ rotulo, href, sePausa }) => {
          const Icone = ICONES[rotulo];
          const atual = rotulo === ativa;
          const pausada = !naTurma && sePausa === true;
          const nome = t.comum.nav[rotulo];
          const classe = cn(
            "relative z-10 flex size-[52px] items-center justify-center rounded-full transition-colors duration-250 focus-visible:outline-surface",
            atual ? "text-white" : "text-dark-muted",
          );

          return (
            <li key={rotulo}>
              {pausada ? (
                <span
                  role="link"
                  aria-disabled="true"
                  aria-label={nome}
                  title={t.comum.nav.pausada}
                  className={cn(classe, "opacity-45")}
                >
                  <Icone size={22} strokeWidth={2} aria-hidden />
                </span>
              ) : (
                <Link
                  href={href}
                  aria-label={nome}
                  aria-current={atual ? "page" : undefined}
                  className={cn(classe, !atual && "hover:text-dark-text")}
                >
                  <Icone size={22} strokeWidth={2} aria-hidden />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * O haltere deitado do protótipo. O `Dumbbell` do lucide é inclinado e, na
 * ponta da pílula, lia como uma ferramenta; deitado ele é uma barra com anilhas.
 */
function Haltere({ size = 22, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 6v12M17.5 6v12M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  );
}
