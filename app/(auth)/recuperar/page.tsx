import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { FormularioRecuperar } from "./formulario-recuperar";

export default async function RecuperarPage({
  searchParams,
}: PageProps<"/recuperar">) {
  const { lang } = await searchParams;
  const t = TEXTOS_DA_AUTENTICACAO[
    await idiomaAtual(typeof lang === "string" ? lang : undefined)
  ];
  return <FormularioRecuperar textos={t.recuperar} />;
}
