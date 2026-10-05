import { dicaDaSenha } from "@/lib/domain/senha";
import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { FormularioNovaSenha } from "./formulario-nova-senha";

export default async function NovaSenhaPage({
  searchParams,
}: PageProps<"/recuperar/nova-senha">) {
  const { lang } = await searchParams;
  const idioma = await idiomaAtual(typeof lang === "string" ? lang : undefined);
  return (
    <FormularioNovaSenha
      textos={TEXTOS_DA_AUTENTICACAO[idioma].novaSenha}
      dicaDaSenha={dicaDaSenha(idioma)}
    />
  );
}
