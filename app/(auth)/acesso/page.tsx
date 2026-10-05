import type { Metadata } from "next";

import { TEXTOS_DA_AUTENTICACAO } from "@/lib/i18n/autenticacao";
import { idiomaAtual } from "@/lib/i18n/idioma-atual";

import { FormularioLogin } from "../entrar/formulario-login";

export const metadata: Metadata = {
  description: "Entre no app com o seu e-mail e a sua senha.",
};

/**
 * Entrada do aluno: e-mail e senha (pedido do Otávio, 02/10).
 *
 * Até aqui a tela abria com um botão "Entrar com senha" que levava a `/entrar`
 * e, embaixo, o link por e-mail. A senha já era a ação que sempre funciona — o
 * aluno a cria no onboarding do convite, e o link depende de o e-mail chegar
 * enquanto ele está na academia. Agora ela é a tela inteira; quem esqueceu a
 * senha tem "Esqueci minha senha", que manda o link pelo mesmo SMTP.
 *
 * `?proximo` chega do `proxy.ts` quando o aluno abre um endereço do app sem
 * sessão, e é por ele que entrar o devolve ao treino que estava abrindo.
 */
export default async function AcessoPage({
  searchParams,
}: PageProps<"/acesso">) {
  const { proximo, erro, lang } = await searchParams;
  const t = TEXTOS_DA_AUTENTICACAO[
    await idiomaAtual(typeof lang === "string" ? lang : undefined)
  ];

  return (
    <FormularioLogin
      para="aluno"
      proximo={typeof proximo === "string" ? proximo : undefined}
      aviso={erro === "sem-perfil" ? t.avisos.semPerfilAluno : undefined}
      textos={t.login}
    />
  );
}
