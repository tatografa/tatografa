"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button, Card, Input, Select } from "@/components/ui";

import {
  criarPrograma,
  salvarPrograma,
  type EstadoDoPrograma,
} from "./actions";

export type AlunoDaEscolha = { id: string; name: string; temProgramaAtivo: boolean };

export type FormularioDeProgramaProps = {
  /** Presente só na criação: a lista de alunos da carteira. */
  alunos?: AlunoDaEscolha[];
  alunoInicial?: string;
  /** Presente só na edição. */
  programa?: {
    id: string;
    nome: string;
    semanas: number;
    inicio: string;
    aluno: string;
  };
  /** Hoje no fuso do produto, calculado no servidor. */
  hoje: string;
};

const INICIAL: EstadoDoPrograma = {};

export function FormularioDePrograma({
  alunos = [],
  alunoInicial,
  programa,
  hoje,
}: FormularioDeProgramaProps) {
  const [estado, acao, enviando] = useActionState(
    programa ? salvarPrograma : criarPrograma,
    INICIAL,
  );

  const [alunoId, setAlunoId] = useState(alunoInicial ?? alunos[0]?.id ?? "");
  const [nome, setNome] = useState(programa?.nome ?? "");
  const [semanas, setSemanas] = useState(String(programa?.semanas ?? 8));
  const [inicio, setInicio] = useState(programa?.inicio ?? hoje);

  const escolhido = alunos.find((aluno) => aluno.id === alunoId);

  return (
    <form action={acao} noValidate className="max-w-xl space-y-6">
      {programa && <input type="hidden" name="programaId" value={programa.id} />}

      <Card size="lg" className="space-y-5">
        {programa ? (
          <div>
            <p className="eyebrow text-ink-4">Aluno</p>
            <p className="mt-1 text-[14.5px] font-bold text-ink">{programa.aluno}</p>
            {/* Trocar o aluno de um programa salvo moveria treino e histórico
                de carteira. Para outro aluno, outro programa. */}
          </div>
        ) : (
          <Select
            label="Aluno"
            name="alunoId"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            error={estado.errosPorCampo?.aluno}
          >
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.name}
              </option>
            ))}
          </Select>
        )}

        <Input
          label="Nome do programa"
          name="nome"
          placeholder="Hipertrofia — bloco 1"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={estado.errosPorCampo?.nome}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Duração (semanas)"
            name="semanas"
            type="number"
            inputMode="numeric"
            min={1}
            max={52}
            value={semanas}
            onChange={(e) => setSemanas(e.target.value)}
            error={estado.errosPorCampo?.semanas}
          />
          <Input
            label="Início"
            name="inicio"
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            error={estado.errosPorCampo?.inicio}
            hint="A semana 1 começa nesse dia."
          />
        </div>

        {/* O aviso aparece antes do clique, não depois: criar um programa para
            quem já tem um arquiva o atual, e o aluno passa a ver os treinos
            deste. Não é destrutivo — mas muda o que ele abre na academia. */}
        {!programa && escolhido?.temProgramaAtivo && (
          <p className="rounded-card border border-warning/30 bg-warning-bg px-3.5 py-3 text-[12.5px] leading-[1.5] text-ink-2">
            <strong className="font-bold">{primeiroNome(escolhido.name)} já tem um
            programa ativo.</strong>{" "}
            Criar este arquiva o outro: os treinos antigos saem da tela dele e
            entram os deste programa. Nada é apagado, e dá para reativar depois.
          </p>
        )}
      </Card>

      {estado.erro && (
        <p
          role="alert"
          className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/painel/macrotreinos"
          className="text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={enviando || (!programa && !alunoId)}>
          {enviando ? "Salvando…" : programa ? "Salvar programa" : "Criar programa"}
        </Button>
      </div>
    </form>
  );
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
