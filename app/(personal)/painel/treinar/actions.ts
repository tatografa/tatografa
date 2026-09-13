"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTrainer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type EstadoDoModoAluno = { erro?: string };

/**
 * Cria a linha de aluno do próprio personal e abre o app do aluno.
 *
 * Uma linha só, com `id` e `trainer_id` apontando para o mesmo usuário. A
 * partir dela o personal aparece na própria carteira, recebe macrotreino pelo
 * editor que já existe, executa pelo app do aluno e posta no feed como
 * qualquer aluno da turma — nenhuma tela nova precisou ser escrita para isso.
 *
 * `status: 'ativo'` e `onboarded_at` preenchido porque não há onboarding a
 * fazer: o nome e o e-mail já estão na linha de personal, e o resto do perfil
 * (objetivo, nível, peso) é opcional e editável depois. Deixar `convidado`,
 * que é o padrão da tabela, marcaria como pendente um cadastro que está
 * completo — e é justamente o status que ninguém usa.
 */
export async function virarAlunoDeMimMesmo(
  _anterior: EstadoDoModoAluno,
): Promise<EstadoDoModoAluno> {
  const { trainer } = await requireTrainer();
  const supabase = await createClient();

  const { error } = await supabase.from("students").insert({
    id: trainer.id,
    trainer_id: trainer.id,
    name: trainer.name,
    email: trainer.email,
    status: "ativo",
    onboarded_at: new Date().toISOString(),
  });

  if (error) {
    // 23505 é a chave única. Em `id` significa que a linha já existe — dois
    // cliques no mesmo botão, e aí seguir para `/app` é exatamente o certo.
    // Em `email` é outra coisa: alguém já é aluno com este endereço, e aí o
    // personal precisa saber, porque a linha dele não foi criada.
    if (error.code === "23505" && error.message.includes("email")) {
      return {
        erro: `Já existe um aluno cadastrado com ${trainer.email}. Como o e-mail não se repete entre alunos, esse endereço precisa ser liberado antes.`,
      };
    }
    if (error.code !== "23505") {
      return { erro: "Não conseguimos abrir seu perfil de aluno agora. Tente de novo." };
    }
  }

  // A lista de alunos do painel passa a ter mais uma linha: a dele.
  revalidatePath("/painel");
  redirect("/app");
}
