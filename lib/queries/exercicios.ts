import "server-only";

import { normalizarParaBusca } from "@/lib/domain/prescricao";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

/**
 * Um exercício pronto para exibir, venha do catálogo ou da lista própria do
 * personal. A origem viaja junto porque `workout_exercises.exercise_id` não
 * tem fk: sem `source` o id sozinho é ambíguo.
 */
export type ExercicioDisponivel = {
  id: string;
  source: Enums<"exercise_source">;
  name: string;
  muscle_group: Enums<"muscle_group">;
  equipment: Enums<"equipment">;
  is_bodyweight: boolean;
  is_unilateral: boolean;
  default_rest_seconds: number;
};

export type FiltroDeExercicio = {
  termo?: string;
  grupo?: Enums<"muscle_group">;
  equipamento?: Enums<"equipment">;
};

/** Teto de resultados devolvidos ao editor. Lista maior que isso não se lê. */
export const LIMITE_DA_BUSCA = 30;

/**
 * Busca no catálogo e nos exercícios próprios do personal, numa lista só.
 *
 * Grupo e equipamento filtram no banco. O nome é comparado em memória, sem
 * acento: `ilike` no Postgres ignora maiúscula mas não ignora acento, e o
 * personal digita "triceps". Com 117 exercícios de catálogo mais os próprios
 * de um personal, a lista filtrada cabe folgada numa página; quando o catálogo
 * crescer, isto vira um índice com `unaccent` no banco.
 */
export async function buscarExercicios(
  filtro: FiltroDeExercicio = {},
): Promise<ExercicioDisponivel[]> {
  const supabase = await createClient();
  const colunas =
    "id, name, muscle_group, equipment, is_bodyweight, is_unilateral, default_rest_seconds";

  let doCatalogo = supabase.from("exercises_catalog").select(colunas);
  let proprios = supabase.from("exercises").select(colunas);

  if (filtro.grupo) {
    doCatalogo = doCatalogo.eq("muscle_group", filtro.grupo);
    proprios = proprios.eq("muscle_group", filtro.grupo);
  }
  if (filtro.equipamento) {
    doCatalogo = doCatalogo.eq("equipment", filtro.equipamento);
    proprios = proprios.eq("equipment", filtro.equipamento);
  }

  // As duas origens em paralelo: são consultas independentes, e o editor
  // espera pelas duas de qualquer jeito.
  const [catalogo, custom] = await Promise.all([
    doCatalogo.order("name"),
    proprios.order("name"),
  ]);

  if (catalogo.error) throw catalogo.error;
  // A lista própria é opcional (M2 ainda vai criar a tela); se der erro de
  // permissão aqui, o catálogo sozinho já serve o editor.
  const lista: ExercicioDisponivel[] = [
    ...(catalogo.data ?? []).map((e) => ({ ...e, source: "catalog" as const })),
    ...(custom.data ?? []).map((e) => ({ ...e, source: "custom" as const })),
  ];

  const termo = normalizarParaBusca(filtro.termo ?? "");
  const filtrada = termo
    ? lista.filter((e) => normalizarParaBusca(e.name).includes(termo))
    : lista;

  return filtrada
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, LIMITE_DA_BUSCA);
}

/** Referência a um exercício, do jeito que `workout_exercises` guarda. */
export type ReferenciaDeExercicio = {
  exercise_id: string;
  exercise_source: Enums<"exercise_source">;
};

/** Chave estável para o mapa: o id sozinho não distingue as duas origens. */
export function chaveDoExercicio(ref: ReferenciaDeExercicio): string {
  return `${ref.exercise_source}:${ref.exercise_id}`;
}

/**
 * Resolve um lote de referências para os dados de exibição.
 *
 * Duas consultas no total — uma por origem —, nunca uma por exercício. É aqui
 * que a ausência de fk em `exercise_id` é paga.
 */
export async function exerciciosPorReferencia(
  refs: ReferenciaDeExercicio[],
): Promise<Map<string, ExercicioDisponivel>> {
  const mapa = new Map<string, ExercicioDisponivel>();
  if (refs.length === 0) return mapa;

  const supabase = await createClient();
  const colunas =
    "id, name, muscle_group, equipment, is_bodyweight, is_unilateral, default_rest_seconds";

  const idsCatalogo = [
    ...new Set(refs.filter((r) => r.exercise_source === "catalog").map((r) => r.exercise_id)),
  ];
  const idsProprios = [
    ...new Set(refs.filter((r) => r.exercise_source === "custom").map((r) => r.exercise_id)),
  ];

  const [catalogo, custom] = await Promise.all([
    idsCatalogo.length
      ? supabase.from("exercises_catalog").select(colunas).in("id", idsCatalogo)
      : null,
    idsProprios.length
      ? supabase.from("exercises").select(colunas).in("id", idsProprios)
      : null,
  ]);

  for (const linha of catalogo?.data ?? []) {
    mapa.set(chaveDoExercicio({ exercise_id: linha.id, exercise_source: "catalog" }), {
      ...linha,
      source: "catalog",
    });
  }
  for (const linha of custom?.data ?? []) {
    mapa.set(chaveDoExercicio({ exercise_id: linha.id, exercise_source: "custom" }), {
      ...linha,
      source: "custom",
    });
  }

  return mapa;
}

/** Um exercício próprio, com quantas prescrições o usam hoje. */
export type ExercicioProprio = ExercicioDisponivel & {
  source: "custom";
  em_uso: number;
};

/**
 * Os exercícios do personal logado, com a contagem de prescrições que apontam
 * para cada um.
 *
 * A contagem existe por causa de um buraco do schema: `workout_exercises`
 * guarda `exercise_id` **sem fk** (a coluna aponta ora para o catálogo, ora
 * para cá, conforme `exercise_source`). Apagar um exercício em uso não é
 * barrado pelo banco — a linha da prescrição fica órfã, e `lerTreino` a pula.
 * Então a tela precisa avisar antes, e para avisar precisa do número.
 *
 * Uma consulta para os exercícios e uma para as prescrições, agrupadas em
 * memória: com dezenas de exercícios próprios, contar por linha seria N+1.
 */
export async function listarExerciciosProprios(): Promise<ExercicioProprio[]> {
  const supabase = await createClient();

  const { data: proprios, error } = await supabase
    .from("exercises")
    .select(
      "id, name, muscle_group, equipment, is_bodyweight, is_unilateral, default_rest_seconds",
    )
    .order("name");

  if (error) throw error;
  if (!proprios?.length) return [];

  // O RLS de `workout_exercises` já restringe ao que o personal enxerga, então
  // o filtro por origem e id basta.
  const { data: usos, error: erroUsos } = await supabase
    .from("workout_exercises")
    .select("exercise_id")
    .eq("exercise_source", "custom")
    .in(
      "exercise_id",
      proprios.map((e) => e.id),
    );

  if (erroUsos) throw erroUsos;

  const contagem = new Map<string, number>();
  for (const uso of usos ?? []) {
    contagem.set(uso.exercise_id, (contagem.get(uso.exercise_id) ?? 0) + 1);
  }

  return proprios
    .map((e) => ({
      ...e,
      source: "custom" as const,
      em_uso: contagem.get(e.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** O catálogo base inteiro, para a lista única da tela de exercícios. */
export async function listarCatalogo(): Promise<ExercicioDisponivel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises_catalog")
    .select(
      "id, name, muscle_group, equipment, is_bodyweight, is_unilateral, default_rest_seconds",
    )
    .order("name");

  if (error) throw error;
  return (data ?? []).map((e) => ({ ...e, source: "catalog" as const }));
}
