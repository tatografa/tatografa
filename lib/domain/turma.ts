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

// O que a tela diz a quem saiu da turma mora no dicionário do app
// (`lib/i18n/app/feed.ts`, `foraDaTurma`), nos três idiomas.
