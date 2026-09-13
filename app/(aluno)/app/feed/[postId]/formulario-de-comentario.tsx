"use client";

import { Send } from "lucide-react";
import { useActionState, useRef } from "react";

import { Button, Textarea } from "@/components/ui";

import { comentar, type EstadoDoComentario } from "../actions";

const INICIAL: EstadoDoComentario = {};

/**
 * O campo de comentar.
 *
 * O `<form>` é limpo pelo React quando a Server Action volta sem erro — por
 * isso o campo é **não controlado**. Se houver erro, a ação devolve o texto e
 * ele é recolocado pelo `defaultValue`, com a `key` mudando para o React
 * aceitar o valor novo: sem isso o aluno perderia o que escreveu.
 */
export function FormularioDeComentario({ postId }: { postId: string }) {
  const [estado, acao, enviando] = useActionState(comentar, INICIAL);
  const formulario = useRef<HTMLFormElement>(null);

  return (
    <form ref={formulario} action={acao} noValidate className="space-y-2.5">
      <input type="hidden" name="postId" value={postId} />

      <Textarea
        key={estado.texto ?? "vazio"}
        label="Comentar"
        name="texto"
        rows={2}
        placeholder="Escreva um comentário"
        defaultValue={estado.texto}
        error={estado.erro}
      />

      <Button type="submit" size="md" disabled={enviando}>
        <Send size={15} aria-hidden />
        {enviando ? "Enviando…" : "Comentar"}
      </Button>
    </form>
  );
}
