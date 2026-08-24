/**
 * Leitura das variáveis do Supabase num só lugar, com erro legível.
 * Sem isso, esquecer o `.env.local` vira um "Invalid URL" sem contexto.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. Copie .env.example para .env.local e preencha.`,
    );
  }
  return value;
}

export const supabaseUrl = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabasePublishableKey = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
