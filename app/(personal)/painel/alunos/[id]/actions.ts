"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { confereNome } from "@/lib/domain/nome";
import { LIMITE_DA_OBSERVACAO } from "@/lib/domain/observacao";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { preencher } from "@/lib/i18n/texto";
import { createClient } from "@/lib/supabase/server";

export type EstadoDaObservacao = {
  erro?: string;
  errosPorCampo?: { texto?: string };
  ok?: boolean;
};

/** As mensagens das anotações no idioma do painel. */
async function erros() {
  return (await textosDoPainel()).t.ficha.observacoes.erros;
}

/** O texto da anotação; montado por chamada, porque a mensagem é do idioma de quem enviou. */
function texto(e: Awaited<ReturnType<typeof erros>>) {
  return z
    .string()
    .trim()
    .min(1, e.vazio)
    .max(LIMITE_DA_OBSERVACAO, preencher(e.longo, { n: LIMITE_DA_OBSERVACAO }));
}

/**
 * Anota alguma coisa sobre o aluno.
 *
 * **Não confere se o aluno é da carteira**, de propósito: `trainer_notes_insert`
 * já exige `trainer_id = auth.uid()` **e** `private.trainer_of(student_id)`
 * (migration 0028), e repetir a regra aqui seria a segunda cópia que sai de
 * sincronia. O que a ação trata é o erro que o banco devolve.
 *
 * `revalidatePath` da ficha, e só dela: a anotação não aparece em nenhuma outra
 * tela — nem no painel, nem na tabela de alunos, e muito menos no app do aluno.
 */
