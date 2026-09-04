import type { Metadata } from "next";

import { requireTrainer } from "@/lib/auth/session";
import {
  listarCatalogo,
  listarExerciciosProprios,
} from "@/lib/queries/exercicios";

import { TelaDeExercicios } from "./tela-de-exercicios";

export const metadata: Metadata = { title: "Exercícios" };

/**
 * Catálogo base e exercícios próprios numa lista só (doc 06).
 *
 * As duas origens vêm separadas do banco e juntas na tela porque é assim que o
 * personal pensa — ele procura "supino inclinado", não "supino inclinado do
 * catálogo". O marcador visual distingue o que é dele.
 */
export default async function ExerciciosPage() {
  await requireTrainer();

  const [catalogo, proprios] = await Promise.all([
    listarCatalogo(),
    listarExerciciosProprios(),
  ]);

  return <TelaDeExercicios catalogo={catalogo} proprios={proprios} />;
}
