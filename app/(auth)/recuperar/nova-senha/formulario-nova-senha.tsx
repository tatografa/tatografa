"use client";

import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { definirNovaSenha, type EstadoAuth } from "../../actions";

const INICIAL: EstadoAuth = {};

export function FormularioNovaSenha() {
  const [estado, acao, enviando] = useActionState(definirNovaSenha, INICIAL);

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h2 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Criar nova senha
        </h2>
        <p className="text-[14px] font-medium text-ink-3">
          Mínimo de 8 caracteres.
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label="Nova senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={estado.errosPorCampo?.senha}
          minLength={8}
          required
        />

        <Input
          label="Repita a senha"
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
          {enviando ? "Salvando…" : "Salvar e entrar"}
        </Button>
      </div>
    </form>
  );
}
