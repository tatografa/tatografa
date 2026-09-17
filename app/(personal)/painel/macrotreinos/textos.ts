/**
 * As frases das confirmações de macrotreino.
 *
 * Módulo neutro, sem `"use client"` nem `server-only`, de propósito: o diálogo
 * que as mostra é cliente, e a rota de conferência que as prova é servidor. Um
 * módulo marcado como cliente não pode ter suas funções *chamadas* pelo
 * servidor — só renderizadas como componente —, e um texto aprovado palavra por
 * palavra não deve existir em duas cópias para contornar isso.
 */

/**
 * A confirmação de arquivamento.
 *
 * Diz a consequência inteira, não "tem certeza?": arquivar tira o treino do app
 * na hora, e a pessoa fica **sem treino** até o personal montar outro. A tela do
 * personal não muda em nada depois do clique — quem sente está do outro lado —,
 * então a frase precisa dizer isso antes.
 *
 * Sem pronome de terceira pessoa: o cadastro não guarda gênero, e o nome é
 * interpolado. "Carla … somem da tela dele" saía errado para metade da carteira.
 */
export function textoDeArquivamento(aluno: string): string {
  return (
    `${primeiroNome(aluno)} fica sem treino até você montar outro. ` +
    "Os treinos deste programa somem do app agora — mas nada é apagado: " +
    "prescrição e histórico continuam salvos, e dá para reativar o programa depois."
  );
}

/** A confirmação de troca: ativar um programa arquiva o que está no lugar. */
export function textoDeAtivacao(aluno: string, nome: string, ativoAtual: string): string {
  return (
    `“${ativoAtual}” vai para o arquivo e ${primeiroNome(aluno)} passa a ver os ` +
    `treinos de “${nome}”. Nada é apagado — o histórico dos dois programas ` +
    "continua salvo."
  );
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/**
 * O texto do diálogo de duplicação.
 *
 * Diz **a consequência**, como o de arquivamento: a cópia nasce arquivada, e
 * quem não souber disso sai daqui achando que o aluno já tem treino. A frase
 * muda com o tamanho da carteira porque "para outro aluno" não faz sentido para
 * quem só tem um — e uma frase que fala de uma opção que não existe faz o
 * personal procurar o que não está lá.
 */
export function textoDeDuplicacao(quantosAlunos: number): string {
  const destino =
    quantosAlunos > 1
      ? "Escolha para quem: o mesmo aluno ou outro da sua carteira."
      : "A cópia fica com o mesmo aluno.";

  return `${destino} Os treinos e a prescrição vêm junto; o histórico de execução, não. A cópia nasce arquivada — ative ela na lista para o aluno passar a ver.`;
}
