import { PaginaDeDocumento } from "@/components/pagina-de-documento";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

export default async function TermosPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  return <PaginaDeDocumento slug="termos" idioma={await idiomaAtual(lang)} />;
}
