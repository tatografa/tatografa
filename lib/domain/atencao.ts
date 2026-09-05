/**
 * O que o painel do personal calcula sobre a carteira: quem parou de treinar,
 * quantos treinos saíram na semana e qual a aderência.
 *
 * Funções puras, sem banco e sem React. Nada aqui é coluna: o doc 03 é
 * explícito, e um número desses gravado envelhece em silêncio — o aluno para de
 * treinar e a coluna continua dizendo que está tudo bem.
 */

import { diaLocal, diaLocalEmMs, diaSomandoDias } from "./fuso";
import type { JanelaDeDias } from "./rotacao";

const UM_DIA = 24 * 60 * 60 * 1000;

/** O padrão do produto, espelhando o `default` da coluna (migration 0014). */
export const DIAS_PARA_ALERTA_PADRAO = 7;

/** Os limites que o formulário e o `check` do banco aplicam. */
export const LIMITES_DO_ALERTA = { minimo: 1, maximo: 90 } as const;

/**
 * A semana **de calendário** (segunda a domingo) no fuso do produto.
 *
 * Diferente de `janelaDaSemana` (em `./rotacao`), que conta a partir do
 * `started_at` do programa — e é isso mesmo. A janela do programa é individual:
 * a semana 2 da Carla começa numa quarta e a do João num sábado, então ela não
 * agrega. O painel soma a carteira inteira, e para isso só existe uma semana
 * que todo mundo compartilha: a do calendário.
 *
 * Segunda como início porque é o que "esta semana" significa para quem monta
 * treino, e é o que o doc 06 desenha.
 */
export function semanaDoCalendario(
  quando: Date | string = new Date(),
): JanelaDeDias {
  const hoje = diaLocal(quando);
  // `getUTCDay` sobre o dia montado em UTC: `diaLocalEmMs` já traduziu para o
  // fuso do produto, então aqui não há mais fuso nenhum para atrapalhar.
  const diaDaSemana = new Date(diaLocalEmMs(hoje)).getUTCDay();
  // Domingo é 0 no JavaScript e é o **fim** da semana aqui, não o começo.
  const desdeSegunda = diaDaSemana === 0 ? 6 : diaDaSemana - 1;
  const de = diaSomandoDias(hoje, -desdeSegunda);
  return { de, ate: diaSomandoDias(de, 7) };
}

/**
 * Há quantos dias o aluno não conclui um treino.
 *
 * Conta em **dias de calendário no fuso do produto**, não em horas: quem
 * treinou ontem às 22h e abre o painel hoje às 8h está há 1 dia sem treinar, não
 * há 0. Contar por instante daria "0 dias" para um intervalo de dez horas e
 * "1 dia" para um de vinte e cinco, e o personal lê isso como se fosse o mesmo
 * calendário que ele usa.
 *
 * Devolve `null` para quem nunca treinou — que não é "há 0 dias" nem um número
 * grande qualquer, é outra coisa, e a tela diz outra coisa.
 */
export function diasSemTreinar(
  ultimaSessao: string | null,
  quando: Date | string = new Date(),
): number | null {
  if (!ultimaSessao) return null;
  const dias = Math.floor(
    (diaLocalEmMs(quando) - diaLocalEmMs(ultimaSessao)) / UM_DIA,
  );
  // Data futura (relógio do aparelho adiantado, fixture torta) vira 0, não
  // negativo: "há -2 dias" não existe.
  return Math.max(0, dias);
}

/** O aluno na medida do que o alerta precisa saber. */
export type AlunoNoAlerta = {
  id: string;
  /** `finished_at` da última sessão concluída, ou nulo. */
  ultima_sessao: string | null;
  /** Quando o aluno aceitou o convite. Nulo = ainda não entrou. */
  onboarded_at: string | null;
  status: "convidado" | "ativo" | "inativo";
};

export type MotivoDoAlerta = "parou" | "nunca-treinou";

export type Alerta = {
  id: string;
  motivo: MotivoDoAlerta;
  /**
   * Dias sem treinar (motivo `parou`) ou dias desde que entrou (motivo
   * `nunca-treinou`). É o mesmo tipo de número, e a tela conjuga a frase.
   */
  dias: number;
};

/**
 * Quem precisa de atenção, do mais parado para o menos.
 *
 * Duas portas de entrada, e elas não são a mesma coisa:
 *
 * - **parou**: treinava e passou de `diasParaAlerta` sem concluir sessão;
 * - **nunca-treinou**: aceitou o convite e não fez um treino sequer. Aqui o
 *   limiar conta desde `onboarded_at`, senão o aluno que entrou hoje já
 *   apareceria como problema no mesmo dia.
 *
 * Quem ainda não aceitou o convite fica de fora: ele é um convite pendente, que
 * a página já mostra em outro bloco. E aluno `inativo` também — o personal já
 * sabe, foi ele quem marcou.
 */
export function alunosQuePrecisamDeAtencao(
  alunos: AlunoNoAlerta[],
  diasParaAlerta: number,
  quando: Date | string = new Date(),
): Alerta[] {
  const alertas: Alerta[] = [];

  for (const aluno of alunos) {
    if (aluno.status !== "ativo") continue;
    if (!aluno.onboarded_at) continue;

    const semTreinar = diasSemTreinar(aluno.ultima_sessao, quando);

    if (semTreinar === null) {
      const desdeQueEntrou = diasSemTreinar(aluno.onboarded_at, quando) ?? 0;
      if (desdeQueEntrou > diasParaAlerta) {
        alertas.push({
          id: aluno.id,
          motivo: "nunca-treinou",
          dias: desdeQueEntrou,
        });
      }
      continue;
    }

    if (semTreinar > diasParaAlerta) {
      alertas.push({ id: aluno.id, motivo: "parou", dias: semTreinar });
    }
  }

  // Mais parado primeiro: é a ordem em que o personal quer resolver. O id
  // desempata para a lista não mudar de ordem a cada carregamento.
  return alertas.sort((a, b) => b.dias - a.dias || a.id.localeCompare(b.id));
}

/**
 * Aderência de um aluno na semana: sessões concluídas ÷ treinos prescritos.
 *
 * Passa de 1 quando o aluno treina mais que o prescrito, e isso fica: cortar em
 * 100% esconderia justamente o aluno que está indo além. Quem tem programa sem
 * treino nenhum devolve `null` — dividir por zero não é 0%, é "não dá para
 * dizer", e uma média que engole isso como zero puniria o personal por um
 * programa que ele ainda está montando.
 */
export function aderenciaDoAluno(
  sessoesNaSemana: number,
  treinosPrescritos: number,
): number | null {
  if (treinosPrescritos <= 0) return null;
  return sessoesNaSemana / treinosPrescritos;
}

/**
 * A média da carteira, ignorando quem não tem aderência calculável.
 *
 * `null` quando ninguém tem: a tela mostra "—", não "0%". Zero por cento diz
 * que a carteira inteira faltou; "—" diz que não há o que medir ainda.
 */
export function aderenciaMedia(valores: (number | null)[]): number | null {
  const validos = valores.filter((v): v is number => v !== null);
  if (!validos.length) return null;
  return validos.reduce((total, v) => total + v, 0) / validos.length;
}

/** "86%" — a aderência como a tela mostra. Nulo vira "—". */
export function comoPorcentagem(valor: number | null): string {
  if (valor === null) return "—";
  return `${Math.round(valor * 100)}%`;
}

/** "há 9 dias", "ontem", "hoje" — o texto da linha de alerta. */
export function haQuantosDias(dias: number): string {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}
