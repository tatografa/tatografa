import { ArrowDown, ArrowUp } from "lucide-react";

import { escalaDoGrafico, fracaoDa } from "@/lib/domain/grafico";
import { cn } from "@/lib/utils";

/*
 * O desenho de gráfico do produto inteiro (pedido do Otávio, 06/10): barras em
 * pílula com o número em cima, cinco marcas redondas no eixo, grade clara, os
 * rótulos embaixo e uma dica escura ao passar o mouse. Um componente só para os
 * gráficos do painel e do app, porque o que faz quatro gráficos parecerem um
 * sistema é serem o mesmo desenho — e quatro cópias divergiriam na primeira
 * revisão.
 *
 * **Sem diretiva e sem hook**, de propósito: o painel o usa como componente de
 * servidor (a dica é CSS, `group-hover`, e nenhum JavaScript vai ao navegador),
 * e o app do aluno o usa dentro de um componente cliente, com as barras virando
 * botões. Os dois cabem porque aqui não há estado nenhum.
 *
 * O que o mouse revela nunca é a única via para o número: cada barra leva o
 * valor escrito em cima (ou, quando são muitas, no `aria-label` do gráfico), e
 * as barras clicáveis têm nome para o leitor de tela.
 */

export type BarraDoGrafico = {
  chave: string;
  valor: number;
  /** O número escrito em cima da barra. Ausente, nada aparece ali. */
  rotulo?: string;
  /** O rótulo embaixo, no eixo. Ausente, a coluna fica sem rótulo. */
  eixo?: string;
  /** Rótulo de eixo que some quando o gráfico é estreito (um sim, um não). */
  eixoSecundario?: boolean;
  dica: { titulo: string; texto: string };
  /** Mais clara: o fim de semana na atividade diária. */
  suave?: boolean;
  selecionada?: boolean;
  /** Com isto a barra vira botão. */
  aoEscolher?: () => void;
  /** O nome do botão para o leitor de tela. */
  nome?: string;
};

