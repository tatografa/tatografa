"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { alternarCurtida } from "../actions";

/**
 * O coração, otimista.
 *
 * Curtir é o gesto mais barato do feed e o mais sujeito a internet ruim de
 * academia: esperar a resposta faria o aluno tocar duas vezes. A tela pinta na
 * hora e **desfaz** se o servidor recusar — o `revalidatePath` da ação traz a
 * contagem de verdade logo atrás.
 */
export function BotaoDeCurtir({
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

  // O servidor é quem manda quando a página revalida: se a contagem que chegou
  // discorda da que está na tela, a de fora ganha.
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
        const anterior = { curtido, total };
        setCurtido(!curtido);
        setTotal(total + (curtido ? -1 : 1));

        iniciar(async () => {
          const { ok } = await alternarCurtida(postId, anterior.curtido);
          if (!ok) {
            setCurtido(anterior.curtido);
            setTotal(anterior.total);
          }
        });
      }}
      className={cn(
        "flex h-11 items-center gap-2 rounded-pill border-[1.5px] px-4 text-[13.5px] font-bold transition",
        curtido
          ? "border-brand bg-brand-soft text-brand"
          : "border-border bg-surface text-ink-3 hover:border-border-strong",
      )}
    >
      <Heart size={16} aria-hidden className={cn(curtido && "fill-brand")} />
      {total}
      <span className="sr-only">
        {curtido ? "Descurtir" : "Curtir"} · {total}{" "}
        {total === 1 ? "curtida" : "curtidas"}
      </span>
    </button>
  );
}
