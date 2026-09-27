"use client";

import {
  CalendarDays,
  ChevronLeft,
  Dumbbell,
  LayoutDashboard,
  Library,
  MessageCircle,
  PlayCircle,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { iniciaisDe } from "@/lib/domain/nome";
import { useMontado } from "@/lib/usar-montado";

/**
 * As seções do painel, na ordem do protótipo do doc 06.
 *
 * "Macrotreinos" saiu em 27/09: o programa passou a ser montado dentro de
 * "Treinos" (a divisão de treino do protótipo), e dois itens para a mesma
 * tarefa fariam o personal procurar o programa em um e o treino no outro.
 *
 * `fim: true` marca os itens que ficam separados no pé da lista: "Treinar" leva
 * o personal para o **app do aluno** e "Configurações" é da conta, não da
 * carteira. Misturados no meio, os dois parecem mais uma tela de trabalho.
 */
const NAVEGACAO = [
  { href: "/painel", rotulo: "Painel", Icone: LayoutDashboard },
  { href: "/painel/alunos", rotulo: "Alunos", Icone: Users, contagem: true },
  { href: "/painel/social", rotulo: "Feed", Icone: MessageCircle },
  { href: "/painel/treinos", rotulo: "Treinos", Icone: Dumbbell },
  { href: "/painel/exercicios", rotulo: "Exercícios", Icone: Library },
  // Agenda e reavaliações são uma tela só desde 27/09; a comparação de um
  // aluno continua em /painel/reavaliacoes/<id> e acende este item.
  { href: "/painel/agenda", rotulo: "Agenda", Icone: CalendarDays, tambem: "/painel/reavaliacoes" },
  { href: "/painel/treinar", rotulo: "Treinar", Icone: PlayCircle, fim: true },
  { href: "/painel/configuracoes", rotulo: "Configurações", Icone: Settings, fim: true },
] as const;

const CHAVE = "reps:painel:sidebar-colapsada";

/**
 * A navegação lateral do painel (doc 04, "sidebar colapsável à esquerda").
 *
 * Substitui a barra no topo, que navegava as mesmas páginas mas dava ao painel
 * a silhueta de um site em vez de a de uma ferramenta — é a diferença que mais
 * salta ao comparar com o protótipo, e ela não depende de dado nenhum novo.
 *
 * **O que o protótipo tem aqui e não foi construído, com o motivo:**
 * - *Campo de busca global* — não existe busca que atravesse alunos, treinos e
 *   exercícios. Um campo que abre e não acha nada é pior que campo nenhum.
 * - *Card "Plano Pro · 24/40 alunos"* — pressupõe que o Reps Club cobra do
 *   personal, e não há plano, preço nem pagamento em lugar nenhum do modelo.
 * - *Alternador de tema* — os tokens `dark-*` existem para a tela de execução,
 *   não para o painel; um modo escuro de verdade é revisar cada componente.
 */
export function NavegacaoLateral({
  nome,
  alunos,
  sair,
}: {
  nome: string;
  /** Vai no marcador de "Alunos", como no protótipo. */
  alunos: number;
  /** O botão de sair, recebido pronto: ele serve aos dois lados do produto. */
  sair: React.ReactNode;
}) {
  const montado = useMontado();
  return <Lateral key={String(montado)} nome={nome} alunos={alunos} sair={sair} montado={montado} />;
}

function Lateral({
  nome,
  alunos,
  sair,
  montado,
}: {
  nome: string;
  alunos: number;
  sair: React.ReactNode;
  montado: boolean;
}) {
  /*
   * O estado colapsado vem do armazenamento **no inicializador**, e o
   * componente só é montado com `montado = true` por causa da `key` acima.
   * Ler no render de hidratação daria HTML diferente do servidor; ler em efeito
   * seria `setState` dentro de efeito, que o lint recusa.
   */
  const [colapsada, setColapsada] = useState(() => {
    if (!montado) return false;
    try {
      return window.localStorage.getItem(CHAVE) === "1";
    } catch {
      // Navegador com armazenamento bloqueado abre expandida, que é o padrão.
      return false;
    }
  });

  function alternar() {
    const proximo = !colapsada;
    setColapsada(proximo);
    try {
      window.localStorage.setItem(CHAVE, proximo ? "1" : "0");
    } catch {
      // A preferência não sobrevive ao recarregar, e a navegação continua.
    }
  }

  const pathname = usePathname();

  return (
    <aside
      data-colapsada={colapsada ? "" : undefined}
      // Um cartão flutuando no fundo cinza, como no protótipo: 13px da borda
      // da janela, cantos de 20px. Pregado com `sticky` e não `fixed` — a
      // janela continua sendo quem rola, e o conteúdo ao lado não precisa
      // reservar espaço para ele.
      className={`sticky top-[13px] flex h-[calc(100dvh-26px)] shrink-0 flex-col rounded-[20px] bg-surface py-[18px] shadow-xs transition-[width] duration-200 ${
        colapsada ? "w-[68px]" : "w-[252px]"
      }`}
    >
      <div className={`mb-[18px] flex items-center ${colapsada ? "justify-center px-2" : "justify-between pr-2.5 pl-[18px]"}`}>
        <Link href="/painel" className="text-ink" aria-label="Painel do Reps Club">
          {colapsada ? <Logo size={32} apenasSimbolo /> : <Logo size={32} />}
        </Link>
        {!colapsada && <BotaoDeColapso colapsada={colapsada} aoAlternar={alternar} />}
      </div>

      {colapsada && (
        <div className="flex justify-center pb-1">
          <BotaoDeColapso colapsada={colapsada} aoAlternar={alternar} />
        </div>
      )}

      <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3.5">
        {!colapsada && (
          <p className="mb-2 px-2 text-[12px] font-medium tracking-[0.02em] text-ink-5">
            Navegação
          </p>
        )}
        <ul className="space-y-0.5">
          {NAVEGACAO.map((item, i) => (
            <li key={item.href}>
              {/* A separação antes do bloco final, só quando expandida: numa
                  faixa de ícones a linha vira ruído. */}
              {!colapsada && "fim" in item && !("fim" in NAVEGACAO[i - 1]) ? (
                <div className="my-2 border-t border-border-soft" />
              ) : null}
              <ItemDaNavegacao
                {...item}
                alunos={alunos}
                colapsada={colapsada}
                ativo={
                  rotaAtiva(pathname, item.href) ||
                  ("tambem" in item && rotaAtiva(pathname, item.tambem))
                }
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className={`mx-3.5 border-t border-border-soft pt-3 ${colapsada ? "flex justify-center" : ""}`}>
        {colapsada ? (
          <span
            title={nome}
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white"
          >
            {iniciaisDe(nome)}
          </span>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[13px] font-semibold text-ink-2">
              {nome}
            </span>
            {sair}
          </div>
        )}
      </div>
    </aside>
  );
}

function BotaoDeColapso({
  colapsada,
  aoAlternar,
}: {
  colapsada: boolean;
  aoAlternar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-label={colapsada ? "Expandir o menu" : "Recolher o menu"}
      aria-pressed={colapsada}
      className="flex size-9 items-center justify-center rounded-[9px] text-ink-4 transition hover:bg-canvas-sunken hover:text-ink-2"
    >
      <ChevronLeft
        aria-hidden
        size={17}
        className={`transition-transform ${colapsada ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function ItemDaNavegacao({
  href,
  rotulo,
  Icone,
  ativo,
  colapsada,
  alunos,
  contagem = false,
}: {
  href: string;
  rotulo: string;
  Icone: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  ativo: boolean;
  colapsada: boolean;
  alunos: number;
  contagem?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      // `title` só na faixa de ícones: com o rótulo visível, a dica repete.
      title={colapsada ? rotulo : undefined}
      /*
       * O item ativo como no protótipo: fundo preenchido e texto mais forte,
       * sem o traço vermelho à esquerda que o doc 04 pedia. O protótipo é o
       * desenho que o Otávio escolheu depois (27/09), e o sinal continua não
       * sendo só cor — é uma forma (o fundo) mais um peso de fonte.
       */
      className={`relative flex min-h-10 items-center gap-[11px] rounded-[8px] py-2.5 text-[13.5px] transition ${
        colapsada ? "justify-center px-0" : "px-[11px]"
      } ${
        ativo
          ? "bg-canvas font-semibold text-ink"
          : "font-medium text-ink-3 hover:bg-canvas hover:text-ink"
      }`}
    >
      <Icone aria-hidden size={18} />
      {!colapsada && (
        <>
          <span className="flex-1 truncate">{rotulo}</span>
          {contagem && alunos > 0 && (
            <span className="rounded-full bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand tabular-nums">
              {alunos}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/**
 * O item ativo é o de rota mais específica que casa — senão "/painel" ficaria
 * aceso em toda tela, porque toda rota do painel começa por ele.
 */
function rotaAtiva(pathname: string, href: string): boolean {
  if (href === "/painel") return pathname === "/painel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

