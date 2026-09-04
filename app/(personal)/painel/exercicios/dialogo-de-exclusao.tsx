"use client";

import { useActionState, useState } from "react";

import { Button, Dialog } from "@/components/ui";
import type { ExercicioProprio } from "@/lib/queries/exercicios";

import { excluirExercicio, type EstadoExclusao } from "./actions";

const INICIAL: EstadoExclusao = {};

/**
 * Excluir exercício próprio, com o aviso de uso.
 *
 * `workout_exercises.exercise_id` não tem fk, então o banco não impede apagar
 * um exercício que está numa prescrição: a linha vira órfã e some do treino do
 * aluno em silêncio. A contagem vem do servidor e a Server Action a confere de
 * novo — aqui é o aviso, lá é a trava.
 */
export function DialogoDeExclusao({
  exercicio,
  aoFechar,
}: {
  exercicio: ExercicioProprio | null;
  aoFechar: () => void;
}) {
  const [estado, acao, enviando] = useActionState(excluirExercicio, INICIAL);

  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    // Sem erro depois de enviar = apagou.
    if (!estado.erro) aoFechar();
  }

  if (!exercicio) return null;

  const emUso = exercicio.em_uso;
  const treinos = emUso === 1 ? "treino" : "treinos";

  return (
    <Dialog
      aberto
      aoFechar={aoFechar}
      titulo={`Excluir “${exercicio.name}”?`}
      descricao={
        emUso > 0
          ? `Ele está prescrito em ${emUso} ${treinos}. Excluir tira o exercício desses treinos — as séries que o aluno já registrou nele saem do histórico junto.`
          : "Ele não está em nenhum treino. Some da busca do editor e nada mais muda."
      }
    >
      <form action={acao} className="space-y-4">
        <input type="hidden" name="id" value={exercicio.id} />

        {emUso > 0 && (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-card bg-warning-bg px-3.5 py-3">
            <input
              type="checkbox"
              name="confirmado"
              className="mt-0.5 size-4 shrink-0 accent-danger"
            />
            <span className="text-[12.5px] leading-[1.5] text-ink-2">
              Entendi que {emUso} {treinos} {emUso === 1 ? "perde" : "perdem"}{" "}
              esse exercício.
            </span>
          </label>
        )}

        {estado.erro && (
          <p
            role="alert"
            className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
          >
            {estado.erro}
          </p>
        )}

        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" block onClick={aoFechar}>
            Manter
          </Button>
          <Button type="submit" variant="danger" block disabled={enviando}>
            {enviando ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
