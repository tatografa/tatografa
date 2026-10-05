import { PaginaDeDocumento } from "@/components/pagina-de-documento";
import { TERMOS } from "@/lib/legal/termos";

export default function TermosPage() {
  return <PaginaDeDocumento documento={TERMOS} />;
}
