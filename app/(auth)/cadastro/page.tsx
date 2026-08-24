import type { Metadata } from "next";

import { FormularioCadastro } from "./formulario-cadastro";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return <FormularioCadastro />;
}
