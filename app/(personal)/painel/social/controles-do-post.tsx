"use client";

import { Heart, Send } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

import { curtirDoPainel, responder, type EstadoDaResposta } from "./actions";

const INICIAL: EstadoDaResposta = {};

/**
 * Curtir e responder, no cartão do post.
 *
 * Um componente só para os dois controles porque eles vivem na mesma linha e
 * compartilham o id do post. O coração é otimista pelo mesmo motivo do app do
 * aluno: esperar a resposta faz clicar duas vezes.
 */
export function ControlesDoPost({
  postId,
  curtidas,
  curtiPor,
}: {
  postId: string;
  curtidas: number;
  curtiPor: boolean;
}) {
  const [estado, acao, enviando] = useActionState(responder, INICIAL);
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
    <div className="space-y-3">
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
          "flex h-9 items-center gap-1.5 rounded-pill border-[1.5px] px-3 text-[13px] font-bold transition",
          curtido
            ? "border-brand bg-brand-soft text-brand"
            : "border-border bg-surface text-ink-4 hover:border-border-strong",
        )}
      >
        <Heart size={14} aria-hidden className={cn(curtido && "fill-brand")} />
        {total}
        <span className="sr-only">
          {curtido ? "Descurtir" : "Curtir"} · {total}{" "}
          {total === 1 ? "curtida" : "curtidas"}
        </span>
      </button>

      <form action={acao} noValidate className="space-y-2.5">
        <input type="hidden" name="postId" value={postId} />
        {/*
          Campo não controlado: o React limpa o formulário quando a ação volta
          sem erro. Em caso de erro a ação devolve o texto, e a `key` muda para
          o React aceitar o valor de volta — sem isso o personal perderia o que
          escreveu.
        */}
        <Textarea
          key={estado.texto ?? "vazio"}
          label="Responder"
          name="texto"
          rows={2}
          placeholder="Escreva para o aluno"
          defaultValue={estado.texto}
          error={estado.erro}
        />
        <Button type="submit" size="sm" disabled={enviando}>
          <Send size={14} aria-hidden />
          {enviando ? "Enviando…" : "Responder"}
        </Button>
      </form>
    </div>
  );
}
