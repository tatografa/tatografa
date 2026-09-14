import "server-only";

import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";
import { createClient } from "@/lib/supabase/server";

/**
 * O usuário já aceitou a **versão vigente** dos dois documentos?
 *
 * `term_acceptances` guarda uma linha por (usuário, documento, versão) e não
 * aceita update nem delete (migration 0017). Então "está em dia" é literalmente
 * "existem as duas linhas da versão de hoje" — não há campo para sobrescrever
 * nem data para interpretar.
 *
 * Os dois documentos são conferidos separadamente porque a tabela os separa. Na
 * prática eles sobem de versão juntos, mas o dia em que só um mudar, esta
 * função já está certa.
 */
export async function aceiteEstaEmDia(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("term_acceptances")
    .select("documento")
    .eq("user_id", userId)
    .eq("versao", VERSAO_DOS_DOCUMENTOS);

  if (error) throw error;

  const aceitos = new Set((data ?? []).map((linha) => linha.documento));
  return aceitos.has("termos") && aceitos.has("privacidade");
}
