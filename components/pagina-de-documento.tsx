import Link from "next/link";

import { Logo } from "@/components/logo";
import { RodapeLegal } from "@/components/rodape-legal";
import { SeletorDeIdioma } from "@/components/seletor-de-idioma";
import { langDe, type Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { VERSAO_DOS_DOCUMENTOS, type Documento } from "@/lib/legal/documentos";
import { DOCUMENTOS, MOLDURA_DO_DOCUMENTO } from "@/lib/legal/por-idioma";

/**
 * A moldura dos termos e da política. As duas páginas são a mesma tela com
 * conteúdo diferente — o texto mora em `lib/legal/`, como dado.
 *
 * Públicas de propósito: quem está decidindo se aceita ainda não tem conta, e
 * quem quer reler depois não deveria precisar entrar para isso.
 *
 * Em inglês e espanhol o aviso de que **o português é o que vale** vem antes
 * da primeira seção, e não no rodapé: quem lê uma tradução jurídica precisa
 * saber disso antes de ler, não depois.
 */
export function PaginaDeDocumento({
  slug,
  idioma,
}: {
  slug: Documento["slug"];
  idioma: Idioma;
}) {
  const documento = DOCUMENTOS[idioma][slug];
  const t = MOLDURA_DO_DOCUMENTO[idioma];
  const outro = slug === "termos" ? "privacidade" : "termos";

  return (
    <div lang={langDe(idioma)} className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4">
          <Link href="/" className="text-ink">
            <Logo size={24} />
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={`/${outro}`}
              className="text-[13px] font-semibold text-brand transition hover:text-brand-hover"
            >
              {t.outro[slug]}
            </Link>
            <SeletorDeIdioma idioma={idioma} rotulo={t.idioma} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-10">
        <p className="eyebrow text-ink-4">
          {t.versao.replace("{data}", dataPorExtenso(VERSAO_DOS_DOCUMENTOS, idioma))}
        </p>
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          {documento.titulo}
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-3">
          {documento.resumo}
        </p>

        {t.referencia && (
          <div
            role="note"
            className="mt-6 rounded-[12px] border border-border bg-surface px-4 py-3.5 text-[13.5px] leading-[1.55] text-ink-2"
          >
            {t.referencia.texto}{" "}
            {/* Recarga inteira, como no seletor: o `?lang=` troca o cookie no proxy. */}
            <a
              href={`/${slug}?lang=pt`}
              hrefLang="pt-BR"
              className="font-semibold text-brand underline-offset-2 transition hover:text-brand-hover hover:underline"
            >
              {t.referencia.link}
            </a>
          </div>
        )}

        <div className="mt-9 space-y-8">
          {documento.secoes.map((secao) => (
            <section key={secao.titulo} id={secao.ancora} className="scroll-mt-6">
              <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-ink">
                {secao.titulo}
              </h2>
              <div className="mt-2.5 space-y-2.5">
                {secao.paragrafos.map((paragrafo, i) => (
                  <p
                    key={i}
                    className="text-[14.5px] leading-[1.65] text-ink-2"
                  >
                    <ComDestaque texto={paragrafo} />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <RodapeLegal
          className="mt-12 border-t border-border pt-6"
          textos={TEXTOS_DA_AUTENTICACAO[idioma].rodapeLegal}
        />
      </main>
    </div>
  );
}

/**
 * Negrito por `**...**`.
 *
 * Não é markdown de verdade e não precisa ser: a fonte é um arquivo nosso, com
 * uma marcação só. Puxar um parser para isso seria trocar 12 linhas por uma
 * dependência — e `dangerouslySetInnerHTML` num texto jurídico é a última
 * coisa que se quer.
 */
function ComDestaque({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*)/g).map((pedaco, i) =>
        pedaco.startsWith("**") && pedaco.endsWith("**") ? (
          <strong key={i} className="font-bold text-ink">
            {pedaco.slice(2, -2)}
          </strong>
        ) : (
          pedaco
        ),
      )}
    </>
  );
}

function dataPorExtenso(iso: string, idioma: Idioma): string {
  // Data de calendário, sem hora: `new Date("2026-09-13")` é meia-noite UTC e
  // viraria o dia 12 à noite no Brasil. Formatar em UTC mantém o dia.
  return new Intl.DateTimeFormat(langDe(idioma), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
