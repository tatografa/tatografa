"use client";

import { createContext, useContext, useMemo } from "react";

import type { Idioma } from "@/lib/domain/idioma";
import { formatos, type Formatos } from "@/lib/i18n/formatos";
import type { TextosDoPainel } from "@/lib/i18n/painel";

type IdiomaDoPainel = { idioma: Idioma; t: TextosDoPainel; f: Formatos };

const Contexto = createContext<IdiomaDoPainel | null>(null);

/**
 * Leva o idioma do painel aos componentes cliente — o par de
 * `ProvedorDoIdioma` do app do aluno. O layout manda só o dicionário do
 * idioma escolhido; componente de servidor recebe o texto por prop.
 */
export function ProvedorDoPainel({
  idioma,
  textos,
  children,
}: {
  idioma: Idioma;
  textos: TextosDoPainel;
  children: React.ReactNode;
}) {
  const valor = useMemo(() => ({ idioma, t: textos, f: formatos(idioma) }), [idioma, textos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** O idioma do painel. Fora do provedor é erro de quem montou a tela. */
export function usePainel(): IdiomaDoPainel {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("usePainel fora do ProvedorDoPainel (layout do painel).");
  return valor;
}
