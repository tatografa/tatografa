"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useActionState, useId } from "react";

import { entrarNaLista } from "@/app/(marketing)/actions";
import type { EstadoDaLista, PerfilDaLista } from "@/lib/domain/lista-de-espera";
import type { TextosDaLanding } from "@/lib/landing/textos";

const INICIAL: EstadoDaLista = {};

/**
 * O campo de e-mail com "Entrar na lista" ao lado (pedido do Otávio, 02/10),
 * nas duas versões da landing — no lugar do "Quero começar" do personal e do
 * "Entrar em contato" do aluno. Mora no herói e no fechamento, os dois escuros.
 * O perfil vai junto, num campo escondido: é a página em que a pessoa está. O
 * texto vem do idioma da página; a ação devolve só o código do erro.
 *
 * Campo e botão numa pílula só, como a busca de um site: a frase "entrar na
 * lista" pede uma coisa, e dois controles soltos pareceriam duas.
 */
export function EntrarNaLista({
  perfil,
  textos,
}: {
  perfil: PerfilDaLista;
  textos: TextosDaLanding["lista"];
}) {
  const [estado, acao, enviando] = useActionState(entrarNaLista, INICIAL);
  const id = useId();

  if (estado.email) {
    return (
      <p
        role="status"
        className="mx-auto inline-flex max-w-[460px] items-center gap-2.5 rounded-full border border-dark-border-2 bg-dark-surface px-5 py-3 text-left text-[14px] text-dark-text-2"
      >
        <Check size={17} aria-hidden className="shrink-0 text-dark-text" />
        <span>
          {textos.sucessoAntes}{" "}
          <strong className="font-semibold break-all text-dark-text">{estado.email}</strong>
          {textos.sucessoDepois}
        </span>
      </p>
    );
  }

  return (
    <form action={acao} noValidate className="mx-auto w-full max-w-[460px]">
      <input type="hidden" name="perfil" value={perfil} />
      {/* Armadilha para robô: fora da tela, do teclado e do leitor de tela. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site
          <input type="text" name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-center gap-1.5 rounded-full border border-dark-border-2 bg-dark-surface p-1.5 transition focus-within:border-dark-muted">
        <label htmlFor={`${id}-email`} className="sr-only">
          {textos.rotulo}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={textos.rotulo}
          defaultValue={estado.digitado}
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? `${id}-erro` : `${id}-apoio`}
          className="min-w-0 flex-1 bg-transparent px-4 text-[14.5px] text-dark-text outline-none placeholder:text-dark-muted"
        />
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-[14px] font-bold text-white shadow-cta transition hover:bg-brand-hover disabled:opacity-70 sm:px-7"
        >
          {enviando ? textos.enviando : textos.botao}
        </button>
      </div>

      {estado.erro ? (
        <p id={`${id}-erro`} role="alert" className="mt-2.5 text-[13px] font-semibold text-brand-on-dark">
          {textos.erros[estado.erro]}
        </p>
      ) : (
        <p id={`${id}-apoio`} className="mt-2.5 text-[12px] text-dark-muted">
          {textos.apoio}{" "}
          <Link href="/privacidade#contato-pelo-site" className="underline hover:text-dark-text-2">
            {textos.privacidade}
          </Link>
        </p>
      )}
    </form>
  );
}
