import "server-only";

import { cache } from "react";

import { formatos } from "@/lib/i18n/formatos";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { TEXTOS_DO_APP } from "./index";

/**
 * O idioma, o texto e os formatos do app para esta requisição.
 *
 * `cache()` por requisição, como o `requireStudent()`: o layout, a página e a
 * Server Action leem o mesmo cookie, e ler uma vez basta. O idioma sai só do
 * cookie — o `?lang=` do seletor do perfil já foi gravado nele pelo `proxy.ts`,
 * inclusive na requisição em curso.
 */
export const textosDoApp = cache(async () => {
  const idioma = await idiomaAtual();
  return { idioma, t: TEXTOS_DO_APP[idioma], f: formatos(idioma) };
});
