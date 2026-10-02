import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserRound } from "lucide-react";

import { EntrarNaLista } from "@/components/landing/entrar-na-lista";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

import capturaAlunos from "@/public/landing/alunos.png";
import capturaAppExecucao from "@/public/landing/app-execucao.png";
import capturaAppHome from "@/public/landing/app-home.png";
import capturaAppProgresso from "@/public/landing/app-progresso.png";
import capturaPainel from "@/public/landing/painel.png";
import capturaPerfil from "@/public/landing/perfil-do-aluno.png";
import capturaTreinos from "@/public/landing/treinos.png";

export const metadata: Metadata = {
  title: {
    absolute: "Reps Club · Treino montado pelo personal, executado pelo aluno",
  },
  description:
    "Personal trainers montam os treinos, acompanham cada série e a evolução de cada aluno. Alunos recebem o treino no celular e registram carga e repetições na academia.",
};

type Perfil = "personal" | "aluno";

/**
 * A landing (protótipo `Landing Page.dc.html`, pedido do Otávio em 01/10).
 *
 * **Duas páginas numa só, e o perfil vai na URL** (`/?para=alunos`), não em
 * estado: o link "para alunos" é o que o personal cola no WhatsApp para quem
 * ele treina, e um botão que só troca estado na tela não sobrevive a um link.
 * Por isso o seletor do topo é feito de links, e a página inteira é servidor —
 * o único pedaço cliente é o campo de "Entrar na lista".
 *
 * **As capturas são do produto, não do protótipo.** As imagens que vieram com
 * o protótipo mostram receita mensal, churn, ticket médio, plano, vencimento,
 * busca global e modo escuro — tudo o que este produto decidiu não ter (18/09 e
 * 27/09). Numa página pública isso é anunciar o que não existe. As de
 * `public/landing/` são as telas reais, com dados de demonstração.
 *
 * **O que não entrou:** "Instagram" e "LinkedIn" no rodapé — o protótipo tem
 * `href="#"`, e não há endereço para eles; link que não leva a lugar nenhum é
 * pior que link nenhum. Volta quando houver o endereço.
 */
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ para?: string }>;
}) {
  const { para } = await searchParams;
  const perfil: Perfil = para === "alunos" ? "aluno" : "personal";
  const texto = TEXTOS[perfil];

  return (
    <div className="bg-surface px-3 pt-3 pb-3 text-ink sm:px-6 sm:pt-6">
      <main>
        {/* ------------------------------------------------------- herói --- */}
        <section className="relative overflow-hidden rounded-[28px] bg-dark-bg">
          <nav
            aria-label="Principal"
            className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 sm:px-9"
          >
            <Link
              href="/"
              className="text-dark-text"
              aria-label="Reps Club, página inicial"
            >
              <Logo size={28} />
            </Link>

            <SeletorDePerfil perfil={perfil} />

            <Link
              href={texto.entrar.href}
              aria-label={texto.entrar.rotulo}
              title={texto.entrar.rotulo}
              className="flex size-10 items-center justify-center rounded-full border-[1.5px] border-dark-border-2 text-dark-text transition hover:-translate-y-px hover:border-dark-muted"
            >
              <UserRound size={17} aria-hidden />
            </Link>
          </nav>

          <div
            aria-hidden
            className="lp-brilho pointer-events-none absolute -bottom-[30%] left-1/2 h-[600px] w-[900px] max-w-[160%] -translate-x-1/2"
          />

          <div className="relative z-[1] px-5 pt-10 text-center sm:px-8 sm:pt-14">
            <p className="mb-6 inline-flex rounded-full bg-surface px-4 py-[7px] text-[12px] font-semibold text-ink">
              {texto.selo}
            </p>
            <h1 className="mx-auto mb-5 max-w-[760px] text-[40px] leading-[1.04] font-black tracking-[-0.03em] text-dark-text sm:text-[56px] lg:text-[66px] lg:leading-[1.02]">
              {texto.titulo}
            </h1>
            <p className="mx-auto mb-8 max-w-[560px] text-[15.5px] leading-[1.7] text-dark-muted">
              {texto.apoio}
            </p>
            <Chamada perfil={perfil} />
          </div>

          {perfil === "personal" ? <NavegadorDoPainel /> : <CelularesDoAluno />}
        </section>

        {/* ------------------------------------------- demonstração --- */}
        {perfil === "personal" ? (
          <section
            id="demonstracao"
            aria-labelledby="titulo-demonstracao"
            className="mx-auto max-w-[1160px] px-3 pt-20 sm:px-6 sm:pt-24"
          >
            <p className="eyebrow mb-3.5 text-ink-4">
              Demonstração da plataforma
            </p>
            <h2
              id="titulo-demonstracao"
              className="max-w-[760px] text-[32px] leading-[1.08] font-black tracking-[-0.02em] sm:text-[44px]"
            >
              Tudo que você precisa para gerenciar seus alunos.
            </h2>

            <Pilar
              eyebrow="Gestão de alunos"
              titulo="Todos os seus alunos, em um só painel"
              texto="Acompanhe aderência, último treino e status de cada aluno sem precisar de planilhas soltas ou grupos de WhatsApp."
              imagem={capturaAlunos}
              alt="A tela de alunos do painel: indicadores da carteira e uma tabela com programa, perfil biológico, status, último treino e aderência de cada aluno"
            />
            <Pilar
              invertido
              eyebrow="Treinos e exercícios"
              titulo="Crie treinos e cadastre exercícios em minutos"
              texto="Monte a divisão de treino do aluno com séries, repetições e RIR, a partir de uma biblioteca de exercícios própria, e envie direto para o app dele."
              imagem={capturaTreinos}
              alt="O editor de divisão de treino: o aluno, o objetivo e a frequência à esquerda, e um cartão por treino com os exercícios prescritos"
            />
            <Pilar
              eyebrow="Acompanhamento de cada treino"
              titulo="Veja a execução e a evolução de cada aluno"
              texto="Cada série que o aluno registra chega ao perfil dele, com carga e repetições. Acompanhe a evolução das cargas, a frequência e as reavaliações."
              imagem={capturaPerfil}
              alt="O perfil do aluno: dados e sessões à esquerda, os treinos registrados no meio e o programa atual à direita"
              ultimo
            />
          </section>
        ) : (
          <div className="pt-10" />
        )}

        {/* ------------------------------------------------ fechamento --- */}
        <section
          aria-labelledby="titulo-fechamento"
          className="mx-auto mb-3.5 max-w-[1160px] px-0 pt-6 sm:px-6"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-dark-bg px-6 py-16 text-center sm:px-8 sm:py-20">
            <h2
              id="titulo-fechamento"
              className="mx-auto mb-3.5 max-w-[640px] text-[34px] leading-[1.05] font-black tracking-[-0.02em] text-dark-text sm:text-[48px]"
            >
              {texto.fechamento}
            </h2>
            <p className="mb-8 text-[15px] text-dark-muted">
              {texto.fechamentoApoio}
            </p>
            <Chamada perfil={perfil} />
          </div>
        </section>
      </main>

      {/* ----------------------------------------------------- rodapé --- */}
      <footer className="mx-auto max-w-[1160px] px-0 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-dark-bg px-7 py-8 sm:px-11">
          <span className="text-dark-text">
            <Logo size={26} />
          </span>
          <nav
            aria-label="Rodapé"
            className="flex flex-wrap items-center gap-x-6 gap-y-2.5"
          >
            {perfil === "personal" ? (
              <LinkDoRodape href="#demonstracao">Demonstração</LinkDoRodape>
            ) : null}
            <LinkDoRodape href={texto.entrar.href}>
              {texto.entrar.curto}
            </LinkDoRodape>
            <LinkDoRodape href="/termos">Termos</LinkDoRodape>
            <LinkDoRodape href="/privacidade">Privacidade</LinkDoRodape>
          </nav>
          <p className="text-[12.5px] text-dark-muted">© 2026 Reps Club</p>
        </div>
      </footer>
    </div>
  );
}

