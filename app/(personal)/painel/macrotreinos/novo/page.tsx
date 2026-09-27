import type { Metadata } from "next";
import Link from "next/link";

import { Button, Card } from "@/components/ui";
import { diaLocal } from "@/lib/domain/fuso";
import { listarProgramasPorAluno } from "@/lib/queries/macrotreinos";

import { FormularioDePrograma, type AlunoDaEscolha } from "../formulario-de-programa";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";

export const metadata: Metadata = { title: "Novo programa" };

export default async function NovoProgramaPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const { aluno } = await searchParams;
  const porAluno = await listarProgramasPorAluno();

  if (porAluno.length === 0) return <SemAluno />;

  const alunos: AlunoDaEscolha[] = porAluno.map((linha) => ({
    id: linha.aluno.id,
    name: linha.aluno.name,
    temProgramaAtivo: linha.ativo !== null,
  }));

  return (
    <div className="space-y-8">
      <CabecalhoDaPagina
        titulo="Novo programa"
        subtitulo="O guarda-chuva dos treinos A, B, C — a semana atual sai da data de início"
        voltar={{ href: "/painel/macrotreinos", rotulo: "Voltar para macrotreinos" }}
      />

      {/*
        `hoje` é calculado no servidor, no fuso do produto: o valor padrão do
        campo de data precisa ser o dia do Brasil, não o do relógio do
        navegador nem o UTC do processo.
      */}
      <FormularioDePrograma
        alunos={alunos}
        alunoInicial={aluno}
        hoje={diaLocal(new Date())}
      />
    </div>
  );
}

function SemAluno() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Convide um aluno primeiro
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Todo macrotreino pertence a um aluno. Gere um convite no painel e volte aqui
          quando ele tiver entrado.
        </p>
      </div>
      <Link href="/painel">
        <Button>Convidar aluno</Button>
      </Link>
    </Card>
  );
}
