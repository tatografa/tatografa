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
 * Diz a consequência inteira, não "tem certeza?": arquivar tira o treino da
 * tela do aluno na hora, e ele fica **sem treino** até o personal montar outro.
 * A tela do personal não muda em nada depois do clique — quem sente é o aluno,
 * do outro lado —, então a frase precisa dizer isso antes.
 */
export function textoDeArquivamento(aluno: string): string {
  return (
    `${primeiroNome(aluno)} fica sem treino até você montar outro. ` +
    "Os treinos deste programa somem da tela dele agora — mas nada é apagado: " +
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
