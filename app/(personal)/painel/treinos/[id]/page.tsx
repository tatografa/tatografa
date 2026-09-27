import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { lerTreino } from "@/lib/queries/treinos";

import { EditorDeTreino, type ItemDoEditor } from "../editor-de-treino";

import { BotaoDuplicarTreino } from "./botao-duplicar";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";

export const metadata: Metadata = { title: "Editar treino" };

export default async function EditarTreinoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const [{ id }, { salvo }] = await Promise.all([params, searchParams]);

  const treino = await lerTreino(id);
  // `lerTreino` devolve nulo tanto para id inexistente quanto para treino de
  // outro personal: os dois casos são "não existe" para quem está olhando.
  if (!treino) notFound();

  const itens: ItemDoEditor[] = treino.exercicios.map((exercicio) => ({
    chave: exercicio.id,
    id: exercicio.id,
    exerciseId: exercicio.exercicio.id,
    source: exercicio.exercicio.source,
    nome: exercicio.exercicio.name,
    grupo: exercicio.exercicio.muscle_group,
    equipamento: exercicio.exercicio.equipment,
    sets: String(exercicio.sets),
    reps: exercicio.reps_target,
    rest: String(exercicio.rest_seconds),
    technique: exercicio.technique ?? "",
    notes: exercicio.notes ?? "",
    seriesRegistradas: exercicio.series_registradas,
  }));

  return (
    <div className="space-y-8">
      {/*
        A volta é para **o programa**, não para a lista geral de treinos.
        Descoberto no teste de campo: depois de montar o treino B, a única
        coisa visível nesta tela era "+ adicionar exercício", e o caminho para
        montar o C — que existe em `/painel/macrotreinos/<id>` — ficava a duas
        navegações de distância de onde o fluxo larga o personal. O programa já
        estava em mãos aqui; faltava usá-lo.
      */}
      <CabecalhoDaPagina
        titulo={`${treino.label} · ${treino.name}`}
        subtitulo={`${treino.aluno.name} · ${treino.total_series} séries · ~${treino.duracao_min} min`}
        voltar={{
          href: `/painel/macrotreinos/${treino.macrotreino.id}`,
          rotulo: `Voltar para ${treino.macrotreino.name}`,
        }}
        acoes={
          /*
            Duplicar mora aqui e não na lista de treinos: lá cada linha é um
            `<Link>` inteiro, e um botão dentro de um link é aninhamento
            inválido — o clique ficaria disputado entre os dois. Aqui o
            personal já está olhando o treino que quer copiar.
          */
          <BotaoDuplicarTreino
            treinoId={treino.id}
            programaId={treino.macrotreino.id}
            label={treino.label}
            nome={treino.name}
          />
        }
      />

      {/*
        O programa vem do próprio treino, não de uma consulta ao programa ativo
        do aluno: um treino de programa arquivado continua editável, e buscar "o
        ativo" mostraria o nome do programa errado no cabeçalho do editor.
      */}
      <EditorDeTreino
        programa={{
          id: treino.macrotreino.id,
          name: treino.macrotreino.name,
          total_weeks: treino.macrotreino.total_weeks,
          aluno: treino.aluno,
        }}
        salvo={salvo === "1"}
        treino={{
          id: treino.id,
          label: treino.label,
          nome: treino.name,
          observacao: treino.notes ?? "",
          itens,
        }}
      />
    </div>
  );
}
