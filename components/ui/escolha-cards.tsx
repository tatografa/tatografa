"use client";

import { cn } from "@/lib/utils";

export type OpcaoDeEscolha = {
  valor: string;
  rotulo: string;
  /** Emoji ou glifo curto. Decorativo — o rótulo é quem informa. */
  icone?: string;
};

export interface EscolhaCardsProps {
  label: string;
  name: string;
  opcoes: OpcaoDeEscolha[];
  valor: string;
  aoMudar: (valor: string) => void;
  error?: string;
  /** 2 para objetivo (doc 05), 1 para listas mais longas. */
  colunas?: 1 | 2;
}

/**
 * Grupo de rádio desenhado como cards. Usado no objetivo e no nível do
 * onboarding do aluno.
 *
 * É `role="radiogroup"` com inputs reais escondidos: o card é o visual, mas
 * quem recebe teclado e leitor de tela é o rádio nativo, com as setas
 * funcionando de graça.
 */
export function EscolhaCards({
  label,
  name,
  opcoes,
  valor,
  aoMudar,
  error,
  colunas = 2,
}: EscolhaCardsProps) {
  const idErro = `${name}-erro`;

  return (
    <fieldset className="flex flex-col gap-[9px]">
      <legend className="eyebrow mb-[9px] text-ink-3">{label}</legend>

      <div
        className={cn(
          "grid gap-[9px]",
          colunas === 2 ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {opcoes.map((opcao) => {
          const marcado = valor === opcao.valor;

          return (
            <label
              key={opcao.valor}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-input border-[1.5px] p-[13px] transition",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                marcado
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opcao.valor}
                checked={marcado}
                onChange={() => aoMudar(opcao.valor)}
                aria-describedby={error ? idErro : undefined}
                className="sr-only"
              />
              {opcao.icone && (
                <span aria-hidden className="text-[15px] leading-none">
                  {opcao.icone}
                </span>
              )}
              <span
                className={cn(
                  "text-[12px] font-semibold",
                  marcado ? "text-brand" : "text-ink-2",
                )}
              >
                {opcao.rotulo}
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={idErro} className="text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
