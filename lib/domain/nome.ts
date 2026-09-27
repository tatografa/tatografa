/**
 * Regras de exibição de nome de pessoa.
 *
 * Módulo neutro: o avatar do feed é montado no servidor, o card do personal no
 * app do aluno também, e o dia em que um componente cliente precisar das mesmas
 * iniciais ele importa daqui sem esbarrar em `server-only` — foi o que quebrou
 * o build quando `PERIODOS` morava em `lib/queries/social.ts`.
 */

/**
 * Iniciais do nome, no máximo duas.
 *
 * Uma regra só porque o avatar do feed, o do detalhe do post e o do card do
 * personal mostram a mesma pessoa: duas cópias divergiriam na primeira pessoa
 * com nome composto, e o mesmo rosto apareceria com letras diferentes em telas
 * vizinhas.
 */
export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/**
 * O primeiro nome, para frases ("Carla já vê a prescrição"). Eram cinco cópias
 * idênticas em cinco telas até 27/09 — a mesma história das iniciais, que o
 * comentário acima já contava.
 */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
