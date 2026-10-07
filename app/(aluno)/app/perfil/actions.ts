"use server";

import { revalidatePath } from "next/cache";

import { requireStudent } from "@/lib/auth/session";
import { esquemaDoPerfilNoIdioma, type CampoDoPerfil } from "@/lib/domain/perfil";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { createClient } from "@/lib/supabase/server";

export type EstadoDoPerfil = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDoPerfil, string>>;
  sucesso?: boolean;
};

/**
 * O aluno corrige o próprio perfil.
 *
 * Desde 18/09 ele também informa **telefone, cidade/UF, meta de peso e perfil
 * biológico**. Os quatro são opcionais e aceitam voltar para vazio: a política
 * de privacidade promete que informar é escolha, e uma escolha que não se
 * desfaz não é escolha.
 *
 * **Por que isto existe:** a política de privacidade promete, em "Seus
 * direitos", que "o perfil é editável" — e até aqui ele era só de leitura.
 * Corrigir dado errado sobre si é direito da LGPD, e uma tela que só mostra não
 * atende. O peso, além disso, muda com o tempo e é dele que o personal parte
 * para montar o treino.
 *
 * **O que NÃO entra:** `trainer_id` e `email`.
 *
 * O `trainer_id` porque `students_update` recusaria (0010) — trocar de personal
 * é decisão de quem convida. Nem sequer é enviado: mandar e ser recusado seria
 * um erro na cara do aluno por uma coisa que a tela nunca ofereceu.
 *
 * O e-mail porque ele é a identidade em `auth.users`, não um campo de perfil;
 * trocá-lo é um fluxo de confirmação do Supabase, não um update de linha. A
 * tela diz isso e dá o canal.
 */
export async function salvarPerfil(
  _anterior: EstadoDoPerfil,
  formData: FormData,
): Promise<EstadoDoPerfil> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    objetivo: String(formData.get("objetivo") ?? ""),
    nivel: String(formData.get("nivel") ?? ""),
    nascimento: String(formData.get("nascimento") ?? ""),
    peso: String(formData.get("peso") ?? ""),
    altura: String(formData.get("altura") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    cidade: String(formData.get("cidade") ?? ""),
    uf: String(formData.get("uf") ?? ""),
    perfilBiologico: String(formData.get("perfilBiologico") ?? ""),
    metaDePeso: String(formData.get("metaDePeso") ?? ""),
  };

  const { idioma, t } = await textosDoApp();
  const analise = esquemaDoPerfilNoIdioma(idioma, t.perfil.perfil.validacao).safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoDoPerfil["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as CampoDoPerfil | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo };
  }

  const {
    nome, objetivo, nivel, nascimento, peso, altura,
    telefone, cidade, uf, perfilBiologico, metaDePeso,
  } = analise.data;
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update({
      name: nome,
      goal: objetivo,
      experience_level: nivel,
      birth_date: nascimento,
      weight_kg: peso,
      height_cm: Math.round(altura),
      phone: telefone,
      city: cidade,
      state: uf,
      // Os dois últimos passam pelo gatilho `students_dado_do_corpo`, que só
      // aceita a escrita vinda da conta do próprio aluno (migration 0034).
      // Aqui isso é sempre verdade — `requireStudent()` já resolveu quem é —,
      // e a trava existe para o POST direto que não passa por esta tela.
      biological_profile: perfilBiologico,
      weight_goal_kg: metaDePeso,
    })
    .eq("id", student.id);

  if (error) {
    return { erro: t.perfil.perfil.falha };
  }

  // `"layout"` e não a página solta: o nome do aluno aparece no cabeçalho da
  // home e o peso alimenta a tela do personal — a subárvore inteira envelheceu.
  revalidatePath("/app", "layout");
  return { sucesso: true };
}


/* ------------------------------------------------------- foto de perfil --- */

