"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { erroDaSenha } from "@/lib/domain/senha";
import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";

import { getSiteOrigin } from "@/lib/auth/site-url";
import { falhaDeEnvioVisivel, traduzErro } from "@/lib/auth/mensagens";
import { createClient } from "@/lib/supabase/server";

/**
 * Estado devolvido pelos formulários de autenticação para o `useActionState`.
 *
 * `campos` guarda o que o usuário digitou, para o formulário não voltar vazio
 * depois de um erro. Senha nunca entra aqui.
 */
export type EstadoAuth = {
  erro?: string;
  errosPorCampo?: Partial<Record<"nome" | "email" | "senha" | "termos", string>>;
  campos?: { nome?: string; email?: string };
  sucesso?: "confirme-email" | "link-enviado";
};

const email = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.")
  .transform((valor) => valor.toLowerCase());

/*
 * A regra vem de `lib/domain/senha.ts`, não escrita aqui. Antes este arquivo
 * exigia só o comprimento enquanto o cadastro do aluno exigia letra e número —
 * e como a **troca de senha** também passa por aqui, dava para sair de uma
 * senha forte para "12345678" pela tela de verdade.
 */
const senha = z.string().superRefine((valor, ctx) => {
  const erro = erroDaSenha(valor);
  if (erro) ctx.addIssue({ code: "custom", message: erro });
});

const esquemaLogin = z.object({ email, senha: z.string().min(1, "Informe sua senha.") });
const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email,
  senha,
  // O personal também aceita os documentos (decisão do Otávio, 17/09). Os
  // termos falam dele em cada seção — "o que é responsabilidade sua e do seu
  // personal" — e até aqui nenhum personal tinha linha de aceite.
  termos: z.literal("on", {
    error: "É preciso aceitar os termos para criar a conta.",
  }),
});
const esquemaEmail = z.object({ email });
const esquemaNovaSenha = z.object({ senha });

/** Achata os erros do zod no formato que os formulários consomem. */
function errosDe(erro: z.ZodError): EstadoAuth["errosPorCampo"] {
  const saida: EstadoAuth["errosPorCampo"] = {};
  for (const problema of erro.issues) {
    const campo = problema.path[0] as
      | "nome"
      | "email"
      | "senha"
      | "termos"
      | undefined;
    if (campo && !saida[campo]) saida[campo] = problema.message;
  }
  return saida;
}

/**
 * Só aceita caminho interno do painel como destino pós-login. Sem isso, um
 * `?proximo=https://site-falso` transforma o login em redirecionador aberto.
 */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  const caminho = typeof valor === "string" ? valor : "";
  return caminho.startsWith("/painel") && !caminho.startsWith("//")
    ? caminho
    : "/painel";
}

export async function entrar(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const bruto = {
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  };
  const campos = { email: bruto.email };

  const analise = esquemaLogin.safeParse(bruto);
  if (!analise.success) {
    return { errosPorCampo: errosDe(analise.error), campos };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: analise.data.email,
    password: analise.data.senha,
  });

  if (error) return { erro: traduzErro(error.message), campos };

  redirect(destinoSeguro(formData.get("proximo")));
}

export async function cadastrar(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
    termos: formData.get("termos") ?? "",
  };
  const campos = { nome: bruto.nome, email: bruto.email };

  const analise = esquemaCadastro.safeParse(bruto);
  if (!analise.success) {
    return { errosPorCampo: errosDe(analise.error), campos };
  }

  const supabase = await createClient();
  const origem = await getSiteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: analise.data.email,
    password: analise.data.senha,
    options: {
      // `role: personal` é o que faz o gatilho do banco criar a linha em
      // `trainers` (migration 0003). Sem isso, a conta nasce sem perfil.
      data: {
        role: "personal",
        name: analise.data.nome,
        /*
         * A versão do texto aceito, para o gatilho gravar em
         * `term_acceptances` (migration 0032, que subiu esse bloco para antes
         * dos ramos de papel — antes ele só existia no do aluno). Vem da
         * constante do servidor, **não** do formulário: quem decide qual versão
         * vale é quem serve o texto.
         */
        termos_versao: VERSAO_DOS_DOCUMENTOS,
      },
      emailRedirectTo: `${origem}/auth/confirmar?proximo=/painel`,
    },
  });

  if (error) return { erro: traduzErro(error.message), campos };

  // Confirmação de e-mail desligada: o Supabase já devolve sessão pronta.
  if (data.session) redirect("/painel");

  // E-mail já cadastrado: o Supabase devolve usuário sem identidades em vez de
  // erro, de propósito, para não revelar quem tem conta. Mostramos a mesma tela.
  return { sucesso: "confirme-email", campos };
}

