"use client";

import { useActionState, useEffect, useState } from "react";

import { Button, Dialog, Input } from "@/components/ui";

import { convidarAluno, type EstadoConvite } from "./actions";

const INICIAL: EstadoConvite = {};

export function ConvidarAluno() {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(convidarAluno, INICIAL);

  return (
    <>
      <Button onClick={() => setAberto(true)}>Convidar aluno</Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={estado.link ? "Convite pronto" : "Convidar aluno"}
        descricao={
          estado.link
            ? `Mande esse link para ${estado.nomeConvidado}. Vale por 7 dias e só pode ser usado uma vez.`
            : "O aluno recebe um link para criar a conta e completar o perfil."
        }
      >
        {estado.link ? (
          <LinkDoConvite link={estado.link} aoFechar={() => setAberto(false)} />
        ) : (
          <form action={acao} noValidate className="space-y-4">
            <Input
              label="Nome"
              name="nome"
              autoComplete="off"
              placeholder="Como você chama esse aluno"
              defaultValue={estado.campos?.nome}
              error={estado.errosPorCampo?.nome}
              required
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="aluno@email.com"
              defaultValue={estado.campos?.email}
              error={estado.errosPorCampo?.email}
              hint="É o e-mail que ele vai usar para entrar."
              required
            />

            {estado.erro && (
              <p
                role="alert"
                className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
              >
                {estado.erro}
              </p>
            )}

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => setAberto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" block disabled={enviando}>
                {enviando ? "Gerando…" : "Gerar link"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}

function LinkDoConvite({
  link,
  aoFechar,
}: {
  link: string;
  aoFechar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      // Clipboard bloqueado (http, permissão negada): o link está visível e
      // selecionável no campo abaixo, então dá para copiar na mão.
      setCopiado(false);
    }
  }

  const zap = `https://wa.me/?text=${encodeURIComponent(
    `Seu acesso ao Reps Club: ${link}`,
  )}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-[7px]">
        <span className="eyebrow text-ink-3">Link do convite</span>
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full rounded-input border-[1.5px] border-border bg-canvas-sunken px-3.5 font-mono text-[12.5px] text-ink-2"
        />
      </div>

      <div className="flex gap-2.5">
        <Button type="button" variant="secondary" block onClick={copiar}>
          {copiado ? "Copiado" : "Copiar link"}
        </Button>
        <a href={zap} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button type="button" block>
            Abrir WhatsApp
          </Button>
        </a>
      </div>

      <button
        type="button"
        onClick={aoFechar}
        className="w-full text-center text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
      >
        Fechar
      </button>
    </div>
  );
}
