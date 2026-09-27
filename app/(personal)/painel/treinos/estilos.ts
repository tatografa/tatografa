/**
 * As receitas de classe que os pedaços da divisão de treino dividem.
 *
 * Campo compacto e não o `Input` do design system: o `Input` tem 44px e
 * rótulo em eyebrow acima, feito para formulário; aqui são dezenas de campos
 * num cartão de 400px, no desenho do protótipo (fundo preenchido, 13px). O
 * foco é o mesmo do `Input` — borda e anel em `brand` —, para o teclado não
 * encontrar dois comportamentos no mesmo painel.
 */

export const CAMPO =
  "w-full rounded-[10px] border-[1.5px] border-border bg-canvas px-3 py-[8px] text-[13px] font-medium text-ink transition " +
  "placeholder:font-normal placeholder:text-ink-5 focus:border-brand focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-brand/15";

export const CAMPO_COM_ERRO = "border-danger focus:border-danger focus:ring-danger/15";

/** O rótulo pequeno acima de cada grupo do painel lateral. */
export const ROTULO = "mb-2 block text-[12px] font-medium tracking-[0.02em] text-ink-5";

/** Botão só de ícone, 28px: ⋯, ×, setas. */
export const BOTAO_DE_ICONE =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] text-ink-4 transition hover:bg-canvas-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-35";
