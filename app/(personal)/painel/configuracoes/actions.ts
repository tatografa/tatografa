"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITES_DO_ALERTA } from "@/lib/domain/atencao";
import { erroDaSenha } from "@/lib/domain/senha";
import { telefoneOpcionalCom } from "@/lib/domain/telefone";
import { traduzErro } from "@/lib/auth/mensagens";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { preencher } from "@/lib/i18n/texto";
import { createClient } from "@/lib/supabase/server";

export type EstadoDasConfiguracoes = {
  erro?: string;
  errosPorCampo?: Partial<Record<"dias", string>>;
  campos?: { dias?: string };
  sucesso?: boolean;
};

/** O texto das três ações no idioma do painel; os esquemas são montados por chamada. */
async function textos() {
  const { idioma, t } = await textosDoPainel();
  return { idioma, e: t.configuracoes.erros };
}

/*
 * A mesma faixa que o `check` da migration 0014 aplica. Aqui a validação existe
 * para dar a mensagem na língua de quem enviou; lá ela existe porque um POST
 * direto não passa por formulário nenhum.
 */
function esquema(e: Awaited<ReturnType<typeof textos>>["e"]) {
  return z.object({
    dias: z.coerce
      .number({ error: e.informeDias })
      .int(e.diasInteiro)
      .min(LIMITES_DO_ALERTA.minimo, preencher(e.diasMin, { n: LIMITES_DO_ALERTA.minimo }))
      .max(LIMITES_DO_ALERTA.maximo, preencher(e.diasMax, { n: LIMITES_DO_ALERTA.maximo })),
  });
}

/**
 * Salva o limiar de inatividade do personal logado.
 *
 * Não recebe id de personal: o alvo é sempre `auth.uid()`. Aceitar um id do
 * formulário abriria a porta para editar o ajuste de outro personal — e o
 * `trainers_update` barraria, mas a porta não deveria existir.
 */
