"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { LIMITES_DO_ALERTA } from "@/lib/domain/atencao";
import { erroDaSenha } from "@/lib/domain/senha";
import { telefoneOpcional } from "@/lib/domain/telefone";
import { traduzErro } from "@/lib/auth/mensagens";
import { createClient } from "@/lib/supabase/server";

export type EstadoDasConfiguracoes = {
  erro?: string;
  errosPorCampo?: Partial<Record<"dias", string>>;
  campos?: { dias?: string };
  sucesso?: boolean;
};

/*
 * A mesma faixa que o `check` da migration 0014 aplica. Aqui a validação existe
 * para dar mensagem em português; lá ela existe porque um POST direto não passa
 * por formulário nenhum.
 */
const esquema = z.object({
  dias: z.coerce
    .number({ error: "Informe um número de dias." })
    .int("Use um número inteiro de dias.")
    .min(
      LIMITES_DO_ALERTA.minimo,
      `O mínimo é ${LIMITES_DO_ALERTA.minimo} dia.`,
    )
    .max(
      LIMITES_DO_ALERTA.maximo,
      `O máximo é ${LIMITES_DO_ALERTA.maximo} dias.`,
    ),
});

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

  const bruto = { dias: String(dados.get("dias") ?? "") };
  const analise = esquema.safeParse(bruto);

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
    return { campos: bruto, erro: "Não deu para salvar agora. Tente de novo." };
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

const esquemaDoPerfil = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(80, "Use no máximo 80 caracteres."),
  telefone: telefoneOpcional,
});

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
  const analise = esquemaDoPerfil.safeParse(bruto);

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
    return { campos: bruto, erro: "Não deu para salvar agora. Tente de novo." };
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

const esquemaDaSenha = z.object({
  atual: z.string().min(1, "Informe a senha que você usa hoje."),
  nova: z.string().superRefine((valor, ctx) => {
    const erro = erroDaSenha(valor);
    if (erro) ctx.addIssue({ code: "custom", message: erro });
  }),
  confirmacao: z.string(),
});

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

  const analise = esquemaDaSenha.safeParse({
    atual: String(dados.get("atual") ?? ""),
    nova: String(dados.get("nova") ?? ""),
    confirmacao: String(dados.get("confirmacao") ?? ""),
  });

  if (!analise.success) {
    const { fieldErrors } = z.flattenError(analise.error);
    return { errosPorCampo: { atual: fieldErrors.atual?.[0], nova: fieldErrors.nova?.[0] } };
  }
  if (analise.data.nova !== analise.data.confirmacao) {
    return { errosPorCampo: { confirmacao: "As duas senhas novas precisam ser iguais." } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { erro: "Sua sessão terminou. Entre de novo para trocar a senha." };

  const conferencia = await supabase.auth.signInWithPassword({
    email: user.email,
    password: analise.data.atual,
  });
  if (conferencia.error) {
    // "E-mail ou senha incorretos" seria estranho aqui: o e-mail não foi
    // digitado. Excesso de tentativas continua com a frase dele.
    return /invalid login credentials/i.test(conferencia.error.message)
      ? { errosPorCampo: { atual: "Essa não é a sua senha atual." } }
      : { erro: traduzErro(conferencia.error.message) };
  }

  const { error } = await supabase.auth.updateUser({ password: analise.data.nova });
  if (error) return { erro: traduzErro(error.message) };

  return { sucesso: true };
}
