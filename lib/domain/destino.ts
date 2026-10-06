/**
 * Para onde mandar alguém depois de entrar ou de abrir um link do e-mail.
 *
 * Só caminho interno, e só debaixo das raízes que existem para isso. Checar
 * "começa com / e não com //" não basta: o navegador lê `\` como `/`, e
 * `/\site-falso.com` vira `https://site-falso.com/` — o login e o link do
 * e-mail virariam redirecionadores abertos. A comparação é por segmento
 * inteiro (`/apple` não é `/app`), e `\` ou caractere de controle derrubam o
 * valor inteiro, em vez de tentar limpá-lo.
 */
const RAIZES = ["/painel", "/app", "/recuperar/nova-senha"];

export function destinoSeguro(valor: unknown, padrao = "/painel"): string {
  if (typeof valor !== "string" || /[\\\u0000-\u001f\u007f]/.test(valor)) {
    return padrao;
  }
  const interno = RAIZES.some(
    (raiz) =>
      valor === raiz ||
      valor.startsWith(`${raiz}/`) ||
      valor.startsWith(`${raiz}?`),
  );
  return interno ? valor : padrao;
}
