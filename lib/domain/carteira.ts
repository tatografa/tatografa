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

import { diaLocalEmMs } from "./fuso";
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

/** O que a tabela consegue ordenar, e por qual chave. */
export type CampoDeOrdem = "nome" | "ultima" | "aderencia";

export type Ordem = { campo: CampoDeOrdem; crescente: boolean };

/** O aluno na medida do que a ordenação precisa ler. */
export type AlunoOrdenavel = {
  name: string;
  /** Dias de calendário desde a última sessão. Nulo = nunca treinou. */
  dias_sem_treinar: number | null;
  /** 0 a 1. Nula = sem programa com treino para medir. */
  aderencia: number | null;
};

/**
 * A carteira ordenada por uma coluna.
 *
 * **O que não tem valor vai sempre para o fim, nas duas direções.** "Nunca
 * treinou" e "sem aderência" não são zero nem infinito: são a ausência do
 * número, e empurrá-los para o topo do crescente faria a tabela abrir com a
 * lista de quem não dá para avaliar — que é o oposto do que o personal
 * procura ao clicar na coluna.
 *
 * Ordena uma cópia: `Array.prototype.sort` altera no lugar, e a lista chega
 * aqui vinda direto das props do componente.
 */
export function ordenarAlunos<T extends AlunoOrdenavel>(
  alunos: T[],
  { campo, crescente }: Ordem,
): T[] {
  const sinal = crescente ? 1 : -1;

  return [...alunos].sort((a, b) => {
    if (campo === "nome") {
      // `localeCompare` com pt-BR: sem ele "Ângela" cai depois de "Zeca".
      return a.name.localeCompare(b.name, "pt-BR") * sinal;
    }

    const valorA = campo === "ultima" ? a.dias_sem_treinar : a.aderencia;
    const valorB = campo === "ultima" ? b.dias_sem_treinar : b.aderencia;

    if (valorA === null && valorB === null) return 0;
    if (valorA === null) return 1;
    if (valorB === null) return -1;
    return (valorA - valorB) * sinal;
  });
}

/** Os quatro números do topo de `/painel/alunos`. */
export type IndicadoresDaCarteira = {
  total: number;
  novosNoMes: number;
  ativos: number;
  /** Porcentagem de ativos sobre o total, 0 a 100. Nulo com carteira vazia. */
  fatiaDeAtivos: number | null;
  inativos: number;
  /** Quantos passaram do limiar de dias sem treinar que o personal configurou. */
  precisamDeAtencao: number;
};

/** Janela de "novos": um mês corrido, que é como o personal pensa em entrada. */
export const DIAS_DE_ENTRADA = 30;

/** O aluno na medida do que os indicadores precisam ler. */
export type AlunoContavel = {
  status: "convidado" | "ativo" | "inativo";
  created_at: string;
  dias_sem_treinar: number | null;
};

/**
 * Os quatro números do topo da carteira.
 *
 * **Nenhum deles é de cobrança.** O protótipo mostra "Renovações · vencendo nos
 * próximos 7 dias" e "de 40 vagas do plano"; não existe plano, preço nem
 * pagamento no modelo de dados, e um número inventado no topo da tela é pior
 * que uma tela com três indicadores. No lugar de renovações entra **quem
 * precisa de atenção** — que é a única das quatro que é fila de trabalho, e a
 * razão de ela ser a única que vira link.
 *
 * `hoje` é parâmetro para a conta rodar no fuso do produto e não no relógio do
 * aparelho. É a mesma razão de `dias_sem_treinar` ser calculado no servidor: a
 * tabela é componente cliente, e dois lugares contando dias de calendário com
 * fusos diferentes dariam números diferentes lado a lado.
 *
 * Quem nunca treinou **não** entra em "precisam de atenção": ele não parou, ele
 * não começou — e o alerta de inatividade sugere uma conversa que não é essa.
 * É a mesma separação que `diasSemTreinar` faz devolvendo nulo.
 */
export function indicadoresDaCarteira(
  alunos: AlunoContavel[],
  diasParaAlerta: number,
  hoje: Date | string,
): IndicadoresDaCarteira {
  const corte = diaLocalEmMs(hoje) - DIAS_DE_ENTRADA * 24 * 60 * 60 * 1000;
  const ativos = alunos.filter((a) => a.status === "ativo").length;

  return {
    total: alunos.length,
    novosNoMes: alunos.filter((a) => diaLocalEmMs(a.created_at) >= corte).length,
    ativos,
    fatiaDeAtivos: alunos.length ? Math.round((ativos / alunos.length) * 100) : null,
    inativos: alunos.filter((a) => a.status === "inativo").length,
    precisamDeAtencao: alunos.filter(
      (a) => a.dias_sem_treinar !== null && a.dias_sem_treinar >= diasParaAlerta,
    ).length,
  };
}
