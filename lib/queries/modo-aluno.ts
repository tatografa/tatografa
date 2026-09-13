import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * O personal já é aluno de si mesmo?
 *
 * "Ser aluno de si mesmo" é uma linha em `students` com `id` e `trainer_id`
 * iguais ao próprio usuário — não existe coluna de "modo" nem tabela nova. A
 * policy `students_insert` (migration 0019) é o que torna essa linha, e só
 * essa, criável pela API.
 *
 * Consultar por `id` e não por `(id, trainer_id)` é de propósito: `id` é a
 * chave primária, então a linha do personal só pode ser a dele. Se um dia ele
 * for aluno de outro personal, esta função devolve verdadeiro do mesmo jeito —
 * e está certo: ele tem app de aluno, que é o que a pergunta quer saber.
 */
export async function tenhoPerfilDeAluno(trainerId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("id", trainerId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
