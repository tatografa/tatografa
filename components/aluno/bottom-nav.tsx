"use client";

import { TrendingUp, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
 * As três abas comuns, na ordem do protótipo A6 ("Treinar integrado"): o
 * círculo branco desliza entre elas, e "Treinar" mora à parte, na ponta, onde o
 * polegar direito alcança sem esticar.
 */
const LATERAIS: Aba[] = [
  { rotulo: "progresso", href: "/app/progresso", sePausa: true },
  { rotulo: "feed", href: "/app/feed", sePausa: true },
  { rotulo: "perfil", href: "/app/perfil" },
];

const TREINAR: Aba = { rotulo: "treinar", href: "/app" };

const ICONES: Record<Exclude<Rotulo, "treinar">, typeof User> = {
  progresso: TrendingUp,
  feed: Users,
  perfil: User,
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
  for (const aba of [TREINAR, ...LATERAIS]) {
    const casa = caminho === aba.href || caminho.startsWith(`${aba.href}/`);
    if (!casa) continue;
    if (!escolhida || aba.href.length > escolhida.href.length) escolhida = aba;
  }
  return escolhida?.rotulo ?? null;
}

/**
 * O menu de baixo no desenho do protótipo A6: uma pílula escura flutuando sobre
 * a tela, só com ícones, e "Treinar" sempre em vermelho na ponta — é a ação
 * pela qual o aluno abre o app na academia.
 *
 * **Sem os rótulos escritos**, como no protótipo: o nome de cada aba vai no
 * `aria-label`, que é o que o leitor de tela anuncia, e os quatro ícones são os
 * de sempre do produto. A troca custa a leitura de relance para quem não
 * reconhece o ícone — pedido do Otávio (09/10).
 *
 * **O círculo branco lembra onde estava.** Em "Treinar" ele some encolhendo no
 * lugar da última aba comum, e volta dali: assim o movimento sempre parte de
 * onde o olho já estava. A lembrança é estado do componente — o layout do app
 * não desmonta entre uma tela e outra — ajustado durante a renderização, o
 * padrão do projeto.
 */
export function BottomNav({ naTurma = true }: { naTurma?: boolean }) {
  const caminho = usePathname();
  const ativa = abaAtiva(caminho);
  const { t } = useIdioma();

  const indice = LATERAIS.findIndex((a) => a.rotulo === ativa);
  const [ultimo, setUltimo] = useState(indice >= 0 ? indice : 0);
  if (indice >= 0 && indice !== ultimo) setUltimo(indice);
  const mostraCirculo = indice >= 0;

  return (
    <nav
      aria-label={t.comum.nav.rotulo}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto relative flex gap-1.5 rounded-full bg-dark-surface p-1.5 shadow-menu">
        <li
          aria-hidden
          className="absolute top-1.5 left-1.5 size-[52px] rounded-full bg-surface transition-[transform,opacity] duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            transform: `translateX(${ultimo * (LADO + VAO)}px) scale(${mostraCirculo ? 1 : 0.6})`,
            opacity: mostraCirculo ? 1 : 0,
          }}
        />

        {LATERAIS.map(({ rotulo, href, sePausa }) => {
          const Icone = ICONES[rotulo as keyof typeof ICONES];
          const atual = rotulo === ativa;
          const pausada = !naTurma && sePausa === true;
          const nome = t.comum.nav[rotulo];
          const classe = cn(
            "relative z-10 flex size-[52px] items-center justify-center rounded-full transition-colors duration-250 focus-visible:outline-surface",
            atual ? "text-ink" : "text-dark-muted",
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

        <li>
          <Link
            href={TREINAR.href}
            aria-label={t.comum.nav.treinar}
            aria-current={ativa === "treinar" ? "page" : undefined}
            className={cn(
              "relative z-10 flex size-[52px] items-center justify-center rounded-full bg-brand text-white transition-shadow duration-250 focus-visible:outline-surface",
              // O anel branco é o "você está aqui" do Treinar: o fundo já é
              // vermelho sempre, então o que marca a aba atual é o contorno.
              ativa === "treinar"
                ? "shadow-[inset_0_0_0_2px_var(--color-surface)]"
                : "shadow-[inset_0_0_0_0_var(--color-surface)]",
            )}
          >
            <Haltere />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

/**
 * O haltere deitado do protótipo. O `Dumbbell` do lucide é inclinado e, na
 * ponta da pílula, lia como uma ferramenta; deitado ele é uma barra com anilhas.
 */
function Haltere() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 6v12M17.5 6v12M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  );
}
