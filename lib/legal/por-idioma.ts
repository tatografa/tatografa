import type { Idioma } from "@/lib/domain/idioma";

import type { Documento } from "./documentos";
import { PRIVACIDADE_EN, TERMOS_EN } from "./en";
import { PRIVACIDADE_ES, TERMOS_ES } from "./es";
import { PRIVACIDADE } from "./privacidade";
import { TERMOS } from "./termos";

/**
 * Os dois documentos em cada idioma, e o texto da moldura em volta deles.
 *
 * **O português é o que vale** (decisão do Otávio, 05/10): inglês e espanhol
 * são tradução de referência, e a página diz isso no topo, antes da primeira
 * seção. É o português que o aceite grava — a versão em `term_acceptances` é a
 * data do texto em português, e uma tradução não tem versão própria.
 */
export const DOCUMENTOS: Record<Idioma, Record<Documento["slug"], Documento>> = {
  pt: { termos: TERMOS, privacidade: PRIVACIDADE },
  en: { termos: TERMOS_EN, privacidade: PRIVACIDADE_EN },
  es: { termos: TERMOS_ES, privacidade: PRIVACIDADE_ES },
};

export type MolduraDoDocumento = {
  idioma: string;
  /** "Versão de {data}". */
  versao: string;
  /** O outro documento, no link do cabeçalho. */
  outro: Record<Documento["slug"], string>;
  /** Só existe na tradução: o aviso de que o português é o que vale. */
  referencia?: { texto: string; link: string };
};

export const MOLDURA_DO_DOCUMENTO: Record<Idioma, MolduraDoDocumento> = {
  pt: {
    idioma: "Idioma",
    versao: "Versão de {data}",
    outro: { termos: "Política de privacidade", privacidade: "Termos de uso" },
  },
  en: {
    idioma: "Language",
    versao: "Version of {data}",
    outro: { termos: "Privacy policy", privacidade: "Terms of use" },
    referencia: {
      texto:
        "This translation is provided for reference only. The legally binding version is the Portuguese one, and it prevails in case of any difference.",
      link: "Read in Portuguese",
    },
  },
  es: {
    idioma: "Idioma",
    versao: "Versión del {data}",
    outro: { termos: "Política de privacidad", privacidade: "Términos de uso" },
    referencia: {
      texto:
        "Esta traducción es solo de referencia. La versión con validez jurídica es la que está en portugués, y prevalece ante cualquier diferencia.",
      link: "Leer en portugués",
    },
  },
};
