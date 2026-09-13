import { headers } from "next/headers";

/**
 * Origem pública do site, para montar os links que vão nos e-mails do Supabase
 * e o link de convite que o personal copia.
 *
 * **Por que uma variável de ambiente vence o cabeçalho `host`.** O `host` vem
 * da requisição, e quem a faz escolhe o que mandar. Num fluxo de recuperação de
 * senha isso é ataque conhecido: mandar `Host: site-do-atacante` faz o servidor
 * gerar o link de redefinição apontando para lá, e o e-mail sai legítimo com
 * destino errado. `NEXT_PUBLIC_SITE_URL` é o valor que o servidor escolheu, não
 * o que o cliente pediu.
 *
 * O preço disso é que ela **envelhece em silêncio**: trocar o domínio do app
 * sem trocar a variável mantém todo link nascendo com o endereço antigo, e nada
 * na tela denuncia. Foi o que aconteceu ao migrar de `tatografa.vercel.app`
 * para `repsclub.com.br`. Por isso o aviso abaixo.
 */
export async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const daRequisicao = `${protocol}://${host}`;

  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!configurada) return daRequisicao;

  avisaSeDivergiu(configurada, daRequisicao);
  return configurada;
}

/**
 * Divergir não é necessariamente erro: quem abre o app pela URL da Vercel em vez
 * do domínio próprio cai aqui, e está tudo certo — o link precisa mesmo sair com
 * o endereço oficial.
 *
 * Mas é também exatamente o que se vê quando a variável ficou para trás. O log
 * do servidor é o único lugar onde essa diferença aparece, então ela vai para lá
 * uma vez por combinação, e não a cada requisição.
 */
const jaAvisou = new Set<string>();

function avisaSeDivergiu(configurada: string, daRequisicao: string): void {
  if (configurada === daRequisicao) return;

  const chave = `${configurada}→${daRequisicao}`;
  if (jaAvisou.has(chave)) return;
  jaAvisou.add(chave);

  console.warn(
    `[site-url] NEXT_PUBLIC_SITE_URL é ${configurada}, mas a requisição chegou ` +
      `em ${daRequisicao}. Os links de convite e de e-mail vão sair com ${configurada}. ` +
      `Se o domínio do app mudou, atualize a variável e publique de novo.`,
  );
}
