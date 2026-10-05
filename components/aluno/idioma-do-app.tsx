"use client";

import { createContext, useContext, useMemo } from "react";

import type { Idioma } from "@/lib/domain/idioma";
import type { TextosDoApp } from "@/lib/i18n/app";
import { formatos, type Formatos } from "@/lib/i18n/formatos";

type IdiomaDoApp = { idioma: Idioma; t: TextosDoApp; f: Formatos };

const Contexto = createContext<IdiomaDoApp | null>(null);

/**
 * Leva o idioma do app aos componentes cliente (etapa 2 da tradução).
 *
 * O layout do aluno manda **só o dicionário do idioma escolhido**, como dado:
 * importar os três aqui poria as três línguas no JavaScript de quem abre o app
 * na academia, com a internet que houver. Componente de servidor não lê
 * contexto — esses recebem o texto por prop, da página.
 */
export function ProvedorDoIdioma({
  idioma,
  textos,
  children,
}: {
  idioma: Idioma;
  textos: TextosDoApp;
  children: React.ReactNode;
}) {
  const valor = useMemo(() => ({ idioma, t: textos, f: formatos(idioma) }), [idioma, textos]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** O idioma do app. Fora do provedor é erro de quem montou a tela. */
export function useIdioma(): IdiomaDoApp {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useIdioma fora do ProvedorDoIdioma (layout do aluno).");
  return valor;
}
