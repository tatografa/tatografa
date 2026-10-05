import "server-only";

import { cache } from "react";

import type { Idioma } from "@/lib/domain/idioma";
import { formatos } from "@/lib/i18n/formatos";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { TEXTOS_DO_PAINEL } from "./index";

/**
 * O idioma, o texto e os formatos do painel para esta requisição — o mesmo
 * cookie da landing e do app (`reps_idioma`), lido uma vez por requisição.
 *
 * Durante a tradução (05/10) uma trava aqui segurava o painel em português até
 * a última tela estar pronta: cada parte era publicada, e quem tinha o cookie
 * em inglês teria visto um painel metade em cada língua.
 */
export const textosDoPainel = cache(async () => {
  const idioma: Idioma = await idiomaAtual();
  return { idioma, t: TEXTOS_DO_PAINEL[idioma], f: formatos(idioma) };
});
