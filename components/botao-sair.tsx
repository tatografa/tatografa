"use client";

import { LogOut } from "lucide-react";
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
  rotulo = "Sair",
  apenasIcone = false,
}: {
  variant?: "secondary" | "danger";
  /** `sm` cabe na barra do painel; no celular o alvo precisa dos 44px. */
  size?: "sm" | "md";
  block?: boolean;
  /** "Sair da conta" onde o botão mora longe do nome de quem está logado. */
  rotulo?: string;
  /**
   * Só o ícone, para o pé da barra lateral do painel: ao lado do nome de quem
   * está logado, a palavra "Sair" repete o que o ícone já diz, e na barra
   * recolhida não há largura para ela. O nome continua no `aria-label`.
   */
  apenasIcone?: boolean;
}) {
  const [saindo, iniciarTransicao] = useTransition();

  if (apenasIcone) {
    return (
      <button
        type="button"
        disabled={saindo}
        onClick={() => iniciarTransicao(() => sair())}
        aria-label={saindo ? "Saindo…" : rotulo}
        title={rotulo}
        className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-ink-4 transition hover:bg-surface hover:text-brand disabled:opacity-60"
      >
        <LogOut size={17} aria-hidden />
      </button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      block={block}
      disabled={saindo}
      onClick={() => iniciarTransicao(() => sair())}
    >
      {saindo ? "Saindo…" : rotulo}
    </Button>
  );
}
