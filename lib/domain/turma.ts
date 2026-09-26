/**
 * Quem está na turma do personal, e o que dizer a quem saiu.
 *
 * Módulo neutro: a regra é lida pela página do feed (servidor), pelo compositor
 * (cliente) e pelo texto do estado vazio. Uma segunda cópia de "está na turma?"
 * divergiria da do banco no primeiro ajuste — e aqui divergir significa uma tela
 * oferecendo publicar para um grupo que o RLS vai recusar.
 *
 * **A verdade mora no banco** (`private.minha_turma()`, migration 0035). Isto
 * aqui é a mesma regra escrita do lado da tela, para ela não oferecer o que
 * seria recusado: mandar para ser recusado é um erro na cara do aluno por algo
 * que nunca deveria ter sido oferecido.
 */

import type { Enums } from "@/types/database";

/**
 * O aluno ainda faz parte da turma?
 *
 * Só `ativo`. `convidado` é quem nunca abriu o app — e o resto do produto já
 * trata `ativo` como "é meu aluno": o dashboard conta só eles, o alerta de
 * inatividade pula os outros, a carteira os separa em abas.
 */
export function estaNaTurma(status: Enums<"student_status">): boolean {
  return status === "ativo";
}

/**
 * O que a tela diz a quem foi arquivado.
 *
 * Duas frases e não uma: o feed vazio precisa explicar **por que** está vazio,
 * e o compositor precisa explicar **por que** a opção sumiu. A mesma frase nos
 * dois lugares soaria como aviso repetido em vez de resposta à pergunta que
 * cada tela levanta.
 *
 * Nenhuma das duas diz "você foi arquivado" nem "inativo": são palavras do
 * painel do personal, não do aluno, e nenhuma delas explica o que aconteceu.
 * O que ele precisa saber é que a conversa continua com quem treina ele.
 */
export const FORA_DA_TURMA = {
  feed: (personal: string) =>
    `Você não está mais na turma de ${personal}, então os treinos que os outros alunos compartilham não aparecem aqui. Seu histórico e seus recordes continuam seus, e o que você já publicou continua no lugar.`,
  compositor: (personal: string) =>
    `Você não está mais na turma, então este treino vai só para ${personal}.`,
  /*
   * A aba privada continua funcionando para quem saiu da turma — mas o texto
   * dela prometia "a não ser que você escolha mostrar para a turma", e essa
   * escolha deixou de existir. Achado olhando o screenshot dos quatro vazios
   * lado a lado, não relendo o código: a frase que eu fui corrigir era a da
   * aba pública, e a errada estava na de baixo.
   */
  abaDoPersonal: (personal: string) =>
    `Ao terminar um treino você pode registrar uma foto. Ela fica visível só para ${personal}.`,
} as const;
