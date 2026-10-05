import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserRound } from "lucide-react";

import {
  AvisoDeCookies,
  PreferenciasDeCookies,
} from "@/components/landing/aviso-de-cookies";
import { EntrarNaLista } from "@/components/landing/entrar-na-lista";
import { Logo } from "@/components/logo";
import {
  IDIOMAS,
  enderecoDaLanding,
  idiomaDe,
  type Idioma,
  type PerfilDaLanding,
} from "@/lib/domain/idioma";
import { TEXTOS_DA_LANDING, type TextosDaLanding } from "@/lib/landing/textos";
import { cn } from "@/lib/utils";

import capturaAlunos from "@/public/landing/alunos.png";
import capturaAppExecucao from "@/public/landing/app-execucao.png";
import capturaAppHome from "@/public/landing/app-home.png";
import capturaAppProgresso from "@/public/landing/app-progresso.png";
import capturaPainel from "@/public/landing/painel.png";
import capturaPerfil from "@/public/landing/perfil-do-aluno.png";
import capturaTreinos from "@/public/landing/treinos.png";

type Busca = { para?: string; lang?: string };

/** O nome da aba é o do site todo ("Reps Club"); muda só a descrição, por idioma. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return { description: TEXTOS_DA_LANDING[idiomaDe(lang)].descricao };
}

type Perfil = PerfilDaLanding;

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
 * **Três idiomas pela URL** (`?lang=en`, `?lang=es`; pedido do Otávio, 05/10):
 * o texto mora em `lib/landing/textos.ts`, e a página só escolhe qual. O
 * `lang` vai no contêiner, para o leitor de tela pronunciar em inglês o que
 * está em inglês — o `<html>` continua `pt-BR`, porque o resto do site é.
 *
 * **O que não entrou:** "Instagram" e "LinkedIn" no rodapé — o protótipo tem
 * `href="#"`, e não há endereço para eles; link que não leva a lugar nenhum é
 * pior que link nenhum. Volta quando houver o endereço.
 */
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const { para, lang } = await searchParams;
  const perfil: Perfil = para === "alunos" ? "aluno" : "personal";
  const idioma = idiomaDe(lang);
  const t = TEXTOS_DA_LANDING[idioma];
  const texto = t.porPerfil[perfil];
  const entrarHref = ENTRAR[perfil];

  return (
    <div
      lang={IDIOMAS.find((i) => i.valor === idioma)?.lang}
      className="bg-surface px-3 pt-3 pb-3 text-ink sm:px-6 sm:pt-6"
    >
      <main>
        {/* ------------------------------------------------------- herói --- */}
        <section className="relative overflow-hidden rounded-[28px] bg-dark-bg">
          <nav
            aria-label={t.navegacao.principal}
            className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-5 sm:px-9"
          >
            <Link
              href={enderecoDaLanding("personal", idioma)}
              className="text-dark-text"
              aria-label={t.navegacao.inicio}
            >
              <Logo size={28} />
            </Link>

            <SeletorDePerfil perfil={perfil} idioma={idioma} rotulos={t.perfis} />

            <div className="flex items-center gap-2">
              <SeletorDeIdioma
                perfil={perfil}
                idioma={idioma}
                rotulo={t.navegacao.idioma}
              />
              {/* Branco (pedido do Otávio, 05/10): o mesmo branco da pílula
                  do perfil escolhido, para o botão de entrar não sumir no
                  fundo escuro. */}
              <Link
                href={entrarHref}
                aria-label={texto.entrar.rotulo}
                title={texto.entrar.rotulo}
                className="flex size-10 items-center justify-center rounded-full bg-surface text-ink transition hover:-translate-y-px hover:bg-dark-text-2"
              >
                <UserRound size={17} aria-hidden />
              </Link>
            </div>
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
            <Chamada perfil={perfil} textos={t.lista} />
          </div>

          {perfil === "personal" ? (
            <NavegadorDoPainel alt={t.capturas.painel} />
          ) : (
            <CelularesDoAluno capturas={t.capturas} />
          )}
        </section>

        {/* ------------------------------------------- demonstração --- */}
        {perfil === "personal" ? (
          <section
            id="demonstracao"
            aria-labelledby="titulo-demonstracao"
            className="mx-auto max-w-[1160px] px-3 pt-20 sm:px-6 sm:pt-24"
          >
            <p className="eyebrow mb-3.5 text-ink-4">
              {t.demonstracao.eyebrow}
            </p>
            <h2
              id="titulo-demonstracao"
              className="max-w-[760px] text-[32px] leading-[1.08] font-black tracking-[-0.02em] sm:text-[44px]"
            >
              {t.demonstracao.titulo}
            </h2>

            <Pilar {...t.demonstracao.pilares[0]} imagem={capturaAlunos} />
            <Pilar
              {...t.demonstracao.pilares[1]}
              imagem={capturaTreinos}
              invertido
            />
            <Pilar
              {...t.demonstracao.pilares[2]}
              imagem={capturaPerfil}
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
            <Chamada perfil={perfil} textos={t.lista} />
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
            aria-label={t.navegacao.rodape}
            className="flex flex-wrap items-center gap-x-6 gap-y-2.5"
          >
            {perfil === "personal" ? (
              <LinkDoRodape href="#demonstracao">
                {t.rodape.demonstracao}
              </LinkDoRodape>
            ) : null}
            <LinkDoRodape href={entrarHref}>{texto.entrar.curto}</LinkDoRodape>
            <LinkDoRodape href="/termos">{t.rodape.termos}</LinkDoRodape>
            <LinkDoRodape href="/privacidade">{t.rodape.privacidade}</LinkDoRodape>
            <PreferenciasDeCookies
              rotulo={t.rodape.cookies}
              className="cursor-pointer text-[13px] font-medium text-dark-text-2 transition hover:text-dark-text"
            />
          </nav>
          <p className="text-[12.5px] text-dark-muted">© 2026 Reps Club</p>
        </div>
      </footer>

      <AvisoDeCookies textos={t.cookies} />
    </div>
  );
}

/** Login e app só existem em português: o destino não muda com o idioma. */
const ENTRAR: Record<Perfil, string> = { personal: "/entrar", aluno: "/acesso" };

/**
 * A chamada do herói e do fechamento: o e-mail e "Entrar na lista", nas duas
 * versões (pedidos do Otávio, 02/10). O "Quero começar" e o "Entrar em
 * contato" do protótipo abriam um formulário inteiro, e a lista pede só o que
 * é preciso para avisar. A lista guarda de qual versão o e-mail veio.
 */
function Chamada({
  perfil,
  textos,
}: {
  perfil: Perfil;
  textos: TextosDaLanding["lista"];
}) {
  return <EntrarNaLista perfil={perfil} textos={textos} />;
}

/**
 * "Para Personais" e "Para Alunos". Links, e não botões: cada um é um
 * endereço que se cola numa conversa. `aria-current` diz qual está aberta.
 */
function SeletorDePerfil({
  perfil,
  idioma,
  rotulos,
}: {
  perfil: Perfil;
  idioma: Idioma;
  rotulos: TextosDaLanding["perfis"];
}) {
  const opcoes: { valor: Perfil; rotulo: string; href: string }[] = [
    { valor: "personal", rotulo: rotulos.personal, href: enderecoDaLanding("personal", idioma) },
    { valor: "aluno", rotulo: rotulos.aluno, href: enderecoDaLanding("aluno", idioma) },
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

/**
 * PT, EN e ES ao lado do botão de entrar (pedido do Otávio, 05/10). Links,
 * pelo mesmo motivo do seletor de perfil: o idioma é parte do endereço. Cada
 * sigla leva o nome do idioma escrito nele mesmo ("English", "Español"), que é
 * como quem não lê português reconhece a própria língua.
 */
function SeletorDeIdioma({
  perfil,
  idioma,
  rotulo,
}: {
  perfil: Perfil;
  idioma: Idioma;
  rotulo: string;
}) {
  return (
    <nav
      aria-label={rotulo}
      className="flex items-center rounded-full border border-dark-border bg-dark-surface p-1"
    >
      {IDIOMAS.map((i) => (
        <Link
          key={i.valor}
          href={enderecoDaLanding(perfil, i.valor)}
          scroll={false}
          hrefLang={i.lang}
          lang={i.lang}
          aria-label={i.nome}
          title={i.nome}
          aria-current={idioma === i.valor ? "page" : undefined}
          className={cn(
            "flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-[11.5px] font-bold tracking-[0.02em] transition",
            idioma === i.valor
              ? "bg-surface text-ink"
              : "text-dark-text-2 hover:text-dark-text",
          )}
        >
          {i.sigla}
        </Link>
      ))}
    </nav>
  );
}

function NavegadorDoPainel({ alt }: { alt: string }) {
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
          alt={alt}
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
function CelularesDoAluno({
  capturas,
}: {
  capturas: TextosDaLanding["capturas"];
}) {
  return (
    <div className="relative z-[1] flex items-end justify-center px-4 pt-12 sm:px-6 sm:pt-14">
      <Celular
        imagem={capturaAppExecucao}
        alt={capturas.execucao}
        className="-mr-6 w-[250px] flex-[0_1_250px] translate-y-[46px] -rotate-[8deg] sm:mr-0"
      />
      <Celular
        imagem={capturaAppHome}
        alt={capturas.home}
        className="z-[2] w-[300px] flex-[0_1_300px] -translate-y-[14px]"
        frente
      />
      <Celular
        imagem={capturaAppProgresso}
        alt={capturas.progresso}
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
