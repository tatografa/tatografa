import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button, Card } from "@/components/ui";
import { proximaLetraLivre } from "@/lib/domain/treino";
import { lerMacrotreino } from "@/lib/queries/macrotreinos";
import { letrasDoPrograma } from "@/lib/queries/treinos";

import { EditorDeTreino } from "../editor-de-treino";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";

export const metadata: Metadata = { title: "Novo treino" };

/**
 * Montar um treino dentro de um programa.
 *
 * O programa chega pela URL (`?programa=<id>`) porque desde o M2-01 todo treino
 * nasce dentro de um macrotreino: quem escolhe o aluno é `/painel/macrotreinos`.
 * A conferência de dono não fica só aqui — `salvarTreino` refaz a mesma
 * checagem no servidor, já que uma URL é palpite fácil.
 */
export default async function NovoTreinoPage({
  searchParams,
}: {
  searchParams: Promise<{ programa?: string }>;
}) {
  const { programa: programaId } = await searchParams;
  if (!programaId) return <SemPrograma />;

  const programa = await lerMacrotreino(programaId);
  // Nulo cobre id inexistente e programa de outro personal: os dois são "não
  // existe" para quem está olhando.
  if (!programa) notFound();

  if (programa.status !== "ativo") return <ProgramaArquivado nome={programa.name} />;

  // O campo "Letra" nascia com "A" fixo, então montar o treino B começava com a
  // letra do A na tela. A leitura é depois do 404 e do arquivado de propósito:
  // consultar letras de um programa que a tela não vai desenhar é trabalho à toa.
  const letraSugerida = proximaLetraLivre(await letrasDoPrograma(programa.id));

  return (
    <div className="space-y-8">
      <CabecalhoDaPagina
        titulo="Novo treino"
        subtitulo={`${programa.aluno.name} · ${programa.name}`}
        voltar={{ href: "/painel/macrotreinos", rotulo: "Voltar para macrotreinos" }}
      />

      <EditorDeTreino
        programa={{
          id: programa.id,
          name: programa.name,
          total_weeks: programa.total_weeks,
          aluno: programa.aluno,
        }}
        letraSugerida={letraSugerida}
      />
    </div>
  );
}

function SemPrograma() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Escolha o programa primeiro
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Todo treino pertence a um macrotreino. Abra o programa do aluno e monte o
          treino a partir dele.
        </p>
      </div>
      <Link href="/painel/macrotreinos">
        <Button>Ir para macrotreinos</Button>
      </Link>
    </Card>
  );
}

function ProgramaArquivado({ nome }: { nome: string }) {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          “{nome}” está arquivado
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          O aluno não vê os treinos de um programa arquivado. Ative o programa antes de
          montar treino nele — senão você monta e ninguém recebe.
        </p>
      </div>
      <Link href="/painel/macrotreinos">
        <Button>Ir para macrotreinos</Button>
      </Link>
    </Card>
  );
}
