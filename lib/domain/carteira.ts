/**
 * O que a tela de alunos (`/painel/alunos`, doc 06 §3) calcula sobre a lista
 * que recebeu: busca e filtro por status.
 *
 * Função pura, sem banco e sem React. Filtrar em memória em vez de por consulta
 * é decisão de tela: a carteira inteira já veio para montar a tabela, e um
 * `ilike` por tecla digitada faria uma ida ao banco a cada letra para reduzir
 * uma lista que cabe na página. Quando a carteira passar do teto de uma página
 * é que isso vira filtro do servidor.
 */

import { normalizarParaBusca } from "./texto";

/** Os valores que o seletor de status oferece. `todos` não é status do banco. */
export type FiltroDeStatus = "todos" | "ativo" | "inativo" | "convidado";

export const FILTROS_DE_STATUS: { valor: FiltroDeStatus; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativo", rotulo: "Ativos" },
  { valor: "inativo", rotulo: "Inativos" },
  { valor: "convidado", rotulo: "Convidados" },
];

/** O aluno na medida do que o filtro precisa ler. */
export type AlunoFiltravel = {
  name: string;
  /** `students.email` é obrigatório no banco: aluno nasce de um convite. */
  email: string;
  status: "convidado" | "ativo" | "inativo";
};

/**
 * A carteira reduzida ao que o personal está procurando.
 *
 * A busca casa **nome e e-mail** porque são as duas coisas que ele sabe de cor
 * do aluno, e casa por trecho, não por começo: ele lembra do sobrenome mais
 * vezes do que do primeiro nome.
 *
 * Preserva a ordem recebida — quem ordena é a consulta. Reordenar aqui por
 * relevância faria a lista saltar a cada tecla.
 */
export function filtrarAlunos<T extends AlunoFiltravel>(
  alunos: T[],
  { busca, status }: { busca: string; status: FiltroDeStatus },
): T[] {
  const termo = normalizarParaBusca(busca);

  return alunos.filter((aluno) => {
    if (status !== "todos" && aluno.status !== status) return false;
    if (!termo) return true;
    const alvo = normalizarParaBusca(`${aluno.name} ${aluno.email}`);
    return alvo.includes(termo);
  });
}
