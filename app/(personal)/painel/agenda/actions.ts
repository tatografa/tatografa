"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTrainer } from "@/lib/auth/session";
import { inicioDoDiaEmUtc } from "@/lib/domain/agenda";
import type { TextosDoPainel } from "@/lib/i18n/painel";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";
import { createClient } from "@/lib/supabase/server";

export type CampoDaSessao = "alunoId" | "dia" | "hora" | "duracao" | "observacao";

export type EstadoDoAgendamento = {
  erro?: string;
  errosPorCampo?: Partial<Record<CampoDaSessao, string>>;
  campos?: Partial<Record<CampoDaSessao, string>>;
  sucesso?: boolean;
};

type Erros = TextosDoPainel["agenda"]["erros"];

async function erros(): Promise<Erros> {
  return (await textosDoPainel()).t.agenda.erros;
}

/*
 * A mesma faixa do `check` da migration 0027. Aqui a validação existe para a
 * mensagem sair na língua de quem enviou — por isso o esquema é montado por
 * chamada; lá ela existe porque um POST direto não passa por formulário nenhum.
 */
function esquema(e: Erros) {
  return z.object({
    alunoId: z.string().uuid(e.escolhaAluno),
    dia: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, e.escolhaDia)
      .refine((v) => !Number.isNaN(Date.parse(v)), e.diaInvalido),
    hora: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, e.hora),
    duracao: z.coerce
      .number({ error: e.informeDuracao })
      .int(e.duracaoInteira)
      .min(10, e.duracaoMin)
      .max(480, e.duracaoMax),
    observacao: z.string().trim().max(500, e.observacaoLonga),
  });
}

/**
 * Agenda uma sessão presencial.
 *
 * **O horário chega como dia e hora separados, e vira instante aqui.** Um
 * `<input type="datetime-local">` devolveria "2026-09-15T18:00" sem fuso, e
 * `new Date()` sobre isso usa o fuso do **navegador** — o personal marcando de
 * um celular em outro fuso criaria a sessão na hora errada. A conversão passa
 * por `inicioDoDiaEmUtc`, que mede o deslocamento de São Paulo naquele dia.
 *
 * Não confere se o aluno é da carteira: `appointments_insert` já exige
 * `trainer_id = auth.uid()` **e** `private.trainer_of(student_id)` (0027).
 * Repetir a regra aqui seria a segunda cópia que sai de sincronia.
 */
export async function agendarSessao(
  _anterior: EstadoDoAgendamento,
  dados: FormData,
): Promise<EstadoDoAgendamento> {
  const bruto = {
    alunoId: String(dados.get("alunoId") ?? ""),
    dia: String(dados.get("dia") ?? ""),
    hora: String(dados.get("hora") ?? ""),
    duracao: String(dados.get("duracao") ?? ""),
    observacao: String(dados.get("observacao") ?? ""),
  };

  const e = await erros();
  const analise = esquema(e).safeParse(bruto);
  if (!analise.success) {
    const errosPorCampo: EstadoDoAgendamento["errosPorCampo"] = {};
    for (const problema of analise.error.issues) {
      const campo = problema.path[0] as CampoDaSessao | undefined;
      if (campo && !errosPorCampo[campo]) errosPorCampo[campo] = problema.message;
    }
    return { errosPorCampo, campos: bruto };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase.from("appointments").insert({
    trainer_id: trainer.id,
    student_id: analise.data.alunoId,
    starts_at: instanteDe(analise.data.dia, analise.data.hora),
    duration_minutes: analise.data.duracao,
    notes: analise.data.observacao || null,
  });

  if (error) {
    return { erro: e.falhaAgendar, campos: bruto };
  }

  revalidatePath("/painel/agenda", "layout");
  revalidatePath("/painel/alunos", "layout");
  revalidatePath("/app", "layout");
  return { sucesso: true };
}

export type EstadoDaMarcacao = { erro?: string };

/**
 * Marca o que aconteceu com a sessão: realizada, faltou ou cancelada.
 *
 * É o passo que dá valor à agenda. Sem ele a tabela guarda intenções, e o que
 * o personal precisa saber depois é **quem veio**.
 */
export async function marcarSessao(
  _anterior: EstadoDaMarcacao,
  dados: FormData,
): Promise<EstadoDaMarcacao> {
  const e = await erros();
  const analise = z
    .object({
      id: z.string().uuid(e.sessaoInvalida),
      situacao: z.enum(["agendada", "realizada", "faltou", "cancelada"], {
        error: e.situacaoInvalida,
      }),
    })
    .safeParse({
      id: String(dados.get("id") ?? ""),
      situacao: String(dados.get("situacao") ?? ""),
    });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message };
  }

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("appointments")
    .update({ status: analise.data.situacao }, { count: "exact" })
    .eq("id", analise.data.id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: e.falhaSalvar };

  // Update barrado pelo RLS não levanta erro: afeta zero linhas em silêncio.
  if (count === 0) return { erro: e.sessaoNaoEncontrada };

  revalidatePath("/painel/agenda", "layout");
  revalidatePath("/painel/alunos", "layout");
  revalidatePath("/app", "layout");
  return {};
}

export type EstadoDoDescarte = { erro?: string };

/**
 * Apaga uma sessão agendada por engano.
 *
 * **Só a que ainda não aconteceu nada** — `appointments_delete` exige
 * `status = 'agendada'` (0027). "Faltou" é o registro mais incômodo da agenda e
 * por isso o mais fácil de querer sumir depois; desmarcar de verdade é mudar o
 * status para cancelada, que deixa rastro.
 */
export async function descartarSessao(
  _anterior: EstadoDoDescarte,
  dados: FormData,
): Promise<EstadoDoDescarte> {
  const id = String(dados.get("id") ?? "");
  const e = await erros();
  if (!z.string().uuid().safeParse(id).success) return { erro: e.sessaoInvalida };

  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("appointments")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("trainer_id", trainer.id);

  if (error) return { erro: e.falhaApagar };

  if (count === 0) return { erro: e.jaMarcada };

  revalidatePath("/painel/agenda", "layout");
  revalidatePath("/painel/alunos", "layout");
  revalidatePath("/app", "layout");
  return {};
}

/**
 * Dia de calendário + hora do relógio → instante, no fuso do produto.
 *
 * `inicioDoDiaEmUtc` resolve a meia-noite daquele dia em São Paulo, e as horas
 * são somadas em cima dela.
 *
 * **Limite conhecido:** num dia de virada de horário de verão a soma erra uma
 * hora, porque o deslocamento muda no meio do dia. O Brasil não tem horário de
 * verão desde 2019; se voltar, o jeito certo é montar a data já no fuso em vez
 * de somar minutos sobre a meia-noite. Registrado aqui para não ser descoberto
 * de novo no dia da virada.
 */
function instanteDe(dia: string, hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const meiaNoite = new Date(inicioDoDiaEmUtc(dia)).getTime();
  return new Date(meiaNoite + (h * 60 + m) * 60_000).toISOString();
}
