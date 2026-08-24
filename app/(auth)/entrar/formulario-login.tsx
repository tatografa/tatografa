"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { entrar, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

export function FormularioLogin({
  proximo,
  aviso,
}: {
  proximo?: string;
  aviso?: string;
}) {
  const [estado, acao, enviando] = useActionState(entrar, INICIAL);

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h2 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Entrar como personal
        </h2>
        <p className="text-[14px] font-medium text-ink-3">
          Use o e-mail cadastrado na sua conta.
        </p>
      </header>

      {aviso && (
        <p className="rounded-[9px] bg-warning-bg px-3 py-2.5 text-[12.5px] font-semibold text-warning">
          {aviso}
        </p>
      )}

      <div className="space-y-4">
        {proximo && <input type="hidden" name="proximo" value={proximo} />}

        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@assessoria.com"
          defaultValue={estado.campos?.email}
          error={estado.errosPorCampo?.email}
          required
        />

        <Input
          label="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={estado.errosPorCampo?.senha}
          required
          labelAction={
            <Link
              href="/recuperar"
              className="text-[12.5px] font-semibold text-brand transition hover:text-brand-hover"
            >
              Esqueci minha senha
            </Link>
          }
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
          {enviando ? "Entrando…" : "Entrar no painel"}
        </Button>
      </div>

      <p className="text-center text-[13.5px] font-medium text-ink-3">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-brand transition hover:text-brand-hover"
        >
          Criar conta de personal
        </Link>
      </p>
    </form>
  );
}
