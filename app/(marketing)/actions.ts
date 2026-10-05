"use server";

import { z } from "zod";

import type {
  ErroDaLista,
  EstadoDaLista,
  PerfilDaLista,
} from "@/lib/domain/lista-de-espera";
import { createClient } from "@/lib/supabase/server";

// Os mesmos limites do `check` de `lista_de_espera.email` (migration 0041). As
// mensagens são códigos (`ErroDaLista`): a frase sai no idioma da página.
const emailDaLista = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "vazio")
  .max(120, "longo")
  .email("invalido");

/**
 * "Entrar na lista", nas duas versões da landing (02/10): o e-mail e a página
 * de onde ele veio, para a equipe saber se escreve a um personal ou a um aluno.
 * O perfil vem de um campo escondido, então qualquer coisa que não seja
 * "aluno" vira "personal" — o mesmo critério da página com `?para=`.
 *
 * Passa por `entrar_na_lista` (migration 0041), a única porta da tabela, que
 * ignora o repetido em silêncio — então a resposta é a mesma para quem entrou
 * agora e para quem já estava, e ninguém descobre por aqui quem está na lista.
 *
 * **O campo "site" é armadilha para robô**: fica fora da tela e do leitor de
 * tela, e gente não o preenche. Preenchido, a ação responde "entrou" sem
 * gravar — dizer "recusado" ensinaria o robô a deixá-lo em branco.
 */
export async function entrarNaLista(
  _anterior: EstadoDaLista,
  formData: FormData,
): Promise<EstadoDaLista> {
  const digitado = String(formData.get("email") ?? "");
  if (String(formData.get("site") ?? "") !== "") return { email: digitado.trim().toLowerCase() };

  const analise = emailDaLista.safeParse(digitado);
  if (!analise.success) {
    const codigo = analise.error.issues[0]?.message;
    const erro: ErroDaLista =
      codigo === "vazio" || codigo === "longo" ? codigo : "invalido";
    return { erro, digitado };
  }

  const perfil: PerfilDaLista = formData.get("perfil") === "aluno" ? "aluno" : "personal";

  const supabase = await createClient();
  const { error } = await supabase.rpc("entrar_na_lista", {
    p_email: analise.data,
    p_perfil: perfil,
  });
  if (error) return { erro: "falha", digitado };

  return { email: analise.data };
}
