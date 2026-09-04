"use client";

import { useActionState, useState } from "react";

import { Button, Dialog, Input, Select } from "@/components/ui";
import type { ExercicioProprio } from "@/lib/queries/exercicios";
import { EQUIPAMENTO, GRUPO_MUSCULAR } from "@/lib/rotulos";

import { salvarExercicio, type EstadoExercicio } from "./actions";

const INICIAL: EstadoExercicio = {};

export function DialogoDeExercicio({
  aberto,
  exercicio,
  aoFechar,
}: {
  aberto: boolean;
  exercicio: ExercicioProprio | null;
  aoFechar: () => void;
}) {
  const [estado, acao, enviando] = useActionState(salvarExercicio, INICIAL);

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto já usa no onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) aoFechar();
  }

  if (!aberto) return null;

  const editando = exercicio !== null;

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={editando ? "Editar exercício" : "Novo exercício"}
      descricao={
        editando
          ? "Alterar aqui muda o exercício em todos os treinos que já usam ele."
          : "Ele passa a aparecer na busca do editor de treino, junto com o catálogo."
      }
    >
      {/* `key` remonta o formulário ao trocar de exercício: sem isso, o
          defaultValue do anterior fica na tela. */}
      <form
        key={exercicio?.id ?? "novo"}
        action={acao}
        noValidate
        className="space-y-4"
      >
        {editando && <input type="hidden" name="id" value={exercicio.id} />}

        <Input
          label="Nome"
          name="nome"
          autoComplete="off"
          placeholder="Ex.: Remada cavalinho"
          defaultValue={exercicio?.name ?? estado.campos?.nome}
          error={estado.errosPorCampo?.nome}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Grupo muscular"
            name="grupo"
            defaultValue={exercicio?.muscle_group ?? estado.campos?.grupo ?? ""}
            error={estado.errosPorCampo?.grupo}
          >
            <option value="">Escolha…</option>
            {Object.entries(GRUPO_MUSCULAR).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>

          <Select
            label="Equipamento"
            name="equipamento"
            defaultValue={
              exercicio?.equipment ?? estado.campos?.equipamento ?? ""
            }
            error={estado.errosPorCampo?.equipamento}
          >
            <option value="">Escolha…</option>
            {Object.entries(EQUIPAMENTO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Descanso padrão (segundos)"
          name="descanso"
          type="number"
          inputMode="numeric"
          placeholder="60"
          defaultValue={
            exercicio?.default_rest_seconds ?? estado.campos?.descanso ?? "60"
          }
          error={estado.errosPorCampo?.descanso}
          hint="É só a sugestão inicial: no treino você ajusta por exercício."
        />

        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              name="peso_corporal"
              defaultChecked={exercicio?.is_bodyweight}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />
            <span className="text-[13px] leading-[1.5] text-ink-2">
              Peso corporal
              <span className="block text-[12px] text-ink-4">
                A tela de execução não pede carga, só repetições.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              name="unilateral"
              defaultChecked={exercicio?.is_unilateral}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />
            <span className="text-[13px] leading-[1.5] text-ink-2">
              Unilateral
              <span className="block text-[12px] text-ink-4">
                Feito um lado de cada vez.
              </span>
            </span>
          </label>
        </div>

        {estado.erro && (
          <p
            role="alert"
            className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
          >
            {estado.erro}
          </p>
        )}

        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="secondary" block onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" block disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
