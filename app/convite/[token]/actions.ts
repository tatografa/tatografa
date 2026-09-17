"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { erroDaSenha } from "@/lib/domain/senha";

import { traduzErro } from "@/lib/auth/mensagens";
import {
  alturaDoAluno,
  nascimentoDoAluno,
  nivelDoAluno,
  objetivoDoAluno,
  pesoDoAluno,
} from "@/lib/domain/perfil";
import { getSiteOrigin } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";
import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";

/** Os campos do formulário, como texto, para devolver o que o aluno digitou. */
export type CamposDoOnboarding = {
  objetivo?: string;
  nivel?: string;
  nascimento?: string;
  peso?: string;
  altura?: string;
};

export type EstadoOnboarding = {
  erro?: string;
  errosPorCampo?: Partial<
    Record<
      "senha" | "termos" | "objetivo" | "nascimento" | "peso" | "altura" | "nivel",
      string
    >
  >;
  /**
   * O que voltou para a tela depois de uma falha. Este é o formulário mais
   * longo do produto — objetivo, nível, nascimento, peso e altura — e ele
   * falha por motivo que não é culpa do aluno: no teste de campo, o limite de
   * e-mail do Supabase devolveu "muitas tentativas seguidas" e ele teve que
   * preencher tudo de novo.
   *
   * A senha fica **de fora** de propósito: devolvê-la ao navegador para
   * repovoar o campo a faria trafegar de volta sem necessidade. Digitar a senha
   * outra vez é barato; redigitar sete campos não é.
   */
  campos?: CamposDoOnboarding;
  sucesso?: "confirme-email";
};


/**
 * As duas etapas chegam juntas num submit só.
 *
 * Separar em dois envios exigiria sessão entre eles, e com confirmação de
 * e-mail ligada o `signUp` não devolve sessão — o aluno ficaria preso entre as
 * etapas. Juntando, o gatilho grava a linha de `students` completa de uma vez.
 */
const esquema = z.object({
  // A regra vive em `lib/domain/senha.ts`: o personal e a troca de senha usam
  // a mesma, e era aqui que ela estava escrita a mais.
  senha: z.string().superRefine((valor, ctx) => {
    const erro = erroDaSenha(valor);
    if (erro) ctx.addIssue({ code: "custom", message: erro });
  }),
  termos: z.literal("on", {
    error: "É preciso aceitar os termos para continuar.",
  }),
  // As cinco regras de campo vêm de `lib/domain/perfil.ts`: o aluno edita os
  // mesmos campos depois, em `/app/perfil`, e duas cópias divergiriam.
  objetivo: objetivoDoAluno,
  nivel: nivelDoAluno,
  nascimento: nascimentoDoAluno,
  peso: pesoDoAluno,
  altura: alturaDoAluno,
});

export async function criarAcesso(
  _anterior: EstadoOnboarding,
  formData: FormData,
): Promise<EstadoOnboarding> {
  const bruto = {
    senha: String(formData.get("senha") ?? ""),
    termos: String(formData.get("termos") ?? ""),
    objetivo: String(formData.get("objetivo") ?? ""),
    nivel: String(formData.get("nivel") ?? ""),
    nascimento: String(formData.get("nascimento") ?? ""),
    peso: String(formData.get("peso") ?? ""),
    altura: String(formData.get("altura") ?? ""),
  };

  const token = String(formData.get("token") ?? "");
  const nome = String(formData.get("nome") ?? "");

  // Tudo menos a senha volta para a tela em qualquer falha.
  const campos: CamposDoOnboarding = {
    objetivo: bruto.objetivo,
    nivel: bruto.nivel,
    nascimento: bruto.nascimento,
    peso: bruto.peso,
    altura: bruto.altura,
  };

  const analise = esquema.safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoOnboarding["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as keyof NonNullable<
        EstadoOnboarding["errosPorCampo"]
      >;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo, campos };
  }

  const supabase = await createClient();

  // O e-mail vem do convite, nunca do formulário: o campo na tela é só leitura
  // e o gatilho confere de novo no banco.
  const { data: convite } = await supabase.rpc("convite_por_token", {
    p_token: token,
  });
  const valido = convite?.[0];

  if (!valido) {
    return {
      erro: "Esse convite não vale mais. Peça um novo ao seu personal.",
      campos,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: valido.email,
    password: analise.data.senha,
    options: {
      // Sem `emailRedirectTo` o link de confirmação cai em `/`, onde ninguém
      // troca o `?code=` por sessão — e a tela anterior acabou de prometer que
      // "seus treinos estarão prontos". O destino é o app do aluno, não o painel.
      emailRedirectTo: `${await getSiteOrigin()}/auth/confirmar?proximo=/app`,
      data: {
        role: "aluno",
        invite_token: token,
        name: nome || valido.nome,
        goal: analise.data.objetivo,
        experience_level: analise.data.nivel,
        birth_date: analise.data.nascimento,
        weight_kg: String(analise.data.peso),
        height_cm: String(Math.round(analise.data.altura)),
        /*
         * A versão do texto aceito, para o gatilho gravar em
         * `term_acceptances`. Vem da constante do servidor, **não** do
         * formulário: o campo escondido diz o que estava na tela, mas quem
         * decide qual versão vale é quem serve o texto. A data do aceite nem
         * passa por aqui — é o relógio do banco que carimba.
         */
        termos_versao: VERSAO_DOS_DOCUMENTOS,
      },
    },
  });

  if (error) {
    // O gatilho recusa convite inválido levantando exceção; o GoTrue devolve
    // isso como erro de banco, sem texto útil para o aluno.
    if (/convite_invalido|convite_email_divergente|database/i.test(error.message)) {
      return {
        erro: "Esse convite não vale mais. Peça um novo ao seu personal.",
        campos,
      };
    }
    return { erro: traduzErro(error.message), campos };
  }

  if (data.session) redirect("/convite/pronto");

  return { sucesso: "confirme-email" };
}