export async function criarObservacao(
  _anterior: EstadoDaObservacao,
  formData: FormData,
): Promise<EstadoDaObservacao> {
  const e = await erros();
  const analise = z.object({ alunoId: z.string().uuid(), texto: texto(e) }).safeParse({
    alunoId: String(formData.get("alunoId") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  });

  if (!analise.success) {
    return { errosPorCampo: { texto: analise.error.issues[0]?.message } };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase.from("trainer_notes").insert({
    trainer_id: trainer.id,
    student_id: analise.data.alunoId,
    body: analise.data.texto,
  });

  if (error) return { erro: e.falha };

  revalidatePath(`/painel/alunos/${analise.data.alunoId}`);
  return { ok: true };
}

/**
 * Corrige uma anotação já escrita.
 *
 * Editar é permitido aqui, ao contrário da sessão concluída e da reavaliação
 * enviada: lá o registro fechado é o histórico de que **outra pessoa** depende,
 * e reescrever mudaria o que ela já leu. Aqui ninguém mais lê, e um erro de
 * digitação numa anotação sobre lesão é pior do que a possibilidade de editá-la.
 *
 * `updated_at` é gravado pela ação e não por gatilho porque é a única escrita
 * que existe nesta tabela: um gatilho seria uma segunda regra para cobrir um
 * caminho só.
 */
export async function editarObservacao(
  _anterior: EstadoDaObservacao,
  formData: FormData,
): Promise<EstadoDaObservacao> {
  const e = await erros();
  const analise = z.object({ id: z.string().uuid(), texto: texto(e) }).safeParse({
    id: String(formData.get("id") ?? ""),
    texto: String(formData.get("texto") ?? ""),
  });

  if (!analise.success) {
    return { errosPorCampo: { texto: analise.error.issues[0]?.message } };
  }

  const alunoId = String(formData.get("alunoId") ?? "");

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  // `trainer_id` no filtro além do `id`: o RLS já recusaria, mas uma consulta
  // que não diz de quem é o dado depende só da policy para acertar.
  const { error, count } = await supabase
    .from("trainer_notes")
    .update(
      { body: analise.data.texto, updated_at: new Date().toISOString() },
      { count: "exact" },
    )
    .eq("id", analise.data.id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: e.falha };

  // Update recusado pelo `using` do RLS não dá erro: afeta zero linhas em
  // silêncio. Sem esta conferência, a tela diria "salvo" para uma anotação que
  // continuou como estava.
  if (count === 0) return { erro: e.sumiu };

  revalidatePath(`/painel/alunos/${alunoId}`);
  return { ok: true };
}

export type EstadoDaExclusao = { erro?: string };

/**
 * Apaga uma anotação.
 *
 * Permitido, ao contrário de sessão e reavaliação, pelo motivo registrado na
 * migration 0028: a anotação é do personal sobre o próprio trabalho, ninguém
 * mais a lê e nenhum número do produto sai dela. Travar o delete só o obrigaria
 * a esvaziar o texto para fingir que sumiu.
 */
export async function apagarObservacao(
  _anterior: EstadoDaExclusao,
  formData: FormData,
): Promise<EstadoDaExclusao> {
  const id = String(formData.get("id") ?? "");
  const alunoId = String(formData.get("alunoId") ?? "");
  const e = await erros();
  if (!z.string().uuid().safeParse(id).success) {
    return { erro: e.invalida };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase
    .from("trainer_notes")
    .delete()
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: e.falhaApagar };

  revalidatePath(`/painel/alunos/${alunoId}`);
  return {};
}

export type EstadoDoAcesso = { erro?: string };

/**
 * Pausa ou reativa o acesso do aluno ao app (decisão do Otávio, 26/09).
 *
 * Até 01/10 não havia tela para isto: a trava inteira (0035, 0036) lia
 * `students.status` e ninguém conseguia mudá-lo sem mexer no banco. Pausar não
 * apaga nada — o histórico e o perfil continuam abertos para o aluno.
 *
 * Quem garante que só o personal muda o status é o banco: o RLS de
 * `students_update` limita a linha à carteira, e o gatilho
 * `students_status_e_do_personal` (0039) recusa o próprio aluno. O filtro por
 * `trainer_id` aqui é para a consulta dizer de quem é o dado, e a contagem é
 * porque update recusado pelo RLS afeta zero linhas sem erro nenhum.
 */
export async function mudarAcessoDoAluno(
  _anterior: EstadoDoAcesso,
  formData: FormData,
): Promise<EstadoDoAcesso> {
  const e = (await textosDoPainel()).t.ficha.acesso.erros;
  const analise = z
    .object({ alunoId: z.string().uuid(), status: z.enum(["ativo", "inativo"]) })
    .safeParse({ alunoId: formData.get("alunoId"), status: formData.get("status") });
  if (!analise.success) return { erro: e.invalido };

  const { trainer } = await requireTrainer();
  const { alunoId, status } = analise.data;

  // Quem treina a si mesmo (13/09) não se pausa por aqui: trancaria o próprio
  // app de treino, e a tela não oferece o botão. Conferir de novo porque a
  // ação é um endereço que aceita POST de qualquer lugar.
  if (alunoId === trainer.id) return { erro: e.voce };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("students")
    .update({ status }, { count: "exact" })
    .eq("id", alunoId)
    .eq("trainer_id", trainer.id);

  if (error || count === 0) return { erro: e.falha };

  revalidatePath(`/painel/alunos/${alunoId}`);
  revalidatePath("/painel/alunos");
  revalidatePath("/painel");
  return {};
}

export type EstadoDaExclusaoDoAluno = { erro?: string; excluido?: boolean };

/**
 * Exclui o aluno da carteira e tudo o que existe sobre ele (pedido do Otávio,
 * 09/10). A linha de `students` leva por cascata programas, sessões, séries,
 * posts, comentários, curtidas, reavaliações, agenda e anotações — a política
 * de privacidade promete exatamente isso para "exclusão da conta".
 *
 * **As fotos saem antes da linha.** Arquivo não está na cascata do banco: é
 * objeto no storage, e quem libera o personal a apagá-lo (0051) é a pasta
 * pertencer a um aluno dele — depois do delete ela não pertence a ninguém.
 * Se alguma foto falha, nada é excluído: aluno sem fotos e com histórico é
 * recuperável, histórico apagado com fotos órfãs não é.
 *
 * O nome digitado é conferido aqui também, contra o nome do banco: a ação é um
 * endereço que aceita POST de qualquer lugar, e a trava da tela só vale na tela.
 *
 * **O que fica:** o login do aluno em `auth.users`. Apagar conta de
 * autenticação exige a chave de serviço, que não mora na Vercel (13/09); sem
 * linha de aluno, quem entrar com aquele e-mail cai em "sem perfil".
 */
export async function excluirAluno(
  _anterior: EstadoDaExclusaoDoAluno,
  formData: FormData,
): Promise<EstadoDaExclusaoDoAluno> {
  const e = (await textosDoPainel()).t.alunos.acoes.erros;
  const analise = z
    .object({ alunoId: z.string().uuid(), confirmacao: z.string() })
    .safeParse({
      alunoId: formData.get("alunoId"),
      confirmacao: formData.get("confirmacao") ?? "",
    });
  if (!analise.success) return { erro: e.falha };

  const { trainer } = await requireTrainer();
  const { alunoId, confirmacao } = analise.data;

  // Quem treina a si mesmo (13/09) apagaria o próprio histórico de treino.
  if (alunoId === trainer.id) return { erro: e.voce };

  const supabase = await createClient();
  const { data: aluno } = await supabase
    .from("students")
    .select("name, avatar_path")
    .eq("id", alunoId)
    .eq("trainer_id", trainer.id)
    .maybeSingle();
  if (!aluno) return { erro: e.falha };

  if (!confereNome(confirmacao, aluno.name)) return { erro: e.nome };

  const [{ data: posts, error: erroPosts }, { data: reavaliacoes, error: erroReav }] =
    await Promise.all([
      supabase.from("posts").select("photo_path").eq("student_id", alunoId),
      supabase
        .from("assessments")
        .select("photo_front_path, photo_side_path, photo_back_path")
        .eq("student_id", alunoId),
    ]);
  if (erroPosts || erroReav) return { erro: e.fotos };

  const porBucket: [string, string[]][] = [
    ["avatares", aluno.avatar_path ? [aluno.avatar_path] : []],
    ["treinos", (posts ?? []).flatMap((p) => (p.photo_path ? [p.photo_path] : []))],
    [
      "reavaliacoes",
      (reavaliacoes ?? []).flatMap((r) =>
        [r.photo_front_path, r.photo_side_path, r.photo_back_path].filter(
          (c): c is string => Boolean(c),
        ),
      ),
    ],
  ];
  for (const [bucket, caminhos] of porBucket) {
    if (!caminhos.length) continue;
    const { error } = await supabase.storage.from(bucket).remove(caminhos);
    if (error) return { erro: e.fotos };
  }

  const { error, count } = await supabase
    .from("students")
    .delete({ count: "exact" })
    .eq("id", alunoId)
    .eq("trainer_id", trainer.id);
  if (error || count === 0) return { erro: e.falha };

  revalidatePath("/painel", "layout");
  return { excluido: true };
}
