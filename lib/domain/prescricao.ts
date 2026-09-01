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

/**
 * Texto sem acento e em minúsculas, para comparar nome de exercício.
 *
 * O personal digita "triceps" e espera achar "Tríceps testa". Comparar sem
 * normalizar transformaria o acento num filtro invisível.
 */
export function normalizarParaBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
