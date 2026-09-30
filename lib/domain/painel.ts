/**
 * O nome do cookie que guarda a barra lateral recolhida. Mora em módulo neutro
 * porque dois lados o leem: o layout do painel (servidor, para já desenhar a
 * barra do jeito certo) e a própria barra (cliente, para gravar ao alternar).
 * Duas cópias do nome seriam o jeito de uma gravar onde a outra não lê.
 */
export const COOKIE_DA_BARRA_RECOLHIDA = "reps_painel_barra_recolhida";
