import type { Metadata } from "next";

import { FormularioNovaSenha } from "./formulario-nova-senha";

export const metadata: Metadata = { title: "Criar nova senha" };

export default function NovaSenhaPage() {
  return <FormularioNovaSenha />;
}
