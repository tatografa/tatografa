"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";

import { Button, Input } from "@/components/ui";
import { formatarTelefone } from "@/lib/domain/telefone";

import { salvarContato, type EstadoDoContato } from "./actions";

const INICIAL: EstadoDoContato = {};

/**
 * O WhatsApp do personal, em modo leitura com botão "Editar" — o mesmo desenho
 * do ajuste de alerta, porque esta página inteira é de conferir, não preencher.
 *
 * O texto explica **onde o número aparece**. Sem isso, dar o próprio telefone a
 * um formulário sem destino declarado é um pedido que a pessoa pula — e o botão
 * do lado do aluno nunca existe.
 */
export function ContatoDoPersonal({ telefone }: { telefone: string | null }) {
  const [estado, acao, enviando] = useActionState(salvarContato, INICIAL);
  const [editando, setEditando] = useState(false);

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto usa desde o onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) setEditando(false);
  }

  if (!editando) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-ink">
            {telefone ? formatarTelefone(telefone) : "Sem número"}
          </p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink-3">
            {telefone
              ? "Seus alunos veem um botão de WhatsApp no perfil deles, que abre a conversa direto com você."
              : "Informe seu número e seus alunos ganham um botão de WhatsApp no perfil deles, que abre a conversa direto com você."}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditando(true)}>
          <Pencil size={15} aria-hidden />
          {telefone ? "Editar" : "Informar"}
        </Button>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-4">
      <Input
        label="WhatsApp"
        name="telefone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        autoFocus
        placeholder="(11) 99999-9999"
        defaultValue={estado.campos?.telefone ?? formatarTelefone(telefone)}
        error={estado.errosPorCampo?.telefone}
        hint="Com DDD. Deixe em branco para tirar o botão do app dos alunos."
      />

      {estado.erro && (
        <p
          role="alert"
          className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setEditando(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
