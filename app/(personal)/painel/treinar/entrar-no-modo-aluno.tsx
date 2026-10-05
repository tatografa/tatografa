"use client";

import { Dumbbell } from "lucide-react";
import { useActionState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button } from "@/components/ui";

import { virarAlunoDeMimMesmo, type EstadoDoModoAluno } from "./actions";

const INICIAL: EstadoDoModoAluno = {};

/**
 * O botão que cria a linha de aluno do personal.
 *
 * Não é formulário de preencher — o nome e o e-mail saem da linha de personal.
 * Continua sendo um `<form>` com Server Action porque é uma escrita: assim ela
 * sai do servidor, com a sessão do próprio usuário passando pelo RLS.
 */
export function EntrarNoModoAluno() {
  const [estado, acao, enviando] = useActionState(virarAlunoDeMimMesmo, INICIAL);
  const tr = usePainel().t.configuracoes.treinar;

  return (
    <form action={acao} noValidate className="space-y-3">
      <Button type="submit" disabled={enviando}>
        <Dumbbell size={15} aria-hidden />
        {enviando ? tr.abrindo : tr.botao}
      </Button>

      {estado.erro ? (
        <p role="alert" className="text-[13px] leading-relaxed text-danger">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