export async function salvarConfiguracoes(
  _anterior: EstadoDasConfiguracoes,
  dados: FormData,
): Promise<EstadoDasConfiguracoes> {
  const { trainer } = await requireTrainer();

  const { e } = await textos();
  const bruto = { dias: String(dados.get("dias") ?? "") };
  const analise = esquema(e).safeParse(bruto);

  if (!analise.success) {
    const { fieldErrors } = z.flattenError(analise.error);
    return {
      campos: bruto,
      errosPorCampo: { dias: fieldErrors.dias?.[0] },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainers")
    .update({ dias_para_alerta: analise.data.dias })
    .eq("id", trainer.id);

  if (error) {
    return { campos: bruto, erro: e.falhaSalvar };
  }

  // O painel mostra o limiar na linha de ajuste e o usa para montar os alertas.
  revalidatePath("/painel");
  revalidatePath("/painel/configuracoes");

  return { sucesso: true };
}

export type EstadoDoPerfil = {
  erro?: string;
  errosPorCampo?: Partial<Record<"nome" | "telefone", string>>;
  campos?: { nome?: string; telefone?: string };
  sucesso?: boolean;
};

function esquemaDoPerfil(e: Awaited<ReturnType<typeof textos>>["e"]) {
  return z.object({
    nome: z.string().trim().min(2, e.informeNome).max(80, e.nomeLongo),
    telefone: telefoneOpcionalCom(e.telefone),
  });
}

/**
 * Salva o nome e o WhatsApp do personal — o cartão "Perfil" da tela.
 *
 * Os dois juntos porque o protótipo edita o perfil num gesto só, com um
 * "Editar" no cabeçalho. O **e-mail não vai**: é a identidade em
 * `auth.users` e o login, e muda por fluxo de confirmação, não por update de
 * linha — mesma regra do perfil do aluno (14/09). `trainers.email` até aceita
 * escrita pela policy, e é justamente por isso que o formulário não o envia:
 * as duas cópias do endereço sairiam de sincronia.
 *
 * `trainers.phone` existia desde a migration 0001 e ninguém escrevia nela até
 * 15/09: é o número do botão de WhatsApp no app do aluno. Vazio é resposta
 * válida — o personal que não quer dar o número fica sem o botão lá.
 *
 * Não recebe id: o alvo é sempre `auth.uid()`.
 */
export async function salvarPerfil(
  _anterior: EstadoDoPerfil,
  dados: FormData,
): Promise<EstadoDoPerfil> {
  const { trainer } = await requireTrainer();

  const bruto = {
    nome: String(dados.get("nome") ?? ""),
    telefone: String(dados.get("telefone") ?? ""),
  };
  const { e } = await textos();
  const analise = esquemaDoPerfil(e).safeParse(bruto);

  if (!analise.success) {
    const { fieldErrors } = z.flattenError(analise.error);
    return {
      campos: bruto,
      errosPorCampo: { nome: fieldErrors.nome?.[0], telefone: fieldErrors.telefone?.[0] },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("trainers")
    .update({ name: analise.data.nome, phone: analise.data.telefone })
    .eq("id", trainer.id);

  if (error) {
    return { campos: bruto, erro: e.falhaSalvar };
  }

  // "layout" e não a página: o nome aparece na navegação e no avatar de todo o
  // painel, e nome e número aparecem no app do aluno, que é outra árvore de
  // rotas — foi um `revalidatePath` de escopo errado que fez o Otávio não se
  // ver no seletor de alunos em 13/09.
  revalidatePath("/painel", "layout");
  revalidatePath("/app", "layout");
  return { sucesso: true };
}

export type EstadoDaSenha = {
  erro?: string;
  errosPorCampo?: Partial<Record<"atual" | "nova" | "confirmacao", string>>;
  sucesso?: boolean;
};

function esquemaDaSenha({ idioma, e }: Awaited<ReturnType<typeof textos>>) {
  return z.object({
    atual: z.string().min(1, e.informeAtual),
    nova: z.string().superRefine((valor, ctx) => {
      const erro = erroDaSenha(valor, idioma);
      if (erro) ctx.addIssue({ code: "custom", message: erro });
    }),
    confirmacao: z.string(),
  });
}

/**
 * Troca a senha de quem está logado, **pedindo a atual antes**.
 *
 * A sessão sozinha bastaria para o Supabase, e é por isso que a tela pede mais:
 * o painel roda no computador da academia e no notebook que fica aberto, e
 * quem sentar na frente de uma sessão esquecida não deve conseguir trancar o
 * dono fora da própria conta. A conferência é um `signInWithPassword` com o
 * e-mail **de `auth.users`** — não o de `trainers.email`, que é uma cópia e
 * poderia divergir —, e a regra de força é a mesma de todo lugar
 * (`lib/domain/senha.ts`, 17/09).
 *
 * As senhas nunca voltam no estado: formulário de senha que devolve o que foi
 * digitado põe a senha no payload da resposta.
 */
export async function trocarSenha(
  _anterior: EstadoDaSenha,
  dados: FormData,
): Promise<EstadoDaSenha> {
  await requireTrainer();
  const lingua = await textos();
  const { idioma, e } = lingua;

  const analise = esquemaDaSenha(lingua).safeParse({
    atual: String(dados.get("atual") ?? ""),
    nova: String(dados.get("nova") ?? ""),
    confirmacao: String(dados.get("confirmacao") ?? ""),
  });

  if (!analise.success) {
    const { fieldErrors } = z.flattenError(analise.error);
    return { errosPorCampo: { atual: fieldErrors.atual?.[0], nova: fieldErrors.nova?.[0] } };
  }
  if (analise.data.nova !== analise.data.confirmacao) {
    return { errosPorCampo: { confirmacao: e.diferentes } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { erro: e.sessaoTerminou };

  const conferencia = await supabase.auth.signInWithPassword({
    email: user.email,
    password: analise.data.atual,
  });
  if (conferencia.error) {
    // "E-mail ou senha incorretos" seria estranho aqui: o e-mail não foi
    // digitado. Excesso de tentativas continua com a frase dele.
    return /invalid login credentials/i.test(conferencia.error.message)
      ? { errosPorCampo: { atual: e.atualErrada } }
      : { erro: traduzErro(conferencia.error.message, idioma) };
  }

  const { error } = await supabase.auth.updateUser({ password: analise.data.nova });
  if (error) return { erro: traduzErro(error.message, idioma) };

  return { sucesso: true };
}
