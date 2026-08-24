import Link from "next/link";

import { Logo } from "@/components/logo";

/**
 * Moldura das telas de autenticação do personal.
 *
 * Duas colunas no desktop, como no protótipo `Fluxo do Personal - Login`:
 * painel escuro da marca à esquerda, formulário à direita. No celular o painel
 * escuro vira só um cabeçalho — o personal usa desktop, mas a tela não pode
 * quebrar se ele abrir no celular.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-surface lg:grid-cols-2 lg:grid-rows-1">
      <aside className="flex flex-col justify-between gap-10 bg-dark-bg px-7 py-6 text-dark-text lg:px-[46px] lg:py-10">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>

        <div className="hidden max-w-[400px] lg:block">
          <p className="eyebrow mb-3.5 text-brand">Área do personal trainer</p>
          <h1 className="mb-4 text-[32px] font-extrabold leading-[1.2] tracking-[-0.02em]">
            Seus alunos, seus treinos, um só painel.
          </h1>
          <p className="text-[14.5px] font-medium leading-[1.6] text-ink-5">
            Monte os treinos, acompanhe as execuções e veja a evolução de cada
            aluno série por série.
          </p>
        </div>

        <p className="hidden text-[12px] font-medium text-ink-4 lg:block">
          Reps Club
        </p>
      </aside>

      <main className="flex items-center justify-center px-7 py-12 lg:px-10">
        <div className="w-full max-w-[372px]">{children}</div>
      </main>
    </div>
  );
}
