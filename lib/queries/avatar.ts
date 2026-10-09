import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/** Quanto tempo a URL assinada do avatar vale. 1h é o mesmo das fotos do feed. */
const MINUTOS_DA_URL = 60;

/**
 * URL assinada de **uma** foto de avatar, a partir do caminho já em mãos (a
 * linha do próprio aluno ou a ficha que o personal leu). Nula quando o caminho
 * é nulo ou quando a RLS do bucket `avatares` não libera o arquivo.
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
 * Foto de cada pessoa, por id de conta — para as telas que mostram **outros**:
 * autor de post e de comentário, a carteira, a agenda, o personal no app.
 * Duas idas para o lote inteiro, sem N+1: os caminhos saem de
 * `caminhos_dos_avatares` (migration 0050) — o aluno não lê a linha do colega
 * em `students` — e as URLs de um `createSignedUrls` só.
 *
 * O personal entra pelo mesmo id: a foto dele é a da linha de aluno de si
 * mesmo (13/09). Quem não tem foto, ou não pode ser visto, simplesmente não
 * está no mapa, e a tela desenha as iniciais.
 */
export async function fotosDe(ids: readonly string[]): Promise<Map<string, string>> {
  const unicos = Array.from(new Set(ids));
  if (!unicos.length) return new Map();

  const supabase = await createClient();
  const { data: caminhos } = await supabase.rpc("caminhos_dos_avatares", {
    p_ids: unicos,
  });
  if (!caminhos?.length) return new Map();

  const { data: assinadas } = await supabase.storage
    .from("avatares")
    .createSignedUrls(
      caminhos.map((c) => c.avatar_path),
      MINUTOS_DA_URL * 60,
    );
  const porCaminho = new Map<string, string>();
  for (const u of assinadas ?? []) {
    if (u.path && u.signedUrl) porCaminho.set(u.path, u.signedUrl);
  }

  const mapa = new Map<string, string>();
  for (const c of caminhos) {
    const url = porCaminho.get(c.avatar_path);
    if (url) mapa.set(c.id, url);
  }
  return mapa;
}

/**
 * A foto de uma conta só, com `cache()` por requisição: o layout do painel e a
 * página de Configurações pedem a do personal na mesma renderização, e a URL
 * assinada muda a cada assinatura — duas chamadas dariam ao navegador dois
 * endereços para a mesma imagem.
 */
export const fotoDe = cache(async (id: string): Promise<string | null> => {
  const mapa = await fotosDe([id]);
  return mapa.get(id) ?? null;
});
