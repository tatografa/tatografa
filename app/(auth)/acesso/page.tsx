import type { Metadata } from "next";

import { FormularioAcesso } from "./formulario-acesso";

export const metadata: Metadata = {
  title: "Entrar · Reps Club",
  description: "Receba um link de acesso no seu e-mail.",
};

/**
 * Entrada do aluno nos acessos seguintes (doc 02).
 *
 * Link mágico, não senha: "o aluno usa o app na academia, no meio do treino.
 * Senha esquecida ali é abandono garantido." A senha definida no onboarding
 * continua valendo como alternativa, em `/entrar`.
 */
export default async function AcessoPage({
  searchParams,
}: PageProps<"/acesso">) {
  const { erro } = await searchParams;

  return (
    <>
      {erro === "sem-perfil" && (
        <p
          role="alert"
          className="mb-5 rounded-[9px] bg-warning-bg px-3 py-2.5 text-[12.5px] font-semibold text-warning"
        >
          Sua conta não está ligada a nenhum personal. Peça um convite.
        </p>
      )}
      <FormularioAcesso />
    </>
  );
}
