import type { Idioma } from "@/lib/domain/idioma";

import { VERSAO_DOS_DOCUMENTOS, type Documento } from "./documentos";
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

/**
 * O que o portão de re-aceite do **app do aluno** diz em inglês e espanhol.
 *
 * Mesma regra dos documentos: é tradução de referência do texto de
 * `O_QUE_MUDOU.aluno` e `O_QUE_NAO_MUDA.aluno`, e o aceite grava a versão em
 * português. **Quem sobe a versão escreve as três frases** — sem a tradução
 * nova, o portão cairia no português, que é melhor que mostrar a frase da
 * versão anterior como se fosse desta.
 */
export const O_QUE_MUDOU_TRADUZIDO: Record<
  Idioma,
  { versao: string; oQueMudou: string; oQueNaoMuda: string } | null
> = {
  pt: null,
  en: {
    versao: "2026-09-18",
    oQueMudou:
      "Your profile got four optional fields: phone, city, a weight goal and whether you use any hormone therapy. All four start blank and stay blank if you don't want to fill them in — nothing in the app stops working. Hormone therapy information is health data: it belongs to you and your trainer only, you're the one who writes it, and you can go back to “not provided” whenever you want. The privacy policy explains each one.",
    oQueNaoMuda:
      "Your workout, your history and your records stay exactly as they were. To keep using the app, confirm that you've read the new text.",
  },
  es: {
    versao: "2026-09-18",
    oQueMudou:
      "Tu perfil tiene cuatro campos opcionales nuevos: teléfono, ciudad, una meta de peso y si usas alguna terapia hormonal. Los cuatro empiezan en blanco y siguen en blanco si no quieres completarlos — nada en la app deja de funcionar. La información sobre terapia hormonal es un dato de salud: es solo tuya y de tu entrenador, quien la escribe eres tú, y puedes volver a “no informado” cuando quieras. La política de privacidad explica cada uno.",
    oQueNaoMuda:
      "Tu entrenamiento, tu historial y tus récords siguen exactamente como estaban. Para seguir usando la app, confirma que leíste el texto nuevo.",
  },
};

/** A tradução do portão, se for da versão vigente; senão, nulo (cai no português). */
export function oQueMudouNoIdioma(idioma: Idioma) {
  const traducao = O_QUE_MUDOU_TRADUZIDO[idioma];
  return traducao && traducao.versao === VERSAO_DOS_DOCUMENTOS ? traducao : null;
}
