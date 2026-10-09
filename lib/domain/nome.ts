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

/**
 * A confirmação de excluir aluno: o personal digita o primeiro nome. Sem
 * diferença de maiúscula nem de acento — a trava é contra o clique por engano
 * no aluno errado, não um teste de ortografia, e "Otavio" para "Otávio" já
 * prova que se leu o nome. Neutra porque a tela acende o botão com ela e a
 * ação confere de novo.
 */
export function confereNome(digitado: string, nome: string): boolean {
  const simples = (s: string) =>
    s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("pt-BR");
  const alvo = simples(primeiroNome(nome));
  return alvo.length > 0 && simples(digitado) === alvo;
}
