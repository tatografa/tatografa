"use client";

import { Heart, SendHorizontal } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { curtirDoPainel, responder, type EstadoDaResposta } from "./actions";

const INICIAL: EstadoDaResposta = {};

/**
 * O coração do post. Otimista pelo mesmo motivo do app do aluno: esperar a
 * resposta faz clicar duas vezes.
 */
export function CurtirDoPainel({
  postId,
  curtidas,
  curtiPor,
}: {
  postId: string;
  curtidas: number;
  curtiPor: boolean;
}) {
  const [curtido, setCurtido] = useState(curtiPor);
  const [total, setTotal] = useState(curtidas);
  const [, iniciar] = useTransition();

  // Quando o servidor revalida, quem manda é ele.
  const [ultimo, setUltimo] = useState({ curtidas, curtiPor });
  if (ultimo.curtidas !== curtidas || ultimo.curtiPor !== curtiPor) {
    setUltimo({ curtidas, curtiPor });
    setCurtido(curtiPor);
    setTotal(curtidas);
  }

  return (
    <button
      type="button"
      aria-pressed={curtido}
      onClick={() => {
        const antes = { curtido, total };
        setCurtido(!curtido);
        setTotal(total + (curtido ? -1 : 1));
        iniciar(async () => {
          const { ok } = await curtirDoPainel(postId, antes.curtido);
          if (!ok) {
            setCurtido(antes.curtido);
            setTotal(antes.total);
          }
        });
      }}
      className={cn(
        "flex min-h-8 items-center gap-1.5 text-[13px] font-semibold transition",
        curtido ? "text-brand" : "text-ink-3 hover:text-ink",
      )}
    >
      <Heart size={15} aria-hidden className={cn(curtido && "fill-brand")} />
      <span aria-hidden>{total}</span>
      <span className="sr-only">
        {curtido ? "Descurtir" : "Curtir"} · {total} {total === 1 ? "curtida" : "curtidas"}
      </span>
    </button>
  );
}

/**
 * O campo de resposta, no pé do post, numa linha só como no protótipo
 * ("Adicionar comentário..."). Enter envia; a resposta longa continua cabendo,
 * porque o limite é o da legenda (500), e quem escreve um parágrafo no painel
 * está no computador, onde Enter não é o único jeito de mandar.
 */
export function ResponderDoPainel({ postId, aluno }: { postId: string; aluno: string }) {
  const [estado, acao, enviando] = useActionState(responder, INICIAL);

  return (
    <form action={acao} noValidate className="space-y-1.5">
      <input type="hidden" name="postId" value={postId} />
      <div className="flex items-center gap-2">
        {/*
          Campo não controlado: o React limpa o formulário quando a ação volta
          sem erro. Em caso de erro a ação devolve o texto, e a `key` muda para
          o React aceitar o valor de volta — sem isso o personal perderia o que
          escreveu.
        */}
        <input
          key={estado.texto ?? "vazio"}
          name="texto"
          defaultValue={estado.texto}
          placeholder="Adicionar comentário…"
          aria-label={`Responder a ${aluno}`}
          aria-invalid={estado.erro ? true : undefined}
          maxLength={500}
          autoComplete="off"
          className={cn(
            "h-[38px] min-w-0 flex-1 rounded-[9px] border bg-canvas px-3 text-[13px] text-ink transition",
            "placeholder:text-ink-5 focus:border-brand focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-brand/15",
            estado.erro ? "border-danger" : "border-border",
          )}
        />
        <button
          type="submit"
          disabled={enviando}
          aria-label="Enviar resposta"
          title="Enviar"
          className="flex size-[38px] shrink-0 items-center justify-center rounded-[9px] bg-brand text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          <SendHorizontal size={15} aria-hidden />
        </button>
      </div>
      {estado.erro ? (
        <p role="alert" className="text-[12px] font-semibold text-danger">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
