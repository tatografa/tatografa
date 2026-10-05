import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { EscolhaDeIdioma } from "@/components/escolha-de-idioma";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";

import { TelaDeConfiguracoes } from "./tela-de-configuracoes";

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

  // O seletor de idioma é o mesmo do perfil do aluno, e é componente servidor:
  // vai pronto para a tela, que é cliente.
  return (
    <TelaDeConfiguracoes
      idioma={<EscolhaDoIdiomaDoPainel />}
      nome={trainer.name}
      email={user?.email ?? trainer.email}
      telefone={trainer.phone}
      diasParaAlerta={trainer.dias_para_alerta}
    />
  );
}

async function EscolhaDoIdiomaDoPainel() {
  const { idioma, t } = await textosDoPainel();
  return (
    <EscolhaDeIdioma
      idioma={idioma}
      rotulo={t.configuracoes.idioma.titulo}
      caminho="/painel/configuracoes"
    />
  );
}
