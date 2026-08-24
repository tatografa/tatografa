"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui";

import { sair } from "@/lib/auth/actions";

export function BotaoSair() {
  const [saindo, iniciarTransicao] = useTransition();

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={saindo}
      onClick={() => iniciarTransicao(() => sair())}
    >
      {saindo ? "Saindo…" : "Sair"}
    </Button>
  );
}
