"use client";

import { usePathname } from "next/navigation";

/**
 * O texto do painel escuro das telas de entrada. A moldura é uma só para as
 * telas do personal e para `/acesso`, que é a porta do aluno — e o aluno que
 * abria o login no computador lia "Área do personal trainer" (pedido do
 * Otávio, 02/10).
 *
 * Pelo endereço, e não por prop: o layout do Next não sabe qual página está
 * dentro dele. É o único pedaço cliente da moldura, e só troca palavras.
 * `/entrar` e `/recuperar` servem os dois papéis e ficam com o texto do
 * personal, que é quem mais chega por elas.
 */
const TEXTOS = {
  personal: {
    selo: "Área do personal trainer",
    titulo: "Seus alunos, seus treinos, um só painel.",
    apoio:
      "Monte os treinos, acompanhe as execuções e veja a evolução de cada aluno série por série.",
  },
  aluno: {
    selo: "Área do aluno",
    titulo: "Seu treino, sua evolução, no seu bolso.",
    apoio:
      "Veja o treino que seu personal montou, registre carga e repetições na academia e acompanhe sua evolução.",
  },
} as const;

export function ChamadaDaMoldura() {
  const textos = TEXTOS[usePathname() === "/acesso" ? "aluno" : "personal"];

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