const TEXTOS = {
  personal: {
    selo: "Para personal trainers",
    titulo: "A plataforma completa para gerenciar seus alunos.",
    apoio:
      "Crie treinos, cadastre exercícios, veja cada série que seus alunos registram e acompanhe a evolução de cada um em um só lugar.",
    fechamento: "Gerencie seus alunos com o Reps Club.",
    fechamentoApoio: "Deixe seu e-mail e a gente fala com você.",
    entrar: { href: "/entrar", rotulo: "Entrar no painel", curto: "Entrar" },
  },
  aluno: {
    selo: "Para alunos",
    titulo: "Seu treino, sua evolução, no seu bolso.",
    apoio:
      "Receba os treinos que seu personal monta, veja como fazer cada exercício, registre carga e repetições na academia e acompanhe sua evolução.",
    fechamento: "Treine com acompanhamento real, direto no seu bolso.",
    fechamentoApoio: "Deixe seu e-mail e a gente fala com você.",
    entrar: { href: "/acesso", rotulo: "Entrar no app", curto: "Entrar" },
  },
} as const;

/**
 * A chamada do herói e do fechamento: o e-mail e "Entrar na lista", nas duas
 * versões (pedidos do Otávio, 02/10). O "Quero começar" e o "Entrar em
 * contato" do protótipo abriam um formulário inteiro, e a lista pede só o que
 * é preciso para avisar. A lista guarda de qual versão o e-mail veio.
 */
