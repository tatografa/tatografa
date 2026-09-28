import type { Metadata } from "next";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { TelaDeConfiguracoes } from "./tela-de-configuracoes";

export const metadata: Metadata = { title: "Configurações" };

/**
 * Configurações do personal (doc 06, no layout do protótipo desde 28/09):
 * perfil, alerta de inatividade e segurança.
 *
 * O e-mail mostrado é o de `auth.users`, e não `trainers.email`: é o login, e
 * a tela diz isso. A cópia em `trainers` nasce igual pelo gatilho de cadastro,
 * mas é a de `auth.users` que o personal digita para entrar.
 */
export default async function Configuracoes() {
  const { trainer } = await requireTrainer();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TelaDeConfiguracoes
      nome={trainer.name}
      email={user?.email ?? trainer.email}
      telefone={trainer.phone}
      diasParaAlerta={trainer.dias_para_alerta}
    />
  );
}
