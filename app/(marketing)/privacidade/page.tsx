import type { Metadata } from "next";

import { PaginaDeDocumento } from "@/components/pagina-de-documento";
import { PRIVACIDADE } from "@/lib/legal/privacidade";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return <PaginaDeDocumento documento={PRIVACIDADE} />;
}
