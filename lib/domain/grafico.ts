/**
 * A escala vertical dos gráficos de barras: cinco marcas redondas, de zero até
 * um teto que cobre o maior valor.
 *
 * **Sempre do zero.** Barra que nasce acima do zero mente sobre o tamanho: a de
 * 60 kg ficaria com o dobro da de 55 kg. O número exato vai escrito em cima de
 * cada barra, então a diferença pequena continua legível sem cortar o eixo.
 *
 * O passo é o "número redondo" seguinte a um quarto do máximo (1, 2, 2,5, 5 ou
 * 10 vezes uma potência de dez) — 54 alunos dão marcas de 20 em 20 até 80, e
 * 62,5 kg de 20 em 20 também. `inteiro` é para contagem: aluno e treino não têm
 * meio, então "2,5 treinos" no eixo não pode aparecer.
 */
export type MarcaDoEixo = {
  valor: number;
  /** Altura da marca, de 0 a 1, medida a partir da base. */
  fracao: number;
};

export type EscalaDoGrafico = {
  teto: number;
  marcas: MarcaDoEixo[];
};

const MARCAS = 4;

export function escalaDoGrafico(maximo: number, inteiro = false): EscalaDoGrafico {
  // Sem valor nenhum, a escala ainda precisa existir: as marcas vão de 0 a 4
  // (ou de 0 a 1), e as barras ficam todas no chão, que é a leitura certa.
  const alvo = (maximo > 0 ? Math.max(maximo, inteiro ? MARCAS : 0) : inteiro ? MARCAS : 1) / MARCAS;
  let passo = numeroRedondo(alvo);
  if (inteiro) passo = Math.max(1, Math.ceil(passo));
  const teto = passo * MARCAS;
  const marcas = Array.from({ length: MARCAS + 1 }, (_, i) => {
    const valor = arredondar(passo * i);
    return { valor, fracao: valor / teto };
  });
  return { teto, marcas };
}

/** Quanto da altura do gráfico uma barra ocupa, de 0 a 1. */
export function fracaoDa(valor: number, teto: number): number {
  if (teto <= 0) return 0;
  return Math.min(1, Math.max(0, valor / teto));
}

/**
 * Quais rótulos do eixo horizontal aparecem: no máximo `quantos`, sempre o
 * primeiro e o último — são as pontas que dão sentido à série —, e o resto em
 * passo regular entre eles. Rótulo demais vira borrão numa tela de 390px.
 */
export function rotulosVisiveis(total: number, quantos: number): Set<number> {
  const visiveis = new Set<number>();
  if (total <= 0) return visiveis;
  if (total <= quantos) {
    for (let i = 0; i < total; i++) visiveis.add(i);
    return visiveis;
  }
  const passo = Math.ceil((total - 1) / (quantos - 1));
  for (let i = 0; i < total; i += passo) visiveis.add(i);
  visiveis.add(total - 1);
  // O penúltimo rótulo colado no último encavala os dois: sai o do meio.
  const ordenados = [...visiveis].sort((a, b) => a - b);
  const penultimo = ordenados[ordenados.length - 2];
  if (ordenados.length > 2 && total - 1 - penultimo <= passo / 2) visiveis.delete(penultimo);
  return visiveis;
}

function numeroRedondo(x: number): number {
  const potencia = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / potencia;
  const redondo = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return redondo * potencia;
}

function arredondar(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}
