"use client";

import { usePathname } from "next/navigation";

import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";

/**
 * O texto do painel escuro das telas de entrada. A moldura é uma só para as
 * telas do personal e para `/acesso`, que é a porta do aluno — e o aluno que
 * abria o login no computador lia "Área do personal trainer" (pedido do
 * Otávio, 02/10).
 *
 * Pelo endereço, e não por prop: o layout do Next não sabe qual página está
 * dentro dele. É o único pedaço cliente da moldura, e só troca palavras.
 * `/entrar` e `/recuperar` servem os dois papéis e ficam com o texto do
 * personal, que é quem mais chega por elas. O texto vem no idioma da tela.
 */
export function ChamadaDaMoldura({
  textos: porPerfil,
}: {
  textos: TextosDaAutenticacao["moldura"];
}) {
  const textos = porPerfil[usePathname() === "/acesso" ? "aluno" : "personal"];

  return (
    <div className="hidden max-w-[400px] lg:block">
      <p className="eyebrow mb-3.5 text-brand-on-dark">{textos.selo}</p>
      <p className="mb-4 text-[32px] font-extrabold leading-[1.2] tracking-[-0.02em]">
        {textos.titulo}
      </p>
      <p className="text-[14.5px] font-medium leading-[1.6] text-dark-muted">
        {textos.apoio}
      </p>
    </div>
  );
}
