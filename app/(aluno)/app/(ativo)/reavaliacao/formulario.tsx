"use client";

import { Camera, Lock, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button, Card, Input, Textarea } from "@/components/ui";
import {
  LIMITE_DA_OBSERVACAO,
  ONDE_MEDIR,
  REGIOES,
  ROTULO_DA_REGIAO,
  ROTULO_DO_SLOT,
  SLOTS,
  formatarMedida,
  type Slot,
} from "@/lib/domain/reavaliacao";
import { prepararFoto } from "@/lib/imagem";
import type { Reavaliacao } from "@/lib/queries/reavaliacao";

import { enviarReavaliacao, type EstadoDaReavaliacao } from "./actions";

const INICIAL: EstadoDaReavaliacao = {};

/**
 * O formulário da reavaliação (doc 05 §12).
 *
 * **Tudo é opcional, menos preencher alguma coisa.** O aluno que só tem fita
 * métrica mede; o que só tem balança pesa; o que está no vestiário tira as
 * fotos. Exigir os onze campos faria o formulário ser adiado para "quando eu
 * tiver tudo", que é quando ele não é preenchido.
 *
 * O valor da reavaliação anterior aparece como dica em cada campo: é a única
 * forma de o aluno perceber na hora que digitou 8 onde queria 80 — e ele está
 * de pé, com a fita numa mão e o celular na outra.
 */
