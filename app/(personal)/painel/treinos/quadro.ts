/**
 * O estado dos cartões do quadro, e as contas sobre ele.
 *
 * Módulo neutro (sem `"use client"`): são tipos e funções puras, e o dia em que
 * uma rota de conferência precisar montar um quadro com props fixas, ela chama
 * daqui em vez de copiar.
 */

import type { ExercicioDisponivel } from "@/lib/queries/exercicios";
import type { TreinoDaDivisao } from "@/lib/queries/divisao";
import type { Enums } from "@/types/database";

import type { TreinoParaSalvar } from "./actions";

export type ItemDoQuadro = {
  /** Chave estável de React. Não vai para o banco. */
  chave: string;
  /** `workout_exercises.id`, só quando a linha já existe. */
  id?: string;
  exerciseId: string;
  source: Enums<"exercise_source">;
  nome: string;
  grupo: Enums<"muscle_group">;
  // Tudo texto enquanto se edita: número pela metade ("1" a caminho de "12")
  // e campo vazio são estados legítimos da digitação.
  sets: string;
  reps: string;
  rir: string;
  rest: string;
  technique: string;
  notes: string;
  /** Séries já executadas nesta linha. Remover leva o histórico junto. */
  seriesRegistradas: number;
};

export type DiaDoQuadro = {
  chave: string;
  /** `workouts.id`, só depois de salvo. */
  id?: string;
  label: string;
  nome: string;
  observacao: string;
  itens: ItemDoQuadro[];
  /**
   * Como o cartão estava na última vez que bateu com o banco. Comparar com o
   * atual é o que diz "alterado"; nulo = nunca foi salvo.
   */
  salvo: string | null;
};

export function diaDoServidor(treino: TreinoDaDivisao): DiaDoQuadro {
  const dia: DiaDoQuadro = {
    chave: treino.id,
    id: treino.id,
    label: treino.label,
    nome: treino.name,
    observacao: treino.notes ?? "",
    itens: treino.exercicios.map((e) => ({
      chave: e.id,
      id: e.id,
      exerciseId: e.exercicio.id,
      source: e.exercicio.source,
      nome: e.exercicio.name,
      grupo: e.exercicio.muscle_group,
      sets: String(e.sets),
      reps: e.reps_target,
      rir: e.rir_target ?? "",
      rest: String(e.rest_seconds),
      technique: e.technique ?? "",
      notes: e.notes ?? "",
      seriesRegistradas: e.series_registradas,
    })),
    salvo: null,
  };
  return { ...dia, salvo: retrato(dia) };
}

export function diaNovo(label: string): DiaDoQuadro {
  return {
    chave: `novo-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    nome: "",
    observacao: "",
    itens: [],
    salvo: null,
  };
}

export function itemNovo(exercicio: ExercicioDisponivel): ItemDoQuadro {
  return {
    chave: `novo-${exercicio.source}-${exercicio.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    exerciseId: exercicio.id,
    source: exercicio.source,
    nome: exercicio.name,
    grupo: exercicio.muscle_group,
    sets: "3",
    reps: "10",
    rir: "",
    rest: String(exercicio.default_rest_seconds),
    technique: "",
    notes: "",
    seriesRegistradas: 0,
  };
}

/**
 * O que importa comparar num cartão. Fica de fora o que não é dado — a chave de
 * React e a contagem de séries, que muda sem o personal mexer em nada.
 */
export function retrato(dia: DiaDoQuadro): string {
  return JSON.stringify([
    dia.label,
    dia.nome.trim(),
    dia.observacao.trim(),
    dia.itens.map((i) => [
      i.id ?? null,
      i.exerciseId,
      i.source,
      i.sets.trim(),
      i.reps.trim(),
      i.rir.trim(),
      i.rest.trim(),
      i.technique.trim(),
      i.notes.trim(),
    ]),
  ]);
}

/** Cartão novo que ninguém tocou: não é alteração, é espaço reservado. */
export function estaEmBranco(dia: DiaDoQuadro): boolean {
  return !dia.id && dia.nome.trim() === "" && dia.itens.length === 0;
}

export function foiAlterado(dia: DiaDoQuadro): boolean {
  if (estaEmBranco(dia)) return false;
  return dia.salvo === null || dia.salvo !== retrato(dia);
}

export function paraSalvar(programaId: string, dia: DiaDoQuadro): TreinoParaSalvar {
  return {
    programaId,
    treinoId: dia.id,
    label: dia.label,
    nome: dia.nome,
    observacao: dia.observacao || null,
    exercicios: dia.itens.map((i) => ({
      id: i.id,
      exerciseId: i.exerciseId,
      source: i.source,
      sets: paraNumero(i.sets) as number,
      reps: i.reps,
      rir: i.rir || null,
      rest: paraNumero(i.rest) as number,
      technique: i.technique || null,
      notes: i.notes || null,
    })),
  };
}

/** Campo numérico vazio vira `null`, para o zod dizer "informe" em português. */
function paraNumero(bruto: string): number | null {
  if (bruto.trim() === "") return null;
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : null;
}
