import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { FormularioLogin } from "./formulario-login";

export default async function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  const { proximo, erro, lang } = await searchParams;
  const t = TEXTOS_DA_AUTENTICACAO[
    await idiomaAtual(typeof lang === "string" ? lang : undefined)
  ];

  const avisos: Record<string, string> = {
    "sem-perfil": t.avisos.semPerfilPersonal,
    "link-invalido": t.avisos.linkInvalido,
    "sessao-encerrada": t.avisos.sessaoEncerrada,
  };

  return (
    <FormularioLogin
      proximo={typeof proximo === "string" ? proximo : undefined}
      aviso={typeof erro === "string" ? avisos[erro] : undefined}
      textos={t.login}
    />
  );
}
