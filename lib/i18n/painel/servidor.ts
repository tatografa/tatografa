import "server-only";

import { cache } from "react";

import type { Idioma } from "@/lib/domain/idioma";
import { formatos } from "@/lib/i18n/formatos";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { TEXTOS_DO_PAINEL } from "./index";

/**
 * O painel só sai do português quando estiver traduzido inteiro.
 *
 * A tradução foi feita por partes, e cada parte foi publicada — todo push vira
 * deploy. Com a trava desligada, quem tinha o cookie em inglês (escolhido na
 * landing) via um painel metade em cada língua; com ela, o painel fala
 * português até a última tela estar pronta, e só então a opção de idioma
 * aparece em Configurações (a regra da etapa 1: seletor só onde a área inteira
 * estiver traduzida).
 */
export const PAINEL_TRADUZIDO = false;

/** O idioma, o texto e os formatos do painel para esta requisição. */
export const textosDoPainel = cache(async () => {
  const idioma: Idioma = PAINEL_TRADUZIDO ? await idiomaAtual() : "pt";
  return { idioma, t: TEXTOS_DO_PAINEL[idioma], f: formatos(idioma) };
});
