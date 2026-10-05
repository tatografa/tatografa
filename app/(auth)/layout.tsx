import Link from "next/link";

import { Logo } from "@/components/logo";
import { RodapeLegal } from "@/components/rodape-legal";
import { SeletorDeIdioma } from "@/components/seletor-de-idioma";
import { langDe } from "@/lib/domain/idioma";
import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { ChamadaDaMoldura } from "./chamada-da-moldura";
import { VoltarAoInicio } from "./voltar-ao-inicio";

/**
 * Moldura das telas de entrada — as do personal e `/acesso`, a do aluno.
 *
 * Duas colunas no desktop, como no protótipo `Fluxo do Personal - Login`:
 * painel escuro da marca à esquerda, formulário à direita. No celular o painel
 * escuro vira só um cabeçalho — o personal usa desktop, mas a tela não pode
 * quebrar se ele abrir no celular.
 */
export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Pelo cookie: o layout não vê a URL, e o `proxy.ts` já pôs nele o `?lang=`
  // desta mesma requisição.
  const idioma = await idiomaAtual();
  const t = TEXTOS_DA_AUTENTICACAO[idioma];

  return (
    <div
      lang={langDe(idioma)}
      className="grid min-h-dvh grid-rows-[auto_1fr] bg-surface lg:grid-cols-2 lg:grid-rows-1"
    >
      <aside className="flex flex-col justify-between gap-10 bg-dark-bg px-7 py-6 text-dark-text lg:px-[46px] lg:py-10">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>

        <ChamadaDaMoldura textos={t.moldura} />

        <p className="hidden text-[12px] font-medium text-dark-muted lg:block">
          Reps Club
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center gap-8 px-7 py-12 lg:px-10">
        <div className="w-full max-w-[372px]">
          {/* Voltar e idioma na mesma linha, acima do formulário (05/10): são
              as duas saídas da tela, e nenhuma é o assunto dela. */}
          <div className="mb-8 flex min-h-10 items-center justify-between gap-3">
            <VoltarAoInicio rotulo={t.voltar} />
            <div className="ml-auto">
              <SeletorDeIdioma idioma={idioma} rotulo={t.idioma} />
            </div>
          </div>
          {children}
        </div>
        <RodapeLegal textos={t.rodapeLegal} />
      </main>
    </div>
  );
}
