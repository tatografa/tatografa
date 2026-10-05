"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button, Input } from "@/components/ui";

import { cadastrar, type EstadoAuth } from "../actions";
import { SENHA_MINIMA } from "@/lib/domain/senha";
import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";
import { AceiteDosTermos } from "@/components/aceite-dos-termos";

const INICIAL: EstadoAuth = {};

export function FormularioCadastro({
  textos: t,
  aceite,
  dicaDaSenha,
}: {
  textos: TextosDaAutenticacao["cadastro"];
  aceite: TextosDaAutenticacao["aceite"];
  dicaDaSenha: string;
}) {
  const [estado, acao, enviando] = useActionState(cadastrar, INICIAL);
  // Controlado para a marcação sobreviver a um erro do servidor: o React reseta
  // o formulário depois da ação, e ter que remarcar o aceite por causa de um
  // e-mail inválido é o tipo de atrito que faz a pessoa clicar sem ler.
  const [aceitouTermos, setAceitouTermos] = useState(false);

  if (estado.sucesso === "confirme-email") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-13 items-center justify-center rounded-[15px] bg-brand-soft text-[22px] font-bold text-brand">
          ✓
        </div>
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          {t.confirmeTitulo}
        </h1>
        <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
          {t.confirmeAntes}{" "}
          <strong className="text-ink">{estado.campos?.email}</strong>
          {t.confirmeDepois}
        </p>
        <Link href="/entrar" className="block">
          <Button variant="secondary" block>
            {t.voltarAoLogin}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
          {t.titulo}
        </h1>
        <p className="text-[14px] font-medium text-ink-3">{t.apoio}</p>
      </header>

      <div className="space-y-4">
        <Input
          label={t.nome}
          name="nome"
          autoComplete="name"
          placeholder={t.nomePlaceholder}
          defaultValue={estado.campos?.nome}
          error={estado.errosPorCampo?.nome}
          required
        />

        <Input
          label={t.email}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          defaultValue={estado.campos?.email}
          error={estado.errosPorCampo?.email}
          required
        />

        <Input
          label={t.senha}
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint={dicaDaSenha}
          error={estado.errosPorCampo?.senha}
          minLength={SENHA_MINIMA}
          required
        />

        <AceiteDosTermos
          marcado={aceitouTermos}
          aoMarcar={setAceitouTermos}
          textos={aceite}
          erro={estado.errosPorCampo?.termos}
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
          {enviando ? t.criando : t.botao}
        </Button>
      </div>

      <p className="text-center text-[13.5px] font-medium text-ink-3">
        {t.jaTemConta}{" "}
        <Link
          href="/entrar"
          className="font-semibold text-brand transition hover:text-brand-hover"
        >
          {t.entrar}
        </Link>
      </p>
    </form>
  );
}
