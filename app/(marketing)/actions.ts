"use server";

import { z } from "zod";

import {
  OBJETIVOS_DO_CONTATO,
  type CampoDoContato,
  type EstadoDaLista,
  type EstadoDoContato,
} from "@/lib/domain/contato";
import { telefoneOpcional } from "@/lib/domain/telefone";
import { createClient } from "@/lib/supabase/server";

const base = {
  nome: z.string().trim().min(2, "Diga seu nome.").max(80, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Digite seu e-mail.")
    .max(120, "E-mail muito longo.")
    .email("Esse e-mail não parece certo."),
  // A mesma regra do telefone do aluno e do personal: com DDD, guardado só com
  // dígitos e sem o 55 — é por ele que a equipe retorna.
  telefone: telefoneOpcional.refine(
    (v) => v !== null,
    "Informe um WhatsApp com DDD.",
  ),
};

const doAluno = z.object({
  ...base,
  temPersonal: z.enum(["sim", "nao"], { error: "Escolha sim ou não." }),
  objetivos: z
    .array(z.enum(OBJETIVOS_DO_CONTATO.map((o) => o.valor)))
    .min(1, "Escolha pelo menos um objetivo."),
});

/**
 * Guarda o contato que chega pela landing (migration 0040). Só do aluno: o
 * personal entra na lista com o e-mail (`entrarNaLista`), e o formulário
 * dele saiu em 02/10 (migration 0042).
 *
 * Sem `requireTrainer()` nem `requireStudent()`: a página é pública, e quem
 * escreve é qualquer visitante. O que segura a porta é o banco — só insert,
 * ninguém lê pela API — e os `check` de tamanho e formato. A validação aqui é
 * para devolver a frase certa no campo certo.
 *
 * **O campo "site" é armadilha para robô**: fica fora da tela e do leitor de
 * tela, e gente não o preenche. Preenchido, a ação responde "recebido" sem
 * gravar — dizer "recusado" ensinaria o robô a deixá-lo em branco.
 */
export async function enviarContato(
  _anterior: EstadoDoContato,
  formData: FormData,
): Promise<EstadoDoContato> {
  if (String(formData.get("site") ?? "") !== "") return { enviado: true };

  const campos = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    temPersonal: String(formData.get("temPersonal") ?? ""),
    objetivos: formData.getAll("objetivos").map(String),
  };

  const analise = doAluno.safeParse(campos);

  if (!analise.success) {
    const errosPorCampo: Partial<Record<CampoDoContato, string>> = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as CampoDoContato;
      if (campo && !errosPorCampo[campo])
        errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo, campos };
  }

  const dados = analise.data;
  const supabase = await createClient();

  // Insert sem `.select()`: o visitante não tem permissão de leitura, e pedir
  // a linha de volta transformaria um envio que deu certo num erro.
  const { error } = await supabase.from("contatos_do_site").insert({
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone as string,
    tem_personal: dados.temPersonal === "sim",
    objetivos: dados.objetivos,
  });

  if (error)
    return {
      erro: "Não conseguimos enviar agora. Tente de novo em instantes.",
      campos,
    };
  return { enviado: true };
}

/**
 * "Entrar na lista", da versão para personais da landing (02/10): só o e-mail.
 *
 * Passa por `entrar_na_lista` (migration 0041), a única porta da tabela, que
 * ignora o repetido em silêncio — então a resposta é a mesma para quem entrou
 * agora e para quem já estava, e ninguém descobre por aqui quem está na lista.
 * O mesmo campo-armadilha do formulário de contato.
 */
export async function entrarNaLista(
  _anterior: EstadoDaLista,
  formData: FormData,
): Promise<EstadoDaLista> {
  const digitado = String(formData.get("email") ?? "");
  if (String(formData.get("site") ?? "") !== "") return { email: digitado.trim().toLowerCase() };

  const analise = base.email.safeParse(digitado);
  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira o e-mail.", digitado };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("entrar_na_lista", { p_email: analise.data });
  if (error) return { erro: "Não conseguimos registrar agora. Tente de novo em instantes.", digitado };

  return { email: analise.data };
}
