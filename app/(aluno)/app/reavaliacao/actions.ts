"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStudent } from "@/lib/auth/session";
import { pareceUuid } from "@/lib/domain/id";
import {
  REGIOES,
  SLOTS,
  esquemaDaReavaliacao,
  medidaDaRegiao,
  type Regiao,
  type Slot,
} from "@/lib/domain/reavaliacao";
import { createClient } from "@/lib/supabase/server";

export type CampoDaReavaliacao = "peso" | "gordura" | "observacao" | Regiao | "fotos";

export type EstadoDaReavaliacao = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDaReavaliacao, string>>;
};

/**
 * Os tipos que o bucket aceita (migration 0023) e a extensão de cada um.
 *
 * A lista vive aqui **e** no banco: esta dá a mensagem em português antes de
 * subir nada; a do bucket é a que vale, porque um cliente adulterado não passa
 * pelo formulário.
 */
const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** O mesmo teto do bucket. */
const LIMITE_DE_BYTES = 5 * 1024 * 1024;

/**
 * Envia a reavaliação: medidas, observação e as três fotos.
 *
 * **A ordem é: sobe as fotos, depois fecha a linha.** Ao contrário, a
 * reavaliação apareceria fechada apontando para arquivos que ainda não estão
 * lá, e o personal abriria molduras quebradas. Se o fechamento falhar depois do
 * upload, as fotos são apagadas aqui mesmo — objeto órfão no Storage não
 * aparece em lugar nenhum e ninguém o encontra depois.
 *
 * O fechamento é uma transação só (`enviar_reavaliacao`, migration 0023): N
 * medidas mais o `submitted_at` em passos soltos deixariam metade gravada e a
 * tela sem saber o que já foi.
 *
 * A autorização não é conferida aqui: `assessments_update` e a RPC já exigem
 * que a reavaliação seja do aluno e esteja aberta. Repetir a regra seria a
 * segunda cópia, que é como as duas saem de sincronia.
 */
export async function enviarReavaliacao(
  _anterior: EstadoDaReavaliacao,
  formData: FormData,
): Promise<EstadoDaReavaliacao> {
  const id = String(formData.get("id") ?? "");
  if (!pareceUuid(id)) return { erro: "Reavaliação inválida." };

  const errosPorCampo: EstadoDaReavaliacao["errosPorCampo"] = {};

  const analise = esquemaDaReavaliacao.safeParse({
    peso: String(formData.get("peso") ?? ""),
    gordura: String(formData.get("gordura") ?? ""),
    observacao: String(formData.get("observacao") ?? ""),
  });

  if (!analise.success) {
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as CampoDaReavaliacao | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
  }

  const medidas: Partial<Record<Regiao, number>> = {};
  for (const regiao of REGIOES) {
    const bruto = String(formData.get(regiao) ?? "");
    const resultado = medidaDaRegiao.safeParse(bruto);
    if (!resultado.success) {
      errosPorCampo[regiao] = resultado.error.issues[0]?.message ?? "Medida inválida.";
      continue;
    }
    if (resultado.data !== null) medidas[regiao] = resultado.data;
  }

  const fotos: Partial<Record<Slot, File>> = {};
  for (const slot of SLOTS) {
    const arquivo = formData.get(slot);
    if (!(arquivo instanceof File) || arquivo.size === 0) continue;

    if (!EXTENSAO_POR_TIPO[arquivo.type]) {
      errosPorCampo.fotos = "As fotos precisam ser JPG, PNG ou WEBP.";
      continue;
    }
    if (arquivo.size > LIMITE_DE_BYTES) {
      errosPorCampo.fotos = "Uma das fotos passa de 5 MB. Tire outra.";
      continue;
    }
    fotos[slot] = arquivo;
  }

  if (Object.keys(errosPorCampo).length > 0) return { errosPorCampo };

  // Reavaliação enviada em branco não é resposta: seria uma linha fechada que
  // o personal abre para não ver nada, e que não pode mais ser preenchida.
  const vazia =
    analise.success &&
    analise.data.peso === null &&
    analise.data.gordura === null &&
    Object.keys(medidas).length === 0 &&
    Object.keys(fotos).length === 0;

  if (vazia) {
    return {
      erro: "Preencha ao menos uma medida ou envie uma foto antes de enviar.",
    };
  }

  const { student } = await requireStudent();
  const supabase = await createClient();

  const caminhos: Partial<Record<Slot, string>> = {};
  const subidos: string[] = [];

  for (const slot of SLOTS) {
    const arquivo = fotos[slot];
    if (!arquivo) continue;

    // `<aluno>/<reavaliação>/<ângulo>`, como manda o doc 02. A primeira pasta é
    // o id do dono: é o que a policy de escrita confere, sem consultar tabela.
    const caminho = `${student.id}/${id}/${slot}.${EXTENSAO_POR_TIPO[arquivo.type]}`;

    const { error } = await supabase.storage
      .from("reavaliacoes")
      .upload(caminho, await arquivo.arrayBuffer(), {
        contentType: arquivo.type,
        // `upsert` porque o caminho é fixo por ângulo: quem troca a foto antes
        // de enviar reescreve a mesma chave em vez de deixar lixo para trás.
        upsert: true,
      });

    if (error) {
      if (subidos.length) await supabase.storage.from("reavaliacoes").remove(subidos);
      return { erro: "Não conseguimos enviar as fotos agora. Tente de novo." };
    }

    caminhos[slot] = caminho;
    subidos.push(caminho);
  }

  /*
   * Campo em branco é **omitido**, não enviado como nulo: a RPC declara os
   * defaults (migration 0025), e `undefined` some do JSON. Dizer "não informei"
   * e "informei nada" com a mesma palavra é o que o default existe para evitar.
   *
   * `analise.success` é sempre verdadeiro aqui — um erro de análise já teria
   * voltado com `errosPorCampo` —, mas o TypeScript não sabe disso sem o teste.
   */
  const dados = analise.success ? analise.data : null;

  const { error } = await supabase.rpc("enviar_reavaliacao", {
    p_assessment_id: id,
    p_weight_kg: dados?.peso ?? undefined,
    p_body_fat_pct: dados?.gordura ?? undefined,
    p_notes: dados?.observacao || undefined,
    p_medidas: medidas,
    p_photo_front: caminhos.frente,
    p_photo_side: caminhos.lado,
    p_photo_back: caminhos.costas,
  });

  if (error) {
    if (subidos.length) await supabase.storage.from("reavaliacoes").remove(subidos);
    return { erro: "Não conseguimos enviar agora. Tente de novo." };
  }

  /*
   * O peso do perfil acompanha o da reavaliação. `students.weight_kg` é "peso
   * atual" e a série histórica mora em `assessments` — é o que o comentário da
   * coluna promete desde a 0006. Sem isto, o aluno informa 82 kg aqui e o
   * perfil dele segue dizendo 78 até ele lembrar de editar.
   *
   * Falhar aqui não desfaz o envio: a reavaliação já está gravada, e ela é o
   * registro que vale.
   */
  if (dados?.peso != null) {
    await supabase
      .from("students")
      .update({ weight_kg: dados.peso })
      .eq("id", student.id);
  }

  revalidatePath("/app/reavaliacao");
  revalidatePath("/app");
  revalidatePath("/app/perfil");
  redirect("/app/reavaliacao?enviada=1");
}