/**
 * O erro real vai para o log do servidor, mesmo quando a tela cala.
 *
 * Sem isto o motivo some: a tela mostra a frase genérica (de propósito) e não
 * sobra nada para descobrir que o SMTP está mal configurado. **Sem o e-mail
 * junto** — quem pediu recuperação é dado pessoal, e log não é lugar disso.
 */
function registraFalhaDeEnvio(mensagem: string): void {
  console.error("[auth] falha ao enviar link:", mensagem);
}

export async function enviarLinkDeRecuperacao(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const bruto = { email: String(formData.get("email") ?? "") };

  const analise = esquemaEmail.safeParse(bruto);
  if (!analise.success) {
    return { errosPorCampo: errosDe(analise.error), campos: bruto };
  }

  const supabase = await createClient();
  const origem = await getSiteOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(
    analise.data.email,
    { redirectTo: `${origem}/auth/confirmar?proximo=/recuperar/nova-senha` },
  );

  // Calar "esse e-mail não existe" é deliberado: responder diferente entregaria
  // quem tem conta. **Calar falha de envio não era** — e era o que acontecia.
  // Sem SMTP próprio o Supabase recusa todo endereço fora da equipe do projeto,
  // e esta tela dizia "link enviado" para um e-mail que nunca saiu.
  if (error) registraFalhaDeEnvio(error.message);
  if (error && falhaDeEnvioVisivel(error.message)) {
    return { erro: traduzErro(error.message), campos: bruto };
  }

  return { sucesso: "link-enviado", campos: bruto };
}

/**
 * Link mágico do aluno (`/acesso`).
 *
 * Difere da recuperação de senha em dois pontos: o destino é `/app`, e
 * `shouldCreateUser: false` — sem isso, digitar um e-mail qualquer criaria uma
 * conta órfã, sem personal e sem treino.
 */
export async function enviarLinkDeAcesso(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const bruto = { email: String(formData.get("email") ?? "") };

  const analise = esquemaEmail.safeParse(bruto);
  if (!analise.success) {
    return { errosPorCampo: errosDe(analise.error), campos: bruto };
  }

  const supabase = await createClient();
  const origem = await getSiteOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email: analise.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origem}/auth/confirmar?proximo=/app`,
    },
  });

  // Mesma regra do `enviarLinkDeRecuperacao`.
  if (error) registraFalhaDeEnvio(error.message);
  if (error && falhaDeEnvioVisivel(error.message)) {
    return { erro: traduzErro(error.message), campos: bruto };
  }

  return { sucesso: "link-enviado", campos: bruto };
}

export async function definirNovaSenha(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const bruto = { senha: String(formData.get("senha") ?? "") };
  const confirmacao = String(formData.get("confirmacao") ?? "");

  const analise = esquemaNovaSenha.safeParse(bruto);
  if (!analise.success) return { errosPorCampo: errosDe(analise.error) };
  if (analise.data.senha !== confirmacao) {
    return { errosPorCampo: { senha: "As duas senhas precisam ser iguais." } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      erro: "Esse link expirou ou já foi usado. Peça outro em “Esqueci minha senha”.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: analise.data.senha,
  });

  if (error) return { erro: traduzErro(error.message) };

  redirect("/painel");
}
