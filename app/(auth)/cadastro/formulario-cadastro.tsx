"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, Input } from "@/components/ui";

import { cadastrar, type EstadoAuth } from "../actions";

const INICIAL: EstadoAuth = {};

export function FormularioCadastro() {
  const [estado, acao, enviando] = useActionState(cadastrar, INICIAL);

  if (estado.sucesso === "confirme-email") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-13 items-center justify-center rounded-[15px] bg-brand-soft text-[22px] font-bold text-brand">
          ✓
        </div>
        <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          Confirme seu e-mail
        </h2>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          Enviamos um link para{" "}
          <strong className="text-ink">{estado.campos?.email}</strong>. Abra o
          link e sua conta estará pronta.
        </p>
        <Link href="/entrar" className="block">
          <Button variant="secondary" block>
            Voltar ao login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h2 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          Criar conta de personal
        </h2>
        <p className="text-[14px] font-medium text-ink-3">
          Leva menos de um minuto. Depois é só convidar seus alunos.
        </p>
      </header>

      <div className="space-y-4">
        <Input
          label="Nome"
          name="nome"
          autoComplete="name"
          placeholder="Como seus alunos te chamam"
          defaultValue={estado.campos?.nome}
          error={estado.errosPorCampo?.nome}
          required
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Mínimo de 8 caracteres."
          error={estado.errosPorCampo?.senha}
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
          {enviando ? "Criando…" : "Criar conta"}
        </Button>
      </div>

      <p className="text-center text-[13.5px] font-medium text-ink-3">
        Já tem conta?{" "}
        <Link
          href="/entrar"
          className="font-semibold text-brand transition hover:text-brand-hover"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
