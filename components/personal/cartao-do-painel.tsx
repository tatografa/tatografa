/**
 * O cartão dos blocos do dashboard, no desenho do protótipo: borda fina, canto
 * de 12px, um cabeçalho com selo de ícone, título e uma linha de apoio, e as
 * linhas separadas por um fio.
 *
 * É um componente só para os cinco blocos (alerta, convites, progressões,
 * treinos recentes e os dois gráficos) porque o que o protótipo mais tem é
 * **repetição**: a tela parece uma ferramenta quando todo bloco fala a mesma
 * língua, e cinco cópias do cabeçalho divergiriam na primeira revisão.
 *
 * `tom` muda só o selo do ícone. O alerta pede âmbar, e é o único: o resto
 * não é sinal de nada, é identidade.
 */
export function CartaoDoPainel({
  titulo,
  apoio,
  Icone,
  tom = "brand",
  lateral,
  children,
  className = "",
}: {
  titulo: string;
  apoio?: React.ReactNode;
  Icone?: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  tom?: "brand" | "warning";
  /** O que fica à direita do título: um número, um link. */
  lateral?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      // Sem `overflow-hidden`: a dica do gráfico sai por cima da borda nas barras
      // das pontas, e cortá-la ali esconderia justamente o primeiro e o último dia.
      className={`min-w-0 rounded-[12px] border border-border bg-surface ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border-soft px-[18px] pt-[18px] pb-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-[9px]">
            {Icone ? (
              <span
                aria-hidden
                className={`flex size-[30px] shrink-0 items-center justify-center rounded-[9px] ${
                  tom === "warning"
                    ? "bg-warning-bg text-warning"
                    : "bg-brand-soft text-brand"
                }`}
              >
                <Icone size={15} aria-hidden />
              </span>
            ) : null}
            <h2 className="truncate text-[14px] font-medium text-ink">
              {titulo}
            </h2>
          </div>
          {apoio ? (
            // Recuado até o texto do título, não até o selo: é a legenda dele.
            <p
              className={`mt-1 text-[12px] text-ink-5 ${Icone ? "pl-[39px]" : ""}`}
            >
              {apoio}
            </p>
          ) : null}
        </div>
        {lateral ? <div className="shrink-0">{lateral}</div> : null}
      </header>
      {children}
    </section>
  );
}

/**
 * A lista de linhas do cartão: fio entre elas, nenhum antes da primeira. A
 * última linha arredonda o fundo do hover, que sem isso vazaria no canto do
 * cartão (ele não corta o que transborda — ver acima).
 */
export const LINHAS_DO_CARTAO =
  "divide-y divide-border-soft [&>li:last-child>a]:rounded-b-[11px]";

/** O respiro de uma linha do cartão, igual em todos. */
export const LINHA_DO_CARTAO = "px-[18px] py-[13px]";
