/**
 * Regras do histórico de treinos. Funções puras, sem banco e sem React.
 *
 * Tudo o que vira número na tela do aluno mora aqui para poder ser conferido
 * sem subir o app. O volume **não** está neste arquivo de propósito:
 * `volumeDaSessao` já existe em `lib/domain/treino.ts` e é a mesma conta que a
 * tela de conclusão usa — duas implementações dariam dois números.
 */

import { FUSO, diaLocal } from "./fuso";

/*
 * O fuso e o `diaLocal` vivem em `./fuso` porque não são só do histórico: a
 * semana do macrotreino (`semanaAtual`, em `./treino`) errava o dia pelo mesmo
 * motivo. Aqui a data é o rótulo que identifica cada linha da lista — formatar
 * com o fuso do servidor mostraria "3 de setembro" num treino feito às 21h do
 * dia 2, e formatar só no cliente deixaria a lista sem rótulo até hidratar.
 */

/** Uma série registrada, do jeito que `session_sets` guarda. */
export type SerieDoHistorico = {
  set_number: number;
  load_kg: number | null;
  reps: number | null;
  skipped: boolean;
};

/**
 * O que aconteceu com uma série da prescrição:
 * - `feita`: o aluno registrou carga/reps;
 * - `pulada`: registrada com `skipped`, valores nulos;
 * - `ausente`: prescrita e sem registro nenhum — o aluno parou antes.
 *
 * Os três são estados diferentes na tela. Série pulada mostrada como série
 * feita com campos vazios (ou como ausente) mentiria sobre o treino.
 */
export type EstadoDaSerie = "feita" | "pulada" | "ausente";

export type LinhaDeSerie = SerieDoHistorico & { estado: EstadoDaSerie };

/** Agrupa as séries de uma sessão por linha da prescrição. */
export function agruparPorExercicio<
  T extends { workout_exercise_id: string },
>(series: T[]): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const serie of series) {
    const lista = mapa.get(serie.workout_exercise_id) ?? [];
    lista.push(serie);
    mapa.set(serie.workout_exercise_id, lista);
  }
  return mapa;
}

/**
 * As linhas que a tela de detalhe desenha para um exercício.
 *
 * `set_number` é a **posição prescrita**, não um contador: a série 3 é a
 * terceira mesmo que a 2 tenha sido pulada. Por isso as linhas saem de
 * `1..sets` e não da ordem em que os registros chegaram.
 *
 * Um `set_number` acima do prescrito continua aparecendo, no fim: o personal
 * pode ter encurtado a prescrição depois do treino, e sumir com uma série que
 * o aluno fez seria apagar histórico na leitura.
 */
export function linhasDeSeries(
  setsPrescritos: number,
  registradas: SerieDoHistorico[],
): LinhaDeSerie[] {
  const porNumero = new Map(registradas.map((s) => [s.set_number, s]));
  const numeros = new Set<number>(porNumero.keys());
  for (let numero = 1; numero <= setsPrescritos; numero += 1) numeros.add(numero);

  return [...numeros]
    .sort((a, b) => a - b)
    .map((numero) => {
      const registro = porNumero.get(numero);
      if (!registro) {
        return {
          set_number: numero,
          load_kg: null,
          reps: null,
          skipped: false,
          estado: "ausente" as const,
        };
      }
      return { ...registro, estado: registro.skipped ? "pulada" : "feita" };
    });
}

/** Séries efetivamente realizadas. Pulada não conta — abandonar não é fazer. */
export function contarFeitas(series: SerieDoHistorico[]): number {
  return series.filter((serie) => !serie.skipped).length;
}

/** Treino de 48 minutos vira "48min"; de 1h05, "1h05". Nulo vira "—". */
export function duracaoCurta(segundos: number | null): string {
  if (segundos === null) return "—";
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos}min`;
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, "0")}`;
}

/** 12500 vira "12.500"; 1237,5 vira "1.237,5". */
export function formatarNumero(valor: number): string {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/**
 * Carga de uma série realizada.
 *
 * Exercício de peso corporal grava carga nula: mostrar "0 kg" diria que o
 * aluno não levantou nada, quando ele levantou o próprio corpo. O sinalizador
 * do exercício entra junto porque a carga nula é a consequência, não a causa.
 */
export function cargaDaSerie(
  loadKg: number | null,
  pesoCorporal = false,
): string {
  if (pesoCorporal || loadKg === null) return "Peso corporal";
  return `${formatarNumero(loadKg)} kg`;
}

/**
 * Rótulo do dia da sessão: "Hoje", "Ontem" ou "seg, 2 de set".
 *
 * `agora` é parâmetro para a função continuar pura — e para o teste não
 * depender do relógio da máquina.
 */
export function rotuloDoDia(iso: string, agora: Date = new Date()): string {
  const dia = diaLocal(iso);
  const hoje = diaLocal(agora.toISOString());
  if (dia === hoje) return "Hoje";

  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  if (dia === diaLocal(ontem.toISOString())) return "Ontem";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date(iso))
    .replace(/\.$/, "")
    .replace(/\.,/, ",");
}

/** Data por extenso do detalhe: "segunda-feira, 2 de setembro de 2026". */
export function dataPorExtenso(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Horário no fuso do produto: "18h20". */
export function horaDaSessao(iso: string): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return partes.replace(":", "h");
}
