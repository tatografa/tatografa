import type { Metadata } from "next";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Entrar" };

const AVISOS: Record<string, string> = {
  "sem-perfil":
    "Sua conta existe, mas não está ligada a um perfil de personal. Fale com quem te cadastrou.",
  "link-invalido": "Esse link expirou ou já foi usado. Peça outro.",
  "sessao-encerrada": "Sua sessão expirou. Entre de novo.",
};

export default async function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  const { proximo, erro } = await searchParams;

  return (
    <FormularioLogin
      proximo={typeof proximo === "string" ? proximo : undefined}
      aviso={typeof erro === "string" ? AVISOS[erro] : undefined}
    />
  );
}
