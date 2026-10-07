/**
 * Reduz uma foto **no aparelho**, antes de ela sair para a rede.
 *
 * Três problemas resolvidos de uma vez:
 *
 * 1. **Tamanho.** Foto de celular sai com 3 a 8 MB. O card do feed mostra a
 *    imagem com 440px de largura, então subir o original é gastar a internet da
 *    academia para jogar fora 90% dos pixels no caminho.
 * 2. **Limite da Server Action.** O Next corta o corpo de uma ação em 1 MB por
 *    padrão. O `next.config.ts` sobe esse teto por segurança, mas a foto
 *    encolhida quase nunca chega perto dele.
 * 3. **HEIC do iPhone.** O formato padrão da câmera da Apple não está entre os
 *    que o bucket aceita, e às vezes escapa do conversor do iOS. O canvas do
 *    Safari decodifica HEIC e devolve JPEG — então passar por aqui normaliza o
 *    arquivo qualquer que seja a origem.
 *
 * O retorno é sempre JPEG. Transparência de PNG vira preto se não for pintada
 * antes, por isso o fundo branco no canvas.
 */

/** Maior lado da imagem depois de encolher. */
const LADO_MAXIMO = 1600;

/** Qualidade do JPEG. Acima de 0,85 o arquivo cresce sem diferença visível. */
const QUALIDADE = 0.82;

export async function prepararFoto(arquivo: File): Promise<File> {
  const { imagem, revogar } = await carregar(arquivo);
  try {
    const largura0 =
      imagem instanceof HTMLImageElement ? imagem.naturalWidth : imagem.width;
    const altura0 =
      imagem instanceof HTMLImageElement ? imagem.naturalHeight : imagem.height;
    if (!largura0 || !altura0) throw new Error("imagem sem dimensões");

    const escala = Math.min(1, LADO_MAXIMO / Math.max(largura0, altura0));
    const largura = Math.round(largura0 * escala);
    const altura = Math.round(altura0 * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("sem canvas");

    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, largura, altura);
    contexto.drawImage(imagem, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALIDADE),
    );
    if (!blob) throw new Error("sem blob");

    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } finally {
    // Só agora: o `drawImage` já leu os pixels.
    revogar();
  }
}

/**
 * `createImageBitmap` é o caminho rápido e não precisa de DOM, mas nem todo
 * navegador aceita todo formato por ele. O `<img>` com object URL é o plano B,
 * e é ele que costuma dar conta do HEIC convertido do Safari.
 *
 * Devolve a imagem **e** o `URL.revokeObjectURL` que o chamador precisa
 * disparar — **depois** de desenhar no canvas. Revogar antes é o defeito
 * clássico que faz o `drawImage` pintar o fundo branco e nenhum pixel: o
 * HTMLImageElement já teve `onload`, mas o Safari só termina de decodificar
 * no primeiro `drawImage` que o lê, e aí o blob já não está mais lá.
 */
async function carregar(
  arquivo: File,
): Promise<{ imagem: ImageBitmap | HTMLImageElement; revogar: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const imagem = await createImageBitmap(arquivo);
      return { imagem, revogar: () => imagem.close?.() };
    } catch {
      // Cai no plano B.
    }
  }

  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("imagem ilegível"));
      img.src = url;
    });
    // `img.decode()` força o Safari a terminar de decodificar antes de o
    // chamador desenhar; sem ele, aparelho antigo pintou canvas em branco.
    if (typeof imagem.decode === "function") {
      try { await imagem.decode(); } catch { /* alguns formatos não implementam */ }
    }
    return { imagem, revogar: () => URL.revokeObjectURL(url) };
  } catch (erro) {
    URL.revokeObjectURL(url);
    throw erro;
  }
}
