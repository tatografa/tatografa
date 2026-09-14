"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Input, Select } from "@/components/ui";
import { NIVEL, OBJETIVO } from "@/lib/rotulos";
import type { Tables } from "@/types/database";

import { salvarPerfil, type EstadoDoPerfil } from "./actions";

const INICIAL: EstadoDoPerfil = {};

type Aluno = Pick<
  Tables<"students">,
  "name" | "email" | "birth_date" | "goal" | "experience_level" | "weight_kg" | "height_cm"
>;

/**
 * O perfil do aluno, em **modo leitura com botão "Editar"** — o mesmo padrão do
 * ajuste de alerta no painel.
 *
 * Leitura por padrão porque esta é uma tela de conferir: o aluno entra aqui
 * para ver o que informou (e para sair do app). Formulário sempre aberto
 * convida ao toque acidental num campo que o personal usa para montar treino.
 */
export function FormularioDePerfil({ aluno }: { aluno: Aluno }) {
  const [estado, acao, enviando] = useActionState(salvarPerfil, INICIAL);
  const [editando, setEditando] = useState(false);

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto usa desde o onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) setEditando(false);
  }

  if (!editando) {
    const linhas = [
      { rotulo: "Nome", valor: aluno.name },
      { rotulo: "E-mail", valor: aluno.email },
      {
        rotulo: "Nascimento",
        valor: aluno.birth_date ? porExtenso(aluno.birth_date) : "Não informado",
      },
      { rotulo: "Objetivo", valor: aluno.goal ? OBJETIVO[aluno.goal] : "Não informado" },
      {
        rotulo: "Nível",
        valor: aluno.experience_level ? NIVEL[aluno.experience_level] : "Não informado",
      },
      {
        rotulo: "Peso",
        valor: aluno.weight_kg ? `${Number(aluno.weight_kg)} kg` : "Não informado",
      },
      {
        rotulo: "Altura",
        valor: aluno.height_cm ? `${aluno.height_cm} cm` : "Não informado",
      },
    ];

    return (
      <div className="space-y-4">
        <dl className="divide-y divide-border-soft">
          {linhas.map((linha) => (
            <div
              key={linha.rotulo}
              className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0"
            >
              <dt className="eyebrow shrink-0 text-ink-4">{linha.rotulo}</dt>
              <dd className="min-w-0 truncate text-right text-[13.5px] font-semibold text-ink">
                {linha.valor}
              </dd>
            </div>
          ))}
        </dl>

        <Button variant="secondary" block onClick={() => setEditando(true)}>
          <Pencil size={15} aria-hidden />
          Editar meus dados
        </Button>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-4">
      <Input
        label="Nome"
        name="nome"
        defaultValue={aluno.name}
        error={estado.errosPorCampo?.nome}
      />

      <Input
        label="Data de nascimento"
        name="nascimento"
        type="date"
        defaultValue={aluno.birth_date ?? ""}
        error={estado.errosPorCampo?.nascimento}
      />

      <Select
        label="Objetivo"
        name="objetivo"
        defaultValue={aluno.goal ?? "massa"}
        error={estado.errosPorCampo?.objetivo}
      >
        {Object.entries(OBJETIVO).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </Select>

      <Select
        label="Nível"
        name="nivel"
        defaultValue={aluno.experience_level ?? "iniciante"}
        error={estado.errosPorCampo?.nivel}
      >
        {Object.entries(NIVEL).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Peso (kg)"
          name="peso"
          type="number"
          inputMode="decimal"
          step="0.1"
          defaultValue={aluno.weight_kg ? String(Number(aluno.weight_kg)) : ""}
          error={estado.errosPorCampo?.peso}
        />
        <Input
          label="Altura (cm)"
          name="altura"
          type="number"
          inputMode="numeric"
          defaultValue={aluno.height_cm ? String(aluno.height_cm) : ""}
          error={estado.errosPorCampo?.altura}
        />
      </div>

      {/*
        O e-mail não é campo de perfil: é a identidade da conta em `auth.users`,
        e trocá-lo é um fluxo de confirmação, não um update de linha. Dizer isso
        aqui é mais honesto que mostrar um campo desabilitado sem explicação.
      */}
      <p className="rounded-card bg-canvas-sunken px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-3">
        Seu e-mail é o endereço com que você entra, e não muda por aqui. Para
        trocá-lo, fale com o seu personal.
      </p>

      {estado.erro ? (
        <p role="alert" className="text-[13px] font-semibold text-danger">
          {estado.erro}
        </p>
      ) : null}

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          block
          onClick={() => setEditando(false)}
        >
          Cancelar
        </Button>
        <Button type="submit" block disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

/**
 * "12 de março de 1990". A coluna é `date` — dia de calendário, sem hora —,
 * então formatar com fuso a jogaria um dia para trás em metade do planeta. O
 * `T12:00` ancora a data no meio do dia, longe das duas bordas.
 */
function porExtenso(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${data}T12:00:00`));
}
