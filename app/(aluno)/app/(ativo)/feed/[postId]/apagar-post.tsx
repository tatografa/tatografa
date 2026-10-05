"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { useIdioma } from "@/components/aluno/idioma-do-app";
import { Button, Dialog } from "@/components/ui";

import { apagarPost, type EstadoDaExclusao } from "../actions";

const INICIAL: EstadoDaExclusao = {};

/**
 * Apagar o próprio post.
 *
 * Existe com diálogo de confirmação, e não como um toque só, porque a ação é
 * irreversível e leva junto os comentários — inclusive a resposta que o
 * personal escreveu. Toque acidental num botão de lixeira ao lado do coração
 * não pode custar isso.
 */
export function ApagarPost({ postId, temFoto }: { postId: string; temFoto: boolean }) {
  const [estado, acao, enviando] = useActionState(apagarPost, INICIAL);
  const [aberto, setAberto] = useState(false);
  const { t } = useIdioma();

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex h-11 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold text-ink-4 transition hover:bg-canvas-sunken hover:text-danger"
      >
        <Trash2 size={15} aria-hidden />
        {t.comum.apagar}
      </button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={t.feed.post.apagarTitulo}
        descricao={
          temFoto ? t.feed.post.apagarComFoto : t.feed.post.apagarSemFoto
        }
      >
        <form action={acao} className="space-y-4">
          <input type="hidden" name="postId" value={postId} />

          {estado.erro ? (
            <p
              role="alert"
              className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
            >
              {estado.erro}
            </p>
          ) : null}

          <div className="flex gap-2.5">
            <Button type="button" variant="secondary" block onClick={() => setAberto(false)}>
              {t.comum.manter}
            </Button>
            <Button type="submit" variant="danger" block disabled={enviando}>
              {enviando ? t.comum.apagando : t.comum.apagar}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