/**
 * Os tipos que o bucket `avatares` aceita (migration 0048) e a extensão de
 * cada um. Repetidos aqui como mensagem em português antes de subir o arquivo
 * — a lista do bucket é a que vale, porque um cliente adulterado não passa
 * pelo formulário.
 */
const EXTENSAO_DO_AVATAR: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** O mesmo teto do bucket (migration 0048). */
const LIMITE_DO_AVATAR = 2 * 1024 * 1024;

export type EstadoDoAvatar = { erro?: string; sucesso?: boolean };

/**
 * O aluno troca ou adiciona a foto de perfil.
 *
 * A **ordem importa**: sobe o arquivo novo, atualiza `students.avatar_path`,
 * **só depois** apaga o antigo. Ao contrário, se o update falhar o aluno fica
 * sem foto nenhuma — e o passo que o aluno executa é trocar, não apagar.
 *
 * O nome do arquivo leva um sufixo aleatório a cada troca para o navegador
 * não servir a foto velha do cache quando a URL assinada for a mesma por
 * segundos. Nome fixo (`<id>/avatar.jpg`) parece mais limpo e seria o pior
 * dos mundos: a URL assinada aponta para a mesma chave, e o navegador mostra
 * a foto antiga até o cache expirar.
 */
export async function salvarFotoDePerfil(
  _anterior: EstadoDoAvatar,
  formData: FormData,
): Promise<EstadoDoAvatar> {
  const { t } = await textosDoApp();
  const m = t.perfil.perfil.foto;

  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: m.naoLeu };
  }
  if (!EXTENSAO_DO_AVATAR[arquivo.type]) return { erro: m.tipo };
  if (arquivo.size > LIMITE_DO_AVATAR) return { erro: m.tamanho };

  const { student } = await requireStudent();
  const supabase = await createClient();

  // A primeira pasta do caminho é o id do dono — é o que a policy de escrita
  // confere, sem consultar tabela nenhuma. Nome aleatório contra cache.
  const nomeNovo = `${student.id}/${crypto.randomUUID()}.${EXTENSAO_DO_AVATAR[arquivo.type]}`;

  const { error: erroDoUpload } = await supabase.storage
    .from("avatares")
    .upload(nomeNovo, await arquivo.arrayBuffer(), {
      contentType: arquivo.type,
      upsert: false,
    });
  if (erroDoUpload) return { erro: m.falha };

  const antigo = student.avatar_path;
  const { error } = await supabase
    .from("students")
    .update({ avatar_path: nomeNovo })
    .eq("id", student.id);

  if (error) {
    // Rollback do upload: evita arquivo órfão no bucket.
    await supabase.storage.from("avatares").remove([nomeNovo]);
    return { erro: m.falha };
  }

  if (antigo && antigo !== nomeNovo) {
    await supabase.storage.from("avatares").remove([antigo]);
  }

  // `layout` para o cabeçalho do perfil e o avatar da ficha do personal
  // envelhecerem juntos.
  revalidatePath("/app", "layout");
  revalidatePath(`/painel/alunos/${student.id}`);
  return { sucesso: true };
}

/**
 * O aluno apaga a foto. **Ordem invertida da troca**: zera a coluna primeiro,
 * depois apaga o arquivo. Se o remove do storage falhar, o produto já mostra
 * as iniciais e o arquivo vira órfão — menos ruim do que o aluno ver a foto
 * velha porque o storage apagou e o update não.
 */
export async function apagarFotoDePerfil(): Promise<EstadoDoAvatar> {
  const { t } = await textosDoApp();
  const m = t.perfil.perfil.foto;
  const { student } = await requireStudent();
  if (!student.avatar_path) return { sucesso: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ avatar_path: null })
    .eq("id", student.id);
  if (error) return { erro: m.falha };

  await supabase.storage.from("avatares").remove([student.avatar_path]);

  revalidatePath("/app", "layout");
  revalidatePath(`/painel/alunos/${student.id}`);
  return { sucesso: true };
}
