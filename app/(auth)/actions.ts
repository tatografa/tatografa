"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSiteOrigin } from "@/lib/auth/site-url";
import { traduzErro } from "@/lib/auth/mensagens";
import { createClient } from "@/lib/supabase/server";

/**
 * Estado devolvido pelos formulários de autenticação para o `useActionState`.
 *
 * `campos` guarda o que o usuário digitou, para o formulário não voltar vazio
 * depois de um erro. Senha nunca entra aqui.
 */
export type EstadoAuth = {
  erro?: string;
  errosPorCampo?: Partial<Record<"nome" | "email" | "senha", string>>;
  campos?: { nome?: string; email?: string };
  sucesso?: "confirme-email" | "link-enviado";
};

const SENHA_MINIMA = 8;

const email = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.")
  .transform((valor) => valor.toLowerCase());

const senha = z
  .string()
  .min(SENHA_MINIMA, `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`);

const esquemaLogin = z.object({ email, senha: z.string().min(1, "Informe sua senha.") });
const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email,
  senha,
});
const esquemaEmail = z.object({ email });
const esquemaNovaSenha = z.object({ senha });

/** Achata os erros do zod no formato que os formulários consomem. */
function errosDe(erro: z.ZodError): EstadoAuth["errosPorCampo"] {
  const saida: EstadoAuth["errosPorCampo"] = {};
  for (const problema of erro.issues) {
    const campo = problema.path[0] as "nome" | "email" | "senha" | undefined;
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
      data: { role: "personal", name: analise.data.nome },
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

  // Erro de limite de envio o usuário precisa ver; "e-mail não existe", não —
  // responder diferente por e-mail entregaria quem tem conta.
  if (error && /rate limit|for security purposes/i.test(error.message)) {
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