export function Formulario({
  reavaliacao,
  anterior,
}: {
  reavaliacao: Reavaliacao;
  anterior: Reavaliacao | null;
}) {
  const [estado, acao, enviando] = useActionState(enviarReavaliacao, INICIAL);
  const erros = estado.errosPorCampo ?? {};
  const [observacao, setObservacao] = useState("");

  return (
    <form action={acao} noValidate className="space-y-6">
      <input type="hidden" name="id" value={reavaliacao.id} />

      <section className="space-y-3">
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
          Peso e gordura
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="peso"
            label="Peso (kg)"
            type="text"
            inputMode="decimal"
            placeholder="0,0"
            error={erros.peso}
            hint={dica(anterior?.peso, "kg")}
          />
          <Input
            name="gordura"
            label="Gordura (%)"
            type="text"
            inputMode="decimal"
            placeholder="0,0"
            error={erros.gordura}
            hint={dica(anterior?.gordura, "%")}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
          Medidas (cm)
        </h2>
        <div className="space-y-3">
          {REGIOES.map((regiao) => (
            <Input
              key={regiao}
              name={regiao}
              label={ROTULO_DA_REGIAO[regiao]}
              type="text"
              inputMode="decimal"
              placeholder="0,0"
              error={erros[regiao]}
              hint={comOndeMedir(ONDE_MEDIR[regiao], anterior?.medidas[regiao])}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
            Fotos
          </h2>
          <p className="flex items-start gap-1.5 text-[12px] leading-[1.5] text-ink-4">
            <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
            Só você e seu personal veem estas fotos. Elas não vão para o feed.
          </p>
        </div>

        {erros.fotos && (
          <p role="alert" className="text-[13px] text-danger">
            {erros.fotos}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {SLOTS.map((slot) => (
            <CampoDeFoto key={slot} slot={slot} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Textarea
          name="observacao"
          label="Como você está se sentindo?"
          rows={4}
          maxLength={LIMITE_DA_OBSERVACAO}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          error={erros.observacao}
          hint="Opcional. Dores, sono, disposição, o que mudou na rotina."
        />
      </section>

      {estado.erro && (
        <p role="alert" className="text-[13px] text-danger">
          {estado.erro}
        </p>
      )}

      <Card className="space-y-3">
        <p className="text-[12.5px] leading-[1.5] text-ink-4">
          Depois de enviar, a reavaliação não muda mais — é ela que seu personal
          vai comparar com a próxima. Confira os números antes.
        </p>
        <Button type="submit" block disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar reavaliação"}
        </Button>
      </Card>
    </form>
  );
}

/**
 * Um ângulo de foto.
 *
 * **A pré-visualização é local** (`URL.createObjectURL`): o aluno confere o
 * enquadramento sem gastar a internet da academia, e foto descartada nunca sai
 * do aparelho. A redução acontece aqui também, antes do envio — 11 MB do
 * celular viram menos de 1 MB, o que resolve de uma vez a rede, o limite de
 * corpo da Server Action e o HEIC do iPhone, que o canvas devolve em JPEG.
 */
function CampoDeFoto({ slot }: { slot: Slot }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!previa) return;
    return () => URL.revokeObjectURL(previa);
  }, [previa]);

  function mostrar(arquivo: File | null) {
    setPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return arquivo ? URL.createObjectURL(arquivo) : null;
    });
  }

  async function aoEscolher(arquivo: File | undefined) {
    setErro(null);
    if (!arquivo) {
      mostrar(null);
      return;
    }

    setPreparando(true);
    try {
      const reduzida = await prepararFoto(arquivo);

      // O arquivo reduzido volta para o próprio `input`: é ele que o `<form>`
      // envia, então o original nunca chega a sair do aparelho.
      const transferencia = new DataTransfer();
      transferencia.items.add(reduzida);
      if (entrada.current) entrada.current.files = transferencia.files;

      mostrar(reduzida);
    } catch {
      // Deixar o campo cheio mandaria o original para o servidor, que o
      // recusaria com uma mensagem menos útil que esta.
      if (entrada.current) entrada.current.value = "";
      mostrar(null);
      setErro("Não conseguimos ler essa imagem.");
    } finally {
      setPreparando(false);
    }
  }

  function tirar() {
    if (entrada.current) entrada.current.value = "";
    setErro(null);
    mostrar(null);
  }

  const id = `foto-${slot}`;

  return (
    <div className="space-y-1.5">
      <input
        ref={entrada}
        id={id}
        type="file"
        name={slot}
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => aoEscolher(e.target.files?.[0])}
      />

      {previa ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previa}
            alt={`Prévia da foto ${ROTULO_DO_SLOT[slot].toLowerCase()}`}
            className="aspect-[3/4] w-full rounded-card border border-border-soft object-cover"
          />
          <button
            type="button"
            onClick={tirar}
            className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-pill bg-ink/70 text-white"
            aria-label={`Remover a foto ${ROTULO_DO_SLOT[slot].toLowerCase()}`}
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="grid aspect-[3/4] w-full cursor-pointer place-items-center gap-1 rounded-card border border-dashed border-border bg-canvas-sunken text-center transition hover:border-brand"
        >
          <span className="space-y-1">
            <Camera size={18} className="mx-auto text-ink-4" aria-hidden />
            <span className="block text-[11.5px] font-semibold text-ink-3">
              {preparando ? "Preparando…" : ROTULO_DO_SLOT[slot]}
            </span>
          </span>
        </label>
      )}

      {erro && (
        <p role="alert" className="text-[11px] text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}

/** "Na última: 82,4 kg". Nulo quando não houve anterior — e aí a dica some. */
function dica(valor: number | null | undefined, unidade: string): string | undefined {
  if (valor === null || valor === undefined) return undefined;
  return `Na última: ${formatarMedida(valor)} ${unidade}`;
}

/**
 * As duas dicas da medida, juntas.
 *
 * Escolher entre elas perde sempre metade: sem "onde medir", quem mede pela
 * primeira vez põe a fita num lugar diferente a cada ciclo e a comparação
 * compara nada; sem o valor anterior, ninguém percebe que digitou 8 onde queria
 * 80. Na primeira reavaliação só existe a primeira.
 */
function comOndeMedir(onde: string, anteriorCm: number | undefined): string {
  const ultima = dica(anteriorCm, "cm");
  return ultima ? `${onde} · ${ultima.toLowerCase()}` : onde;
}
