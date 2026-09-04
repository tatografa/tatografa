/**
 * Referência histórica e recordes pessoais. Funções puras, sem banco e sem
 * React — a mesma regra vale para as duas telas que consomem isto: a pílula
 * "última vez" na execução e o destaque de recorde na conclusão.
 *
 * **A identidade do exercício é uma chave opaca aqui.** Quem monta a chave é a
 * camada de dados (`chaveDoExercicio`, em `lib/queries/exercicios.ts`), porque
 * ela conhece o par `(exercise_source, exercise_id)` que `workout_exercises`
 * guarda. Este arquivo só agrupa por ela. Agrupar por `workout_exercise_id`
 * seria o erro fácil e daria a resposta errada: o mesmo supino tem uma linha
 * de prescrição por treino e por programa, e "a última vez que fiz supino" não
 * é "a última vez que fiz supino nesta linha".
 */

import { formatarNumero } from "./historico";

/** Uma série já registrada, com a sessão a que pertence. */
export type SerieComparavel = {
  /** Identidade do exercício, montada pela camada de dados. */
  chave: string;
  sessaoId: string;
  /** `workout_sessions.finished_at`. É o que ordena "a última vez". */
  concluidaEm: string;
  /** Posição prescrita, não contador (handoff `execucao.md`, item 1). */
  set_number: number;
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

/** Uma série da sessão de referência. */
export type SerieDeReferencia = { carga: number | null; reps: number | null };

/**
 * O que sobrou da última vez que o aluno fez este exercício.
 *
 * `carga`/`reps` são a **série mais pesada** daquela sessão: é o número que a
 * pílula mostra, porque é o que resume o dia numa linha só.
 *
 * `porSerie` é a sessão inteira, série por série: é o que abre o stepper no
 * peso certo. Os dois convivem porque respondem a perguntas diferentes —
 * "como foi da última vez?" e "com quanto eu começo esta série?" — e quem
 * rampa (50, 60, 60, 65) precisa da segunda.
 *
 * A chave de `porSerie` é o `set_number` **em texto**: o objeto atravessa a
 * fronteira servidor→cliente como JSON, onde chave numérica vira string de
 * qualquer jeito. Melhor o tipo dizer a verdade.
 */
export type UltimaVez = {
  carga: number | null;
  reps: number | null;
  /** ISO do fim da sessão de onde a referência veio. */
  concluidaEm: string;
  porSerie: Record<string, SerieDeReferencia>;
};

/**
 * Série pulada não conta para nada: nem referência, nem recorde. Ela existe no
 * banco com carga e reps nulos (handoff `execucao.md`, item 2), e tratá-la como
 * registro faria a pílula mostrar um treino que o aluno não fez.
 */
function contaComoFeita(serie: SerieComparavel): boolean {
  if (serie.skipped) return false;
  return serie.load_kg !== null || serie.reps !== null;
}

/**
 * Qual das duas séries é a "melhor" da sessão: a mais pesada, e no empate a de
 * mais repetições.
 *
 * Carga nula (peso corporal) perde de qualquer carga registrada — `-1` porque
 * o banco não aceita carga negativa, então nenhum valor real empata com ele.
 * Num exercício de peso corporal todas as cargas são nulas e o critério cai
 * inteiro nas repetições, que é o que a tela mostra nesse caso.
 */
function maisForte(candidata: SerieComparavel, atual: SerieComparavel): boolean {
  const cargaA = candidata.load_kg ?? -1;
  const cargaB = atual.load_kg ?? -1;
  if (cargaA !== cargaB) return cargaA > cargaB;
  return (candidata.reps ?? 0) > (atual.reps ?? 0);
}

/**
 * A referência de cada exercício: a série mais pesada da **última sessão
 * concluída** em que ele apareceu.
 *
 * Duas passadas de propósito. Pegar o máximo global daria "o melhor que já
 * fiz", que é outra coisa — e é justamente o recorde, calculado abaixo. O que
 * o aluno quer saber entre uma série e outra é com quanto ele saiu da última
 * vez, mesmo que aquele dia tenha sido pior que o recorde.
 *
 * Exercício sem nenhuma série feita não entra no mapa: a tela não desenha
 * pílula nenhuma em vez de mostrar "0 kg" ou "—", que seriam informação falsa
 * sobre um treino que nunca aconteceu.
 */
export function ultimaVezPorExercicio(
  series: SerieComparavel[],
): Map<string, UltimaVez> {
  const feitas = series.filter(contaComoFeita);

  // 1. Qual foi a última sessão de cada exercício. O desempate por id é só
  //    para o resultado não depender da ordem em que as linhas chegaram.
  const sessaoPorChave = new Map<string, { id: string; em: number }>();
  for (const serie of feitas) {
    const em = Date.parse(serie.concluidaEm);
    if (Number.isNaN(em)) continue;
    const atual = sessaoPorChave.get(serie.chave);
    if (!atual || em > atual.em || (em === atual.em && serie.sessaoId > atual.id)) {
      sessaoPorChave.set(serie.chave, { id: serie.sessaoId, em });
    }
  }

  // 2. Dentro dela, a série mais pesada — e a sessão inteira, série por série.
  const melhor = new Map<string, SerieComparavel>();
  const melhorDaSerie = new Map<string, SerieComparavel>();
  const referencia = new Map<string, UltimaVez>();

  for (const serie of feitas) {
    const sessao = sessaoPorChave.get(serie.chave);
    if (!sessao || serie.sessaoId !== sessao.id) continue;

    const registro = referencia.get(serie.chave) ?? {
      carga: null,
      reps: null,
      concluidaEm: serie.concluidaEm,
      porSerie: {},
    };

    // O exercício pode aparecer duas vezes no mesmo treino: são duas linhas de
    // prescrição com a mesma identidade, e as duas têm série 1. Fica a mais
    // pesada, pelo mesmo critério da pílula.
    const numero = String(serie.set_number);
    const daSerie = melhorDaSerie.get(`${serie.chave}#${numero}`);
    if (!daSerie || maisForte(serie, daSerie)) {
      melhorDaSerie.set(`${serie.chave}#${numero}`, serie);
      registro.porSerie[numero] = { carga: serie.load_kg, reps: serie.reps };
    }

    const atual = melhor.get(serie.chave);
    if (!atual || maisForte(serie, atual)) {
      melhor.set(serie.chave, serie);
      registro.carga = serie.load_kg;
      registro.reps = serie.reps;
    }

    referencia.set(serie.chave, registro);
  }

  return referencia;
}

/**
 * Uma carga só conta para recorde se foi levantada de verdade.
 *
 * Carga nula é peso corporal — recorde de repetições está fora do escopo deste
 * card, e comparar reps com quilos não faz sentido. Carga zero é o stepper
 * deixado onde abriu: transformá-la em marca anterior faria a sessão seguinte
 * anunciar "recorde: 0 kg → 20 kg", que é ruído, não conquista.
 */
function cargaDeRecorde(serie: {
  load_kg: number | null;
  skipped: boolean;
}): number | null {
  if (serie.skipped) return null;
  if (serie.load_kg === null || serie.load_kg <= 0) return null;
  return serie.load_kg;
}

/**
 * A maior carga já levantada em cada exercício.
 *
 * **Decisão do PM, e ela contraria o doc 03**, que define recorde como "maior
 * carga com pelo menos as reps alvo". Aqui é a maior carga, ponto, porque é o
 * que o aluno entende como recorde sem precisar de explicação. O limite aceito
 * está registrado no `CLAUDE.md`: premia quem tira repetição para pôr peso.
 * Mudar isso é mudar esta função — e só ela.
 */
export function recordePorExercicio(
  series: SerieComparavel[],
): Map<string, number> {
  const recordes = new Map<string, number>();
  for (const serie of series) {
    const carga = cargaDeRecorde(serie);
    if (carga === null) continue;
    const atual = recordes.get(serie.chave);
    if (atual === undefined || carga > atual) recordes.set(serie.chave, carga);
  }
  return recordes;
}

/** Uma série da sessão que acabou, já com a identidade do exercício resolvida. */
export type SerieRecemFeita = {
  chave: string;
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

export type RecordeBatido = {
  chave: string;
  /** A marca que existia antes desta sessão. */
  anterior: number;
  nova: number;
  /** Repetições da série que bateu o recorde. */
  reps: number | null;
};

/**
 * Os recordes que a sessão que acabou de fechar quebrou.
 *
 * `recordeAnterior` tem que vir **sem** as séries desta sessão, senão a própria
 * marca nova vira o teto a superar e nenhum recorde jamais aparece.
 *
 * A ordem da resposta é a ordem em que as séries chegaram: quem chama monta a
 * lista na ordem da prescrição, e o destaque sai na ordem do treino.
 */
export function recordesDaSessao(
  series: SerieRecemFeita[],
  recordeAnterior: Map<string, number>,
): RecordeBatido[] {
  const melhorAgora = new Map<string, { carga: number; reps: number | null }>();
  for (const serie of series) {
    const carga = cargaDeRecorde(serie);
    if (carga === null) continue;
    const atual = melhorAgora.get(serie.chave);
    if (!atual || carga > atual.carga) {
      melhorAgora.set(serie.chave, { carga, reps: serie.reps });
    }
  }

  const batidos: RecordeBatido[] = [];
  for (const [chave, agora] of melhorAgora) {
    const anterior = recordeAnterior.get(chave);
    // Estreia não é recorde: sem marca anterior não há o que superar, e o doc
    // 05 é explícito — "não invente celebração vazia".
    if (anterior === undefined) continue;
    // Empatar o próprio peso também não é recorde.
    if (agora.carga <= anterior) continue;
    batidos.push({ chave, anterior, nova: agora.carga, reps: agora.reps });
  }

  return batidos;
}

/**
 * O texto da pílula: "60 kg × 10", ou "12 reps" no exercício de peso corporal.
 *
 * Devolve `null` quando não há nada honesto a dizer — a tela não desenha a
 * pílula em vez de desenhar uma vazia.
 */
export function textoDaUltimaVez(ultima: UltimaVez): string | null {
  if (ultima.carga === null) {
    return ultima.reps === null ? null : `${ultima.reps} reps`;
  }
  const carga = `${formatarNumero(ultima.carga)} kg`;
  return ultima.reps === null ? carga : `${carga} × ${ultima.reps}`;
}

/** "60 kg → 65 kg", com o separador de milhar e a vírgula do pt-BR. */
export function textoDoRecorde(recorde: RecordeBatido): string {
  return `${formatarNumero(recorde.anterior)} kg → ${formatarNumero(recorde.nova)} kg`;
}
