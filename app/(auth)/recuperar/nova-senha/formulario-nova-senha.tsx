"use client";

import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { definirNovaSenha, type EstadoAuth } from "../../actions";
import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";

const INICIAL: EstadoAuth = {};

export function FormularioNovaSenha({
  textos: t,
  dicaDaSenha,
}: {
  textos: TextosDaAutenticacao["novaSenha"];
  dicaDaSenha: string;
}) {
  const [estado, acao, enviando] = useActionState(definirNovaSenha, INICIAL);

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          {t.titulo}
        </h1>
        <p className="text-[14px] font-medium text-ink-3">{dicaDaSenha}</p>
      </header>

      <div className="space-y-4">
        <Input
          label={t.nova}
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={estado.errosPorCampo?.senha}
          minLength={8}
          required
        />

        <Input
          label={t.repita}
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
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

        <Button type="submit" block disabled={enviando}>
          {enviando ? t.salvando : t.botao}
        </Button>
      </div>
    </form>
  );
}
