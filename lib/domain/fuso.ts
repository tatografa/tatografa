/**
 * O fuso do produto, num lugar só.
 *
 * O público é brasileiro e o servidor roda em UTC. Qualquer conta que envolva
 * "que dia é hoje" feita no fuso do processo erra três horas para o lado que
 * mais dói: às 21h de um dia no Brasil o servidor já virou o dia seguinte, e é
 * à noite que se treina. Foi assim que o histórico rotulava a sessão de ontem
 * como de hoje (M1-06) e que a semana do macrotreino adiantava um dia.
 */
export const FUSO = "America/Sao_Paulo";

/**
 * O dia de uma data no fuso do produto, no formato "2026-09-02".
 *
 * Aceita `Date` ou texto do banco. Uma coluna `date` (`mesocycles.started_at`)
 * chega como "2026-09-01" e já **é** um dia de calendário: convertê-la por fuso
 * a empurraria para o dia anterior, porque `new Date("2026-09-01")` é
 * meia-noite UTC, que em São Paulo ainda é 31 de agosto.
 */
export function diaLocal(data: Date | string): string {
  if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data)) return data;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(data));
}

/**
 * O mesmo dia, como número, para subtrair um do outro.
 *
 * Usa `Date.UTC` de propósito: os dois lados da subtração passam por aqui, e o
 * que importa é a distância em dias entre dois dias de calendário — sem
 * horário, sem horário de verão, sem o fuso da máquina.
 */
export function diaLocalEmMs(data: Date | string): number {
  const [ano, mes, dia] = diaLocal(data).split("-").map(Number);
  return Date.UTC(ano, mes - 1, dia);
}
