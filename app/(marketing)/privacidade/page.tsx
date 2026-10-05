import { PaginaDeDocumento } from "@/components/pagina-de-documento";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

export default async function PrivacidadePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  return <PaginaDeDocumento slug="privacidade" idioma={await idiomaAtual(lang)} />;
}
