import type { Metadata } from "next";

import { listarProgramasPorAluno } from "@/lib/queries/macrotreinos";

import { ListaDeProgramas } from "./lista-de-programas";

export const metadata: Metadata = { title: "Macrotreinos" };

export default async function MacrotreinosPage() {
  const porAluno = await listarProgramasPorAluno();

  return <ListaDeProgramas porAluno={porAluno} />;
}
