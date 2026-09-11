"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui";

/**
 * O que a tela mostra quando uma leitura falha.
 *
 * **Por que o texto não diz o que deu errado:** o Next não entrega a mensagem
 * de um erro de Server Component ao navegador — ela viraria vazamento de
 * detalhe de servidor. O que chega é um `digest`, que é o identificador da
 * ocorrência no log. Então a tela não tem como distinguir "o banco caiu" de
 * "a query quebrou", e fingir que sabe seria pior que assumir que não sabe.
 *
 * O que ela **pode** afirmar com honestidade: não é culpa do usuário, o dado
 * dele não sumiu, e tentar de novo costuma resolver. `retry()` refaz a busca do
 * trecho que falhou, sem recarregar a página inteira.
 *
 * Aluno sem internet não cai aqui: a requisição nem sai do aparelho, e quem
 * trata isso é o `useOffline` do Next mais a barra de aviso do app do aluno
 * (M4-01). Aqui é falha do servidor.
 */
export function AvisoDeFalha({
  titulo,
  texto,
  digest,
  aoTentarDeNovo,
}: {
  titulo: string;
  texto: string;
  digest?: string;
  aoTentarDeNovo: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center px-1 py-10 text-center">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-full bg-warning-bg text-warning"
      >
        <RotateCw size={19} />
      </span>

      <h1 className="mt-4 text-[19px] font-extrabold tracking-[-0.02em] text-ink">
        {titulo}
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-3">{texto}</p>

      <Button className="mt-5" onClick={aoTentarDeNovo}>
        <RotateCw size={15} aria-hidden />
        Tentar de novo
      </Button>

      {/* O digest é o que liga a tela ao log do servidor. Aparece pequeno, para
          o usuário poder copiar quando pedir ajuda — não para ele entender. */}
      {digest ? (
        <p className="mt-5 font-mono text-[10px] tracking-[0.06em] text-ink-5 uppercase">
          código {digest}
        </p>
      ) : null}
    </div>
  );
}
