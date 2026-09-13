import Link from "next/link";

import { Logo } from "@/components/logo";
import { RodapeLegal } from "@/components/rodape-legal";
import { VERSAO_DOS_DOCUMENTOS, type Documento } from "@/lib/legal/documentos";

/**
 * A moldura dos termos e da política. As duas páginas são a mesma tela com
 * conteúdo diferente — o texto mora em `lib/legal/`, como dado.
 *
 * Públicas de propósito: quem está decidindo se aceita ainda não tem conta, e
 * quem quer reler depois não deveria precisar entrar para isso.
 */
export function PaginaDeDocumento({ documento }: { documento: Documento }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-ink">
            <Logo size={24} />
          </Link>
          <Link
            href={documento.slug === "termos" ? "/privacidade" : "/termos"}
            className="text-[13px] font-semibold text-brand transition hover:text-brand-hover"
          >
            {documento.slug === "termos"
              ? "Política de privacidade"
              : "Termos de uso"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-10">
        <p className="eyebrow text-ink-4">
          Versão de {dataPorExtenso(VERSAO_DOS_DOCUMENTOS)}
        </p>
        <h1 className="mt-3 text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          {documento.titulo}
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-3">
          {documento.resumo}
        </p>

        <div className="mt-9 space-y-8">
          {documento.secoes.map((secao) => (
            <section key={secao.titulo}>
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

        <RodapeLegal className="mt-12 border-t border-border pt-6" />
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

function dataPorExtenso(iso: string): string {
  // Data de calendário, sem hora: `new Date("2026-09-13")` seria UTC e viraria
  // o dia 12 à noite no Brasil. Montar por partes evita a conversão.
  const [ano, mes, dia] = iso.split("-").map(Number);
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  return `${dia} de ${meses[mes - 1]} de ${ano}`;
}
