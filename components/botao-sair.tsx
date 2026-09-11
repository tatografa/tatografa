"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui";

import { sair } from "@/lib/auth/actions";

/**
 * Encerra a sessão. Vive em `components/` porque serve aos **dois** lados.
 *
 * Ficou só no painel até o primeiro teste de campo, e isso transformou a conta
 * de aluno numa armadilha: o app do aluno não tinha saída, e o proxy manda todo
 * usuário logado que abre `/entrar`, `/cadastro` ou `/acesso` de volta para a
 * sua área. Sem este botão, trocar de conta exigia limpar os cookies do
 * navegador — e celular emprestado na academia é caso real neste produto.
 */
export function BotaoSair({
  variant = "secondary",
  size = "sm",
  block = false,
}: {
  variant?: "secondary" | "danger";
  /** `sm` cabe na barra do painel; no celular o alvo precisa dos 44px. */
  size?: "sm" | "md";
  block?: boolean;
}) {
  const [saindo, iniciarTransicao] = useTransition();

  return (
    <Button
      size={size}
      variant={variant}
      block={block}
      disabled={saindo}
      onClick={() => iniciarTransicao(() => sair())}
    >
      {saindo ? "Saindo…" : "Sair"}
    </Button>
  );
}
