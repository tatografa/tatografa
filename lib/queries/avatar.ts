import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Quanto tempo a URL assinada do avatar vale. 1h é o mesmo das fotos do feed. */
const MINUTOS_DA_URL = 60;

/**
 * URL assinada de **uma** foto de avatar. Nula quando o caminho é nulo ou quando
 * a RLS do bucket `avatares` não libera o arquivo para quem está lendo.
 *
 * O avatar vive em bucket privado — URL pública é "qualquer um com o link", e
 * o caminho tem o id do aluno, que é adivinhável. A URL curta, assinada pelo
 * servidor, é a trava do produto; a RLS do bucket é a do banco.
 */
export async function urlDoAvatar(caminho: string | null): Promise<string | null> {
  if (!caminho) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("avatares")
    .createSignedUrl(caminho, MINUTOS_DA_URL * 60);
  return data?.signedUrl ?? null;
}

/**
 * Vários avatares de uma vez, para a tabela de alunos e o feed do painel —
 * sem N+1. Um `createSignedUrls` só, com todos os caminhos.
 */
export async function urlsDosAvatares(
  caminhos: readonly (string | null)[],
): Promise<Map<string, string>> {
  const unicos = Array.from(new Set(caminhos.filter((c): c is string => Boolean(c))));
  if (!unicos.length) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("avatares")
    .createSignedUrls(unicos, MINUTOS_DA_URL * 60);
  const mapa = new Map<string, string>();
  for (const u of data ?? []) {
    if (u.path && u.signedUrl) mapa.set(u.path, u.signedUrl);
  }
  return mapa;
}
