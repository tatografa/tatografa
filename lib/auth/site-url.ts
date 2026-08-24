import { headers } from "next/headers";

/**
 * Origem pública do site, para montar os links que vão nos e-mails do Supabase
 * (confirmação de conta, recuperação de senha).
 *
 * Em produção use `NEXT_PUBLIC_SITE_URL` — é o único valor confiável quando há
 * CDN na frente. Em desenvolvimento, deduz dos cabeçalhos.
 */
export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}
