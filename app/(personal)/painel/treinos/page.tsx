import Link from "next/link";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { Card, classesDeBotao } from "@/components/ui";
import { diaLocal } from "@/lib/domain/fuso";
import { lerDivisaoDeTreino } from "@/lib/queries/divisao";

import { DivisaoDeTreino } from "./divisao-de-treino";

/**
 * "Divisão de treino" — a tela do protótipo que juntou macrotreinos e treinos
 * (27/09). À esquerda, o aluno, o programa e os dias; à direita, um cartão por
 * treino, lado a lado.
 *
 * Aluno e programa vão na URL, e não em estado da tela: o link do programa de
 * alguém pode ser aberto de outra aba, colado numa conversa e recarregado sem
 * perder onde se estava.
 */
export default async function TreinosPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string; programa?: string; novo?: string }>;
}) {
  const { aluno, programa, novo } = await searchParams;
  const divisao = await lerDivisaoDeTreino({ alunoId: aluno, programaId: programa });

  if (!divisao.aluno) {
    return (
      <>
        <CabecalhoDaPagina
          titulo="Divisão de treino"
          subtitulo="Monte o macrociclo de treinos dos seus alunos"
        />
        <SemAluno />
      </>
    );
  }

  return (
    <DivisaoDeTreino
      // Trocar de aluno ou de programa monta a tela de novo: o estado dos
      // cartões é do programa, e herdá-lo de outro misturaria dois treinos.
      key={`${divisao.aluno.id}:${divisao.programa?.id ?? "sem"}`}
      divisao={divisao}
      hoje={diaLocal(new Date())}
      abrirNovo={novo === "1" || !divisao.programa}
    />
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
          Todo treino pertence a um aluno. Gere um convite no painel e volte aqui
          quando ele tiver entrado.
        </p>
      </div>
      <Link href="/painel" className={classesDeBotao()}>
        Convidar aluno
      </Link>
    </Card>
  );
}
