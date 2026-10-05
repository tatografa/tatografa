"use client";

import { useActionState, useState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog } from "@/components/ui";
import { plural, preencher } from "@/lib/i18n/texto";
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
  aoExcluir,
}: {
  exercicio: ExercicioProprio | null;
  aoFechar: () => void;
  /** Depois de apagar: a tela tira o exercício do painel de detalhes. */
  aoExcluir?: () => void;
}) {
  const [estado, acao, enviando] = useActionState(excluirExercicio, INICIAL);
  const { t } = usePainel();
  const x = t.exercicios.exclusao;

  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    // Sem erro depois de enviar = apagou.
    if (!estado.erro) (aoExcluir ?? aoFechar)();
  }

  if (!exercicio) return null;

  const emUso = exercicio.em_uso;

  return (
    <Dialog
      aberto
      aoFechar={aoFechar}
      titulo={preencher(x.titulo, { nome: exercicio.name })}
      descricao={emUso > 0 ? plural(emUso, x.emUso) : x.livre}
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
              {plural(emUso, x.entendi)}
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
            {t.comum.manter}
          </Button>
          <Button type="submit" variant="danger" block disabled={enviando}>
            {enviando ? x.excluindo : x.excluir}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
