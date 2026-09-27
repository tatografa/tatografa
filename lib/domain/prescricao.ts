/**
 * Regras da prescrição. Funções puras, sem banco e sem React.
 *
 * O que mora aqui é o que o editor do personal e a tela do aluno precisam
 * concordar: o formato das repetições e a ordem dos exercícios.
 */

/** Limites que valem no editor e na Server Action — um lugar só. */
export const LIMITES = {
  seriesMin: 1,
  seriesMax: 20,
  descansoMin: 0,
  descansoMax: 600,
  repeticoesMin: 1,
  repeticoesMax: 100,
  rirMin: 0,
  rirMax: 10,
} as const;

/**
 * Repetições aceitas: um número ("12") ou uma faixa ("8-10").
 *
 * O banco guarda texto porque faixa é comum na prescrição; converter para
 * número perderia a faixa. Sem esta validação entraria "oito a dez" na coluna,
 * e a tela de execução do aluno não teria o que mostrar no contador.
 */
export function repeticoesValidas(bruto: string): boolean {
  return normalizarRepeticoes(bruto) !== null;
}

/**
 * Devolve a forma canônica ("8 - 10" vira "8-10") ou `null` se o texto não é
 * uma prescrição de repetições válida.
 */
export function normalizarRepeticoes(bruto: string): string | null {
  const texto = bruto.trim().replace(/\s*[-–—]\s*/g, "-");
  if (texto === "") return null;

  const unico = /^(\d{1,3})$/.exec(texto);
  if (unico) {
    const valor = Number(unico[1]);
    return dentroDaFaixa(valor) ? String(valor) : null;
  }

  const faixa = /^(\d{1,3})-(\d{1,3})$/.exec(texto);
  if (faixa) {
    const de = Number(faixa[1]);
    const ate = Number(faixa[2]);
    if (!dentroDaFaixa(de) || !dentroDaFaixa(ate)) return null;
    // "8-8" é uma faixa de um valor só: vale, e vira "8". Recusar seria
    // implicância com quem digitou o mesmo número duas vezes.
    if (de === ate) return String(de);
    // "10-8" é faixa invertida; o personal quase certamente digitou errado, e
    // deixar passar viraria um intervalo vazio na tela do aluno.
    if (de > ate) return null;
    return `${de}-${ate}`;
  }

  return null;
}

/**
 * RIR alvo ("repetições em reserva"): um número ("2") ou uma faixa ("0-2"),
 * de 0 a 10. Devolve a forma canônica ou `null` se não é um RIR válido.
 *
 * Mesmo formato das repetições, e pelo mesmo motivo: "0-2" é prescrição. A
 * diferença é o zero — ele é o RIR mais comum que existe (a série até a
 * falha), enquanto zero repetição não é prescrição de nada. O banco confere o
 * formato de novo (`workout_exercises_rir_target_formato`, migration 0037).
 */
export function normalizarRir(bruto: string): string | null {
  const texto = bruto.trim().replace(/\s*[-–—]\s*/g, "-");
  if (texto === "") return null;

  const noLimite = (valor: number) =>
    Number.isInteger(valor) && valor >= LIMITES.rirMin && valor <= LIMITES.rirMax;

  const unico = /^(\d{1,2})$/.exec(texto);
  if (unico) {
    const valor = Number(unico[1]);
    return noLimite(valor) ? String(valor) : null;
  }

  const faixa = /^(\d{1,2})-(\d{1,2})$/.exec(texto);
  if (faixa) {
    const de = Number(faixa[1]);
    const ate = Number(faixa[2]);
    if (!noLimite(de) || !noLimite(ate) || de > ate) return null;
    return de === ate ? String(de) : `${de}-${ate}`;
  }

  return null;
}

/**
 * O RIR em palavras de academia, para quem executa. A sigla sozinha é jargão
 * de quem prescreve: o aluno entende "pare com 2 sobrando" sem nunca ter lido
 * o que RIR quer dizer. Zero é a falha, e ganha o nome dela.
 */
export function rirEmPalavras(rir: string): string {
  if (rir === "0") return "Vá até a falha";
  if (rir === "1") return "Pare com 1 repetição sobrando";
  if (rir.startsWith("0-")) return `Vá até a falha ou pare com até ${rir.slice(2)} sobrando`;
  return `Pare com ${rir.replace("-", " a ")} repetições sobrando`;
}

/**
 * Quantas repetições uma prescrição vale numa soma: o próprio número, ou o
 * meio da faixa ("8-12" vale 10). É o que o "total de reps" da divisão de
 * treino soma — o piso subestimaria toda faixa, e o teto contaria como feito
 * o que é limite. Texto inválido vale zero: a soma não deve quebrar por um
 * campo que o personal ainda está digitando.
 */
export function repeticoesDaSoma(reps: string): number {
  const canonico = normalizarRepeticoes(reps);
  if (!canonico) return 0;
  const [de, ate = de] = canonico.split("-").map(Number);
  return (de + ate) / 2;
}

function dentroDaFaixa(valor: number): boolean {
  return (
    Number.isInteger(valor) &&
    valor >= LIMITES.repeticoesMin &&
    valor <= LIMITES.repeticoesMax
  );
}

/**
 * Move um item de índice, devolvendo uma lista nova. Fora dos limites,
 * devolve a lista como estava — o botão de subir do primeiro item não some,
 * só não faz nada.
 */
export function mover<T>(itens: T[], de: number, para: number): T[] {
  if (de === para || de < 0 || para < 0 || de >= itens.length || para >= itens.length) {
    return itens;
  }
  const copia = [...itens];
  const [item] = copia.splice(de, 1);
  copia.splice(para, 0, item);
  return copia;
}