export type EstadoDoApagamento = { erro?: string };

/**
 * Apaga as três fotos de uma reavaliação já enviada.
 *
 * **O único jeito de mexer numa reavaliação depois do envio** (migration 0026).
 * Os números continuam: são eles que o personal compara, e reescrever a
 * comparação depois de lida é o que o congelamento existe para impedir. As
 * fotos são do corpo da pessoa, e a política de privacidade promete, para a
 * foto do feed, que o aluno apaga quando quiser — publicar a promessa e abrir
 * uma tela que tira três fotos do corpo sem o mesmo botão seria escrever o
 * texto antes da tela.
 *
 * **A ordem é o inverso do envio: a linha primeiro, o arquivo depois.** Apagar
 * o arquivo antes deixaria a linha apontando para o que não existe mais, e o
 * personal abriria molduras quebradas. Ao contrário, o pior caso é um arquivo
 * órfão que ninguém alcança — a linha já não aponta para ele, e a policy de
 * leitura do bucket não devolve caminho que a reavaliação não cita.
 */
export async function apagarFotosDaReavaliacao(
  _anterior: EstadoDoApagamento,
  formData: FormData,
): Promise<EstadoDoApagamento> {
  const id = String(formData.get("id") ?? "");
  if (!pareceUuid(id)) return { erro: "Reavaliação inválida." };

  const { student } = await requireStudent();
  const supabase = await createClient();

  const { data: antes, error: erroDaLeitura } = await supabase
    .from("assessments")
    .select("photo_front_path, photo_side_path, photo_back_path")
    .eq("id", id)
    .eq("student_id", student.id)
    .maybeSingle();

  if (erroDaLeitura || !antes) return { erro: "Reavaliação não encontrada." };

  const { error, count } = await supabase
    .from("assessments")
    .update(
      { photo_front_path: null, photo_side_path: null, photo_back_path: null },
      { count: "exact" },
    )
    .eq("id", id)
    .eq("student_id", student.id);

  if (error) return { erro: "Não conseguimos apagar as fotos agora. Tente de novo." };

  // Update barrado pelo RLS não levanta erro: afeta zero linhas em silêncio.
  if (count === 0) return { erro: "Reavaliação não encontrada." };

  const caminhos = [
    antes.photo_front_path,
    antes.photo_side_path,
    antes.photo_back_path,
  ].filter((c) => c !== null);

  if (caminhos.length) {
    await supabase.storage.from("reavaliacoes").remove(caminhos);
  }

  revalidatePath("/app/reavaliacao");
  return {};
}