export function GraficoDeBarras({
  barras,
  descricao,
  altura = 240,
  inteiro = false,
  formatarMarca = String,
  compacto = false,
  rotulosSoNoLargo = false,
}: {
  barras: BarraDoGrafico[];
  /** A frase inteira do gráfico, para quem não o enxerga. */
  descricao: string;
  /** Altura da área das barras, em px. */
  altura?: number;
  /** Contagem (alunos, treinos): marcas só em número inteiro. */
  inteiro?: boolean;
  formatarMarca?: (valor: number) => string;
  /** Rótulos menores, para gráfico pequeno (vários por tela). */
  compacto?: boolean;
  /**
   * Muitas barras numa coluna estreita: o número em cima de cada uma encavala
   * no vizinho. Abaixo de 520px de gráfico ele some, e o valor continua na dica
   * e na `descricao`.
   */
  rotulosSoNoLargo?: boolean;
}) {
  const { teto, marcas } = escalaDoGrafico(Math.max(0, ...barras.map((b) => b.valor)), inteiro);
  const rotulosDasMarcas = marcas.map((m) => formatarMarca(m.valor));
  // A coluna das marcas tem a largura do maior rótulo: "20.000" não cabe nos
  // 36px que bastam para "80".
  const recuo = Math.max(...rotulosDasMarcas.map((r) => r.length)) * 7 + 12;
  const interativo = barras.some((b) => b.aoEscolher);
  const ultima = barras.length - 1;
  // Com muitas barras a coluna fica mais estreita que o rótulo, e o rótulo da
  // ponta, centrado, sai do cartão. Aí ele encosta na borda do gráfico.
  const presoNasPontas = barras.length > 16;

  return (
    <div
      role={interativo ? "group" : "img"}
      aria-label={descricao}
      // Quem decide quantos rótulos cabem é a largura do gráfico, não a da
      // janela: o mesmo gráfico vive numa coluna de dashboard e num celular.
      className="@container flex flex-col"
      style={{ paddingLeft: recuo }}
    >
      {/* O respiro de cima é do número da barra mais alta, que fica acima dela. */}
      <div className={cn("relative", compacto ? "mt-5" : "mt-6")} style={{ height: altura }}>
        {marcas.map((marca, i) => (
          <div key={marca.valor} aria-hidden>
            <div
              className={cn(
                "absolute inset-x-0 h-0 border-t",
                i === 0 ? "border-border-strong" : "border-border-soft",
              )}
              style={{ bottom: `${marca.fracao * 100}%` }}
            />
            <span
              className={cn(
                "absolute translate-y-1/2 text-right font-semibold text-ink-5 tabular-nums",
                compacto ? "text-[10.5px]" : "text-[12px]",
              )}
              style={{ bottom: `${marca.fracao * 100}%`, left: -recuo, width: recuo - 8 }}
            >
              {rotulosDasMarcas[i]}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 flex items-end">
          {barras.map((barra, i) => (
            <Coluna
              key={barra.chave}
              barra={barra}
              fracao={fracaoDa(barra.valor, teto)}
              compacto={compacto}
              rotulosSoNoLargo={rotulosSoNoLargo}
              lado={i === 0 ? "inicio" : i === ultima && ultima > 0 ? "fim" : "meio"}
            />
          ))}
        </div>
      </div>

      <div aria-hidden className={cn("flex", compacto ? "mt-2" : "mt-2.5")}>
        {barras.map((barra, i) => (
          <span
            key={barra.chave}
            className={cn(
              "flex min-w-0 flex-1 font-semibold whitespace-nowrap text-ink-5 tabular-nums",
              presoNasPontas && i === 0 ? "justify-start" : presoNasPontas && i === ultima ? "justify-end" : "justify-center",
              compacto ? "text-[10.5px]" : "text-[11.5px]",
              barra.eixoSecundario && "invisible @min-[520px]:visible",
            )}
          >
            {barra.eixo ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Coluna({
  barra,
  fracao,
  compacto,
  rotulosSoNoLargo,
  lado,
}: {
  barra: BarraDoGrafico;
  fracao: number;
  compacto: boolean;
  rotulosSoNoLargo: boolean;
  lado: "inicio" | "meio" | "fim";
}) {
  const conteudo = (
    <>
      {barra.rotulo ? (
        <span
          aria-hidden
          className={cn(
            "font-bold whitespace-nowrap text-ink tabular-nums",
            compacto ? "mb-1 text-[11px]" : "mb-[7px] text-[13px]",
            rotulosSoNoLargo && "invisible @min-[520px]:visible",
          )}
        >
          {barra.rotulo}
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          "relative block max-w-[60%] rounded-full transition-colors",
          barra.valor > 0
            ? cn(
                // Cor, e não `filter`: o filtro escureceria a dica que mora
                // dentro da barra e a prenderia abaixo das barras vizinhas.
                barra.suave ? "bg-brand/55 group-hover:bg-brand/70" : "bg-brand group-hover:bg-brand-hover",
                barra.selecionada && "ring-2 ring-brand ring-offset-2 ring-offset-surface",
              )
            : // O toco do zero não é dado: é a marca de que existe uma coluna
              // ali. Quem diz "nada" é a ausência de número em cima dele.
              "bg-border-strong",
        )}
        style={{
          width: compacto ? 22 : 30,
          // Valor pequeno ainda precisa ser uma pílula visível, não um fio.
          height: barra.valor > 0 ? `max(${fracao * 100}%, 6px)` : 3,
        }}
      >
        {/* Presa à barra, logo acima do número: no topo do gráfico ela cobria o
            cabeçalho ao lado da barra mais alta. */}
        <Dica
          titulo={barra.dica.titulo}
          texto={barra.dica.texto}
          lado={lado}
          acimaDoNumero={barra.rotulo ? (compacto ? 20 : 28) : 8}
        />
      </span>
    </>
  );

  // A coluna sob o mouse sobe de camada: a dica dela passa por cima das
  // colunas seguintes, que vêm depois no HTML.
  const classes =
    "group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end hover:z-20 focus-visible:z-20";

  if (barra.aoEscolher) {
    return (
      <button
        type="button"
        onClick={barra.aoEscolher}
        aria-pressed={barra.selecionada ?? false}
        className={cn(
          classes,
          "rounded-[10px] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          barra.selecionada && "bg-brand-tint",
        )}
      >
        <span className="sr-only">{barra.nome ?? `${barra.dica.titulo}: ${barra.dica.texto}`}</span>
        {conteudo}
      </button>
    );
  }

  return (
    <div aria-hidden className={classes}>
      {conteudo}
    </div>
  );
}

/**
 * A dica do mouse. CSS puro: sem estado, sem cliente, sem hidratação.
 *
 * Nas pontas ela encosta na borda do gráfico em vez de centrar: centrada,
 * metade dela sairia do cartão — e no celular, da tela.
 */
function Dica({
  titulo,
  texto,
  lado,
  acimaDoNumero,
}: {
  titulo: string;
  texto: string;
  lado: "inicio" | "meio" | "fim";
  /** Quanto subir acima da barra para não cobrir o número dela, em px. */
  acimaDoNumero: number;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 rounded-[9px] bg-ink px-2.5 py-[7px] text-center whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
        lado === "inicio" ? "left-0" : lado === "fim" ? "right-0" : "left-1/2 -translate-x-1/2",
      )}
      style={{ bottom: `calc(100% + ${acimaDoNumero}px)` }}
    >
      <span className="block text-[12px] font-bold text-surface">{titulo}</span>
      <span className="mt-px block text-[11px] font-medium text-dark-text-2">{texto}</span>
    </span>
  );
}

/* ------------------------------------------------------- o cabeçalho --- */

export type Variacao = {
  texto: string;
  /**
   * `sobe` é verde e só se usa onde subir é bom para qualquer um: carteira
   * crescendo, carga aumentando (o mesmo critério das progressões, 18/09).
   * Queda e "sem mudança" ficam neutras — o gráfico não dá parecer sobre
   * a semana ruim de ninguém. `neutro` também serve a pílula que não é
   * variação ("em 12 dias"), e não leva seta.
   */
  sentido: "sobe" | "desce" | "neutro";
};

/**
 * Título e apoio à esquerda; o número grande e a pílula à direita. É a resposta
 * do gráfico em palavras: quem não olha as barras sai daqui sabendo o que
 * importa.
 */
export function CabecalhoDoGrafico({
  titulo,
  apoio,
  numero,
  unidade,
  variacao,
  compacto = false,
  Titulo = "h2",
}: {
  titulo?: string;
  apoio?: string;
  numero?: string;
  unidade?: string;
  variacao?: Variacao;
  compacto?: boolean;
  Titulo?: "h2" | "h3" | "p";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className={cn("flex min-w-0 flex-col", compacto ? "gap-0.5" : "gap-[5px]")}>
        {titulo ? (
          <Titulo
            className={cn(
              "m-0 font-bold tracking-[-0.01em] text-ink",
              compacto ? "text-[13px]" : "text-[19px]",
            )}
          >
            {titulo}
          </Titulo>
        ) : null}
        {apoio ? (
          <p className={cn("m-0 font-medium text-ink-4", compacto ? "text-[11.5px]" : "text-[13px]")}>
            {apoio}
          </p>
        ) : null}
      </div>
      {numero !== undefined || variacao ? (
        <div className={cn("flex shrink-0 flex-col items-end", compacto ? "gap-1" : "gap-[7px]")}>
          {numero !== undefined ? (
            <p className="m-0 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "font-extrabold tracking-[-0.02em] text-ink tabular-nums",
                  compacto ? "text-[20px]" : "text-[32px] leading-none",
                )}
              >
                {numero}
              </span>
              {unidade ? (
                <span className={cn("font-semibold text-ink-4", compacto ? "text-[11.5px]" : "text-[13px]")}>
                  {unidade}
                </span>
              ) : null}
            </p>
          ) : null}
          {variacao ? <PilulaDeVariacao variacao={variacao} compacto={compacto} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function PilulaDeVariacao({ variacao, compacto }: { variacao: Variacao; compacto: boolean }) {
  const Seta = variacao.sentido === "sobe" ? ArrowUp : variacao.sentido === "desce" ? ArrowDown : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full font-bold whitespace-nowrap tabular-nums",
        compacto ? "px-2 py-[3px] text-[11px]" : "px-[11px] py-1 text-[12px]",
        variacao.sentido === "sobe" ? "bg-success-soft text-success" : "bg-canvas-sunken text-ink-3",
      )}
    >
      {Seta ? <Seta size={compacto ? 11 : 12} strokeWidth={2.4} aria-hidden /> : null}
      {variacao.texto}
    </span>
  );
}
