import type { Metadata } from "next";

import { FormularioRecuperar } from "./formulario-recuperar";

export const metadata: Metadata = { title: "Recuperar acesso" };

export default function RecuperarPage() {
  return <FormularioRecuperar />;
}
