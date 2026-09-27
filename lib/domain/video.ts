/**
 * O vídeo do exercício: link de YouTube ou Vimeo, virado em endereço de embed.
 *
 * Função pura e módulo neutro, porque três lugares precisam concordar: o zod
 * da Server Action (aceita ou recusa o link), a tela do personal (mostra a
 * prévia) e o "Como fazer" do aluno (mostra o vídeo). O banco confere de novo
 * só o domínio (migration 0038); quem sabe **extrair o vídeo** do link é daqui.
 *
 * Nada fora destes formatos vira `<iframe>`: um endereço qualquer ali seria uma
 * página arbitrária aberta dentro do app, na frente de quem está treinando.
 */

const ID_DO_YOUTUBE = /^[A-Za-z0-9_-]{6,20}$/;

/** O endereço de embed, ou `null` se o link não é um vídeo reconhecido. */
export function enderecoDeEmbed(bruto: string): string | null {
  let url: URL;
  try {
    url = new URL(bruto.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");

  if (host === "youtube.com") {
    const id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : /^\/(shorts|embed|live)\/([^/]+)/.exec(url.pathname)?.[2];
    // youtube-nocookie: o vídeo toca igual, e o YouTube não grava cookie de
    // rastreio no aparelho do aluno só porque ele abriu "Como fazer".
    return id && ID_DO_YOUTUBE.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return ID_DO_YOUTUBE.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    // vimeo.com/123456, vimeo.com/channels/x/123456, player.vimeo.com/video/123456
    const id = url.pathname.split("/").filter(Boolean).reverse().find((p) => /^\d{5,12}$/.test(p));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

export const LIMITE_DA_DESCRICAO = 1000;
export const LIMITE_DA_SEGURANCA = 2000;
