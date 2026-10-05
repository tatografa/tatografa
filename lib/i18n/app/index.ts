import type { Idioma } from "@/lib/domain/idioma";

import { COMUM, type TextosComuns } from "./comum";
import { EXECUCAO, type TextosDaExecucao } from "./execucao";
import { FEED, type TextosDoFeed } from "./feed";
import { HISTORICO, type TextosDoHistorico } from "./historico";
import { PERFIL, type TextosDoPerfil } from "./perfil";
import { TREINOS, type TextosDosTreinos } from "./treinos";

/**
 * Todo o texto do app do aluno, nos três idiomas (etapa 2 da tradução, 05/10).
 *
 * Um arquivo por área, e não um só: quem mexe na execução abre a execução, e
 * as três línguas de cada frase ficam a um rolar de distância uma da outra —
 * é assim que uma frase muda em português e não fica velha em inglês.
 *
 * O que **não** se traduz, e não é esquecimento: o nome do treino, o nome dos
 * exercícios, a técnica e as observações. São o que o personal escreveu, na
 * língua dele, e o app não reescreve a prescrição de ninguém.
 */
export type TextosDoApp = {
  comum: TextosComuns;
  treinos: TextosDosTreinos;
  execucao: TextosDaExecucao;
  historico: TextosDoHistorico;
  feed: TextosDoFeed;
  perfil: TextosDoPerfil;
};

function textos(idioma: Idioma): TextosDoApp {
  return {
    comum: COMUM[idioma],
    treinos: TREINOS[idioma],
    execucao: EXECUCAO[idioma],
    historico: HISTORICO[idioma],
    feed: FEED[idioma],
    perfil: PERFIL[idioma],
  };
}

export const TEXTOS_DO_APP: Record<Idioma, TextosDoApp> = {
  pt: textos("pt"),
  en: textos("en"),
  es: textos("es"),
};
