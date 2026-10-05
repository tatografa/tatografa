import type { Idioma } from "@/lib/domain/idioma";
import { COMUM } from "@/lib/i18n/app/comum";

import { COMUM_DO_PAINEL } from "./comum";
import { DASHBOARD } from "./dashboard";
import { ROTULOS } from "./rotulos";

/**
 * Todo o texto do painel do personal, nos três idiomas (etapa 3 da tradução).
 *
 * Mesmo desenho do app do aluno (`lib/i18n/app`): um arquivo por área, as
 * três línguas de cada frase lado a lado, e o que o personal escreveu — nome
 * de treino, observação, nome de exercício próprio — fica como foi escrito.
 */
function textos(idioma: Idioma) {
  return {
    comum: COMUM_DO_PAINEL[idioma],
    rotulos: ROTULOS[idioma],
    dashboard: DASHBOARD[idioma],
    /** O portão de re-aceite é o mesmo componente do app; o texto também. */
    portao: COMUM[idioma].portao,
  };
}

export type TextosDoPainel = ReturnType<typeof textos>;

export const TEXTOS_DO_PAINEL: Record<Idioma, TextosDoPainel> = {
  pt: textos("pt"),
  en: textos("en"),
  es: textos("es"),
};
