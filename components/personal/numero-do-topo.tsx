import Link from "next/link";

/**
 * Um ladrilho da fileira de números do topo, no desenho do protótipo: fundo
 * preenchido e sem borda, o nome em cima, o número grande no meio e uma frase
 * curta embaixo.
 *
 * Um componente para as três telas que têm a fileira (painel, alunos, agenda):
 * eram três cópias da mesma meia dúzia de classes, e a terceira já tinha
 * ganhado um selo que as outras duas não sabiam desenhar.
 *
 * **Sem a pílula de variação ("+12%") que o protótipo põe no canto.** Ela
 * compara com o mês anterior, e nenhuma destas telas guarda o valor do mês
 * anterior — mostrá-la sem essa conta seria número inventado no lugar mais
 * visível da tela.
 */
export function NumeroDoTopo({
  titulo,
  valor,
  apoio,
  destaque = false,
  selo,
  href,
  aoClicar,
  ativo = false,
}: {
  titulo: string;
  valor: string;
  apoio: string;
  /** Pinta o número de `brand` quando há o que fazer com ele. */
  destaque?: boolean;
  /** Uma pílula âmbar depois do apoio: "Marque quem veio". */
  selo?: string;
  /** Só o número que é fila de trabalho vira link, e só quando não é zero. */
  href?: string;
  /**
   * Em vez de link, um botão que liga um filtro desta mesma tela. Só em tela
   * cliente — função não atravessa a fronteira do servidor.
   */
  aoClicar?: () => void;
  /** O filtro que o botão liga está ligado. */
  ativo?: boolean;
}) {
  const classes = [
    "block min-w-0 rounded-[12px] bg-canvas p-4 transition",
    href || aoClicar ? "hover:bg-canvas-sunken" : "",
    aoClicar ? "w-full text-left" : "",
    ativo ? "ring-[1.5px] ring-ink ring-inset" : "",
  ].join(" ");

  // `span` e não `p`: o mesmo conteúdo vai dentro de `<button>`, que só aceita
  // conteúdo de frase.
  const conteudo = (
    <>
      <span className="block text-[13px] text-ink-4">{titulo}</span>
      <span
        className={`mt-0.5 block text-[26px] leading-tight font-bold tracking-[-0.02em] tabular-nums ${
          destaque ? "text-brand" : "text-ink"
        }`}
      >
        {valor}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-4">
        {apoio}
        {selo ? (
          <span className="rounded-full bg-warning-bg px-2 py-px text-[11.5px] font-semibold text-warning">
            {selo}
          </span>
        ) : null}
      </span>
    </>
  );

  if (aoClicar)
    return (
      <button type="button" onClick={aoClicar} aria-pressed={ativo} className={classes}>
        {conteudo}
      </button>
    );
  if (href)
    return (
      <Link href={href} className={classes}>
        {conteudo}
      </Link>
    );
  return <div className={classes}>{conteudo}</div>;
}