function Chamada({ perfil }: { perfil: Perfil }) {
  return <EntrarNaLista perfil={perfil} />;
}

/**
 * "Para Personais" e "Para Alunos". Links, e não botões: cada um é um
 * endereço que se cola numa conversa. `aria-current` diz qual está aberta.
 */
function SeletorDePerfil({ perfil }: { perfil: Perfil }) {
  const opcoes: { valor: Perfil; rotulo: string; href: string }[] = [
    { valor: "personal", rotulo: "Para Personais", href: "/" },
    { valor: "aluno", rotulo: "Para Alunos", href: "/?para=alunos" },
  ];
  return (
    <div className="order-last flex w-full justify-center sm:order-none sm:w-auto">
      <div className="flex items-center gap-1 rounded-full border border-dark-border bg-dark-surface p-1">
        {opcoes.map((o) => (
          <Link
            key={o.valor}
            href={o.href}
            scroll={false}
            aria-current={perfil === o.valor ? "page" : undefined}
            className={cn(
              "rounded-full px-[18px] py-[9px] text-[12.5px] font-semibold transition",
              perfil === o.valor
                ? "bg-surface text-ink"
                : "text-dark-text-2 hover:text-dark-text",
            )}
          >
            {o.rotulo}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavegadorDoPainel() {
  return (
    <div className="relative z-[1] flex justify-center px-4 pt-12 sm:px-6 sm:pt-14">
      <div className="w-full max-w-[980px] overflow-hidden rounded-t-[14px] border border-b-0 border-dark-border bg-dark-surface shadow-vitrine">
        <div className="flex items-center gap-3 border-b border-dark-border px-3.5 py-2.5">
          <Pontos escuro />
          <p className="mx-auto w-full max-w-[360px] truncate rounded-[7px] bg-dark-surface-2 px-3 py-[5px] text-center text-[11px] font-medium text-dark-muted">
            repsclub.com.br/painel
          </p>
          <span className="w-[42px] shrink-0" />
        </div>
        <Image
          src={capturaPainel}
          alt="O painel do personal: alunos ativos, treinos na semana, aderência média, reavaliações, quem precisa de atenção, a evolução da carteira e o top 10 de progressões"
          sizes="(min-width: 1040px) 980px, 100vw"
          priority
          placeholder="blur"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}

/**
 * Três celulares: a execução e o progresso inclinados atrás, a home na frente.
 * Os laterais encolhem antes do do meio (`flex` com base própria), e é por
 * isso que a cena cabe num celular sem virar uma pilha.
 */
function CelularesDoAluno() {
  return (
    <div className="relative z-[1] flex items-end justify-center px-4 pt-12 sm:px-6 sm:pt-14">
      <Celular
        imagem={capturaAppExecucao}
        alt="A execução do treino: o exercício, a última vez que foi feito, o RIR em palavras e as séries com carga e repetições"
        className="-mr-6 w-[250px] flex-[0_1_250px] translate-y-[46px] -rotate-[8deg] sm:mr-0"
      />
      <Celular
        imagem={capturaAppHome}
        alt="A home do aluno: dias seguidos, sessões totais, o programa ativo e o próximo treino"
        className="z-[2] w-[300px] flex-[0_1_300px] -translate-y-[14px]"
        frente
      />
      <Celular
        imagem={capturaAppProgresso}
        alt="O progresso do aluno: a evolução da carga no supino nas últimas seis sessões"
        className="-ml-6 w-[250px] flex-[0_1_250px] translate-y-[46px] rotate-[8deg] sm:ml-0"
      />
    </div>
  );
}

function Celular({
  imagem,
  alt,
  className,
  frente = false,
}: {
  imagem: typeof capturaAppHome;
  alt: string;
  className?: string;
  frente?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0 origin-bottom border border-b-0 border-dark-border bg-dark-surface shadow-celular",
        frente
          ? "rounded-t-[34px] px-3.5 pt-3.5"
          : "rounded-t-[28px] px-3 pt-3",
        className,
      )}
    >
      <Image
        src={imagem}
        alt={alt}
        sizes="300px"
        priority={frente}
        placeholder="blur"
        className={cn(
          "block h-auto w-full",
          frente ? "rounded-t-[20px]" : "rounded-t-[18px]",
        )}
      />
    </div>
  );
}

function Pilar({
  eyebrow,
  titulo,
  texto,
  imagem,
  alt,
  invertido = false,
  ultimo = false,
}: {
  eyebrow: string;
  titulo: string;
  texto: string;
  imagem: typeof capturaAlunos;
  alt: string;
  invertido?: boolean;
  ultimo?: boolean;
}) {
  return (
    <div
      className={cn(
        "lp-surge grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-14",
        ultimo && "md:pb-[72px]",
      )}
    >
      <div
        className={cn(
          "rounded-[24px] bg-canvas p-4 sm:p-8",
          invertido && "md:order-2",
        )}
      >
        <div className="overflow-hidden rounded-[12px] border border-border bg-surface shadow-captura">
          <div className="flex gap-[5px] border-b border-border-soft px-2.5 py-2">
            <Pontos />
          </div>
          <Image
            src={imagem}
            alt={alt}
            sizes="(min-width: 1160px) 500px, (min-width: 768px) 45vw, 100vw"
            placeholder="blur"
            className="block h-auto w-full"
          />
        </div>
      </div>
      <div className={cn(invertido && "md:order-1")}>
        <p className="eyebrow mb-3.5 text-ink-4">{eyebrow}</p>
        <h3 className="mb-3.5 text-[28px] leading-[1.15] font-black tracking-[-0.02em] sm:text-[34px]">
          {titulo}
        </h3>
        <p className="text-[15px] leading-[1.7] text-ink-3">{texto}</p>
      </div>
    </div>
  );
}

/** Os três pontos da janela. Decoração: o leitor de tela não os lê. */
function Pontos({ escuro = false }: { escuro?: boolean }) {
  const cor = escuro ? "bg-dark-border-2" : "bg-border";
  const tamanho = escuro ? "size-2.5" : "size-2";
  return (
    <span aria-hidden className="flex shrink-0 gap-1.5">
      <span className={cn("rounded-full", cor, tamanho)} />
      <span className={cn("rounded-full", cor, tamanho)} />
      <span className={cn("rounded-full", cor, tamanho)} />
    </span>
  );
}

function LinkDoRodape({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[13px] font-medium text-dark-text-2 transition hover:text-dark-text"
    >
      {children}
    </Link>
  );
}
