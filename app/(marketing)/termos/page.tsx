import type { Metadata } from "next";

import { PaginaDeDocumento } from "@/components/pagina-de-documento";
import { TERMOS } from "@/lib/legal/termos";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return <PaginaDeDocumento documento={TERMOS} />;
}
