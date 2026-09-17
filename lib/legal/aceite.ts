import "server-only";

import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";
import { createClient } from "@/lib/supabase/server";

/**
 * Grava o aceite da versão vigente dos dois documentos, para **qualquer papel**.
 *
 * Mora aqui, e não numa Server Action, pelo mesmo motivo de
 * `lib/feed/escrita.ts`: aluno e personal fazem a mesma escrita, e
 * `term_acceptances_insert` sempre tratou os dois igual (`user_id = auth.uid()`,
 * neutro de papel). Mas a **autorização** continua no lado de quem chama —
 * `requireStudent()` no app, `requireTrainer()` no painel —, e cada ação passa
 * adiante o id que ele devolveu. Sem isso seriam duas cópias da mesma regra,
 * que é como elas divergem.
 *
 * **A versão vem da constante do servidor, nunca do formulário.** O campo
 * escondido da tela diz qual texto estava na frente de quem aceitou, mas quem
 * decide qual versão vale é quem serve o texto. A data também não passa por
 * aqui: o gatilho `private.carimba_aceite` carimba com o relógio do banco, e
 * sem isso um POST direto gravaria aceite anterior à mudança do texto.
 *
 * `upsert` com `ignoreDuplicates` porque a chave única é
 * `(user_id, documento, versao)`: dois toques no mesmo botão não podem virar
 * erro na cara de quem já aceitou.
 */
export async function registrarAceite(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("term_acceptances").upsert(
    ["termos", "privacidade"].map((documento) => ({
      user_id: userId,
      documento,
      versao: VERSAO_DOS_DOCUMENTOS,
    })),
    { onConflict: "user_id,documento,versao", ignoreDuplicates: true },
  );

  return !error;
}
