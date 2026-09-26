"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Dialog } from "@/components/ui";

import { apagarFotosDaReavaliacao, type EstadoDoApagamento } from "./actions";

const INICIAL: EstadoDoApagamento = {};

/**
 * "Apagar as fotos" de uma reavaliação já enviada.
 *
 * Confirma antes, e a confirmação diz exatamente o que sobra: as medidas
 * continuam. Sem essa frase, o aluno que só quer tirar as fotos do ar hesita,
 * achando que vai apagar a comparação inteira — e quem hesita não apaga, o que
 * transforma o botão em enfeite.
 */
export function BotaoApagarFotos({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(apagarFotosDaReavaliacao, INICIAL);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex min-h-11 items-center gap-1.5 text-[12px] font-semibold text-ink-4 transition hover:text-danger"
      >
        <Trash2 size={13} aria-hidden /> Apagar as fotos
      </button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Apagar as fotos?"
        descricao="As fotos saem do Reps Club e seu personal deixa de vê-las. Suas medidas, o peso e a observação continuam — é com eles que ele acompanha sua evolução."
      >
        <form action={acao} noValidate className="space-y-4">
          <input type="hidden" name="id" value={id} />

          {estado.erro && (
            <p role="alert" className="text-[13px] text-danger">
              {estado.erro}
            </p>
          )}

          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="secondary"
              block
              onClick={() => setAberto(false)}
              disabled={enviando}
            >
              Manter
            </Button>
            <Button type="submit" variant="danger" block disabled={enviando}>
              {enviando ? "Apagando…" : "Apagar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
