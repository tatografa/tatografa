import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";
import { dicaDaSenha } from "@/lib/domain/senha";

import { FormularioCadastro } from "./formulario-cadastro";

export default async function CadastroPage({
  searchParams,
}: PageProps<"/cadastro">) {
  const { lang } = await searchParams;
  const idioma = await idiomaAtual(typeof lang === "string" ? lang : undefined);
  const t = TEXTOS_DA_AUTENTICACAO[idioma];
  return (
    <FormularioCadastro
      textos={t.cadastro}
      aceite={t.aceite}
      dicaDaSenha={dicaDaSenha(idioma)}
    />
  );
}
