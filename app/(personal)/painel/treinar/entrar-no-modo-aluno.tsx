"use client";

import { Dumbbell } from "lucide-react";
import { useActionState } from "react";

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

  return (
    <form action={acao} noValidate className="space-y-3">
      <Button type="submit" disabled={enviando}>
        <Dumbbell size={15} aria-hidden />
        {enviando ? "Abrindo…" : "Criar meu perfil de aluno"}
      </Button>

      {estado.erro ? (
        <p role="alert" className="text-[13px] leading-relaxed text-danger">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
