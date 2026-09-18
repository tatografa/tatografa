"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Input, Select } from "@/components/ui";
import { UFS } from "@/lib/domain/perfil";
import { formatarTelefone } from "@/lib/domain/telefone";
import { NIVEL, OBJETIVO, PERFIL_BIOLOGICO } from "@/lib/rotulos";
import type { Tables } from "@/types/database";

import { salvarPerfil, type EstadoDoPerfil } from "./actions";

const INICIAL: EstadoDoPerfil = {};

type Aluno = Pick<
  Tables<"students">,
  | "name" | "email" | "birth_date" | "goal" | "experience_level"
  | "weight_kg" | "height_cm"
  | "phone" | "city" | "state" | "biological_profile" | "weight_goal_kg"
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
      {
        rotulo: "Meta de peso",
        valor: aluno.weight_goal_kg
          ? `${Number(aluno.weight_goal_kg)} kg`
          : "Não informado",
      },
      {
        rotulo: "Telefone",
        valor: aluno.phone ? formatarTelefone(aluno.phone) : "Não informado",
      },
      {
        rotulo: "Cidade",
        valor: aluno.city
          ? [aluno.city, aluno.state].filter(Boolean).join(" · ")
          : "Não informado",
      },
      {
        rotulo: "Perfil biológico",
        valor: aluno.biological_profile
          ? PERFIL_BIOLOGICO[aluno.biological_profile]
          : "Não informado",
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Meta de peso (kg)"
          name="metaDePeso"
          type="number"
          inputMode="decimal"
          step="0.1"
          defaultValue={
            aluno.weight_goal_kg ? String(Number(aluno.weight_goal_kg)) : ""
          }
          error={estado.errosPorCampo?.metaDePeso}
        />
        <Input
          label="Telefone"
          name="telefone"
          type="tel"
          inputMode="tel"
          placeholder="(11) 99999-9999"
          defaultValue={aluno.phone ? formatarTelefone(aluno.phone) : ""}
          error={estado.errosPorCampo?.telefone}
        />
      </div>

      <div className="grid grid-cols-[1fr_88px] gap-3">
        <Input
          label="Cidade"
          name="cidade"
          defaultValue={aluno.city ?? ""}
          error={estado.errosPorCampo?.cidade}
        />
        <Select
          label="UF"
          name="uf"
          defaultValue={aluno.state ?? ""}
          error={estado.errosPorCampo?.uf}
        >
          <option value="">—</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </div>

      {/*
        O perfil biológico é dado de saúde sensível, e a tela precisa dizer isso
        do lado do campo — não só na política. Sem a frase, o aluno escolhe
        "Reposição" sem saber quem lê; com ela, escolher em branco é uma decisão
        informada, e em branco é um estado final legítimo.
      */}
      <div className="space-y-2">
        <Select
          label="Perfil biológico (opcional)"
          name="perfilBiologico"
          defaultValue={aluno.biological_profile ?? ""}
          error={estado.errosPorCampo?.perfilBiologico}
        >
          <option value="">Prefiro não informar</option>
          {Object.entries(PERFIL_BIOLOGICO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </Select>
        <p className="text-[12px] leading-relaxed text-ink-4">
          Isso é informação de saúde. Só você e o seu personal veem, e a resposta
          do corpo ao treino muda com ela — por isso perguntamos. Deixar em
          branco é uma resposta, e nada no app deixa de funcionar.
        </p>
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
