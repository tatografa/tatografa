import { formatarNumero } from "./historico";

/**
 * Regras do feed que a tela e o servidor dividem. Sem banco e sem React.
 *
 * `LIMITE_DA_LEGENDA` mora aqui, e não no arquivo de Server Actions, por uma
 * razão do Next e uma do projeto. A do Next: módulo `"use server"` só pode
 * exportar função assíncrona, e uma constante no meio **zera as exportações do
 * arquivo inteiro** — o erro não aponta para a constante, aponta para as ações
 * que sumiram. A do projeto: é a mesma regra dos dois lados (o `maxLength` do
 * campo e o `max` do zod), e duas cópias divergem na primeira vez que uma
 * mudar.
 *
 * O número é o mesmo da constraint de `posts.caption` e `post_comments.body`
 * (migration 0018). O banco é quem decide de verdade; isto existe para a
 * mensagem sair em português antes de a requisição partir.
 */
export const LIMITE_DA_LEGENDA = 500;

/**
 * Os recortes de período da tela Social do personal (doc 06).
 *
 * Mora aqui, e não em `lib/queries/social.ts`, porque o rótulo é **texto de
 * tela**: a lista de links do cabeçalho o renderiza, e um componente cliente
 * que importe do módulo de consulta arrasta o `server-only` junto — o build
 * quebra com "'server-only' cannot be imported from a Client Component".
 * Mesma regra do `LIMITE_DA_LEGENDA` acima.
 */
export type PeriodoDoSocial = "7" | "30" | "90" | "tudo";

/**
 * Na ordem do protótipo (27/09), com "Todo o período" primeiro e como padrão: o
 * feed do painel é leitura de conversa, e abrir num recorte de 30 dias
 * escondia justamente o post antigo que ficou sem resposta.
 */
export const PERIODOS: { valor: PeriodoDoSocial; rotulo: string }[] = [
  { valor: "tudo", rotulo: "Todo o período" },
  { valor: "7", rotulo: "Últimos 7 dias" },
  { valor: "30", rotulo: "Últimos 30 dias" },
  { valor: "90", rotulo: "Últimos 90 dias" },
];

/** `?periodo=` é texto editável: valor desconhecido cai no padrão. */
export function periodoDaUrl(bruto: string | string[] | undefined): PeriodoDoSocial {
  return PERIODOS.find((p) => p.valor === bruto)?.valor ?? "tudo";
}

export type SerieDoPost = { load_kg: number | null; reps: number | null; skipped: boolean };

/**
 * A linha de um exercício no resumo do treino que acompanha o post: "4x8 ·
 * 62 kg", como no protótipo.
 *
 * As repetições são as **da série mais pesada**, e não uma média: "4x8 · 62 kg"
 * se lê como "fez 8 com 62", e só a série mais pesada garante que o par
 * aconteceu de verdade. É o mesmo critério do recorde (decisão de 02/09).
 * Sem carga (peso corporal), vale a série com mais repetições. Tudo pulado
 * diz "pulado", e não some — o personal precisa ver que o aluno abandonou.
 */
export function resumoDoExercicioNoPost(
  series: SerieDoPost[],
  /** O número e a palavra "pulado" no idioma do painel; português por padrão. */
  f: { numero: (valor: number) => string; pulado: string } = {
    numero: formatarNumero,
    pulado: "pulado",
  },
): string {
  const feitas = series.filter((s) => !s.skipped && s.reps !== null);
  if (!feitas.length) return f.pulado;

  const comCarga = feitas.filter((s) => s.load_kg !== null && s.load_kg > 0);
  if (comCarga.length) {
    const topo = comCarga.reduce((a, b) => ((b.load_kg ?? 0) > (a.load_kg ?? 0) ? b : a));
    return `${feitas.length}x${topo.reps} · ${f.numero(topo.load_kg as number)} kg`;
  }
  const maisReps = feitas.reduce((a, b) => ((b.reps ?? 0) > (a.reps ?? 0) ? b : a));
  return `${feitas.length}x${maisReps.reps}`;
}
