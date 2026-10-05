import Link from "next/link";

import { requireStudent } from "@/lib/auth/session";
import { estaNaTurma } from "@/lib/domain/turma";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { resumoDaSessaoConcluida } from "@/lib/queries/feed";

import { Compositor } from "./compositor";

/**
 * Publicar um treino (doc 05, tela 10).
 *
 * O nome do personal desce como prop porque ele é quem dá sentido às duas
 * opções de alcance: "só a Ana" e "a Ana e a turma" explicam a escolha sem
 * texto de apoio, e "privado"/"público" não explicariam.
 */
export default async function NovoPost({
  searchParams,
}: PageProps<"/app/feed/novo">) {
  const { sessao } = await searchParams;
  const { student, personal } = await requireStudent();
  const { t } = await textosDoApp();

  /*
   * `?sessao=` é texto que o aluno pode editar. A sessão é conferida aqui — é
   * dele e está concluída — e **de novo** na Server Action: esta passagem
   * decide o que a tela mostra, a de lá decide o que o banco grava.
   */
  const treino =
    typeof sessao === "string"
      ? await resumoDaSessaoConcluida(student.id, sessao)
      : null;

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <Link href="/app/feed" className="eyebrow text-ink-4 transition hover:text-ink-2">
          {t.feed.post.voltar}
        </Link>
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          {t.feed.compositor.titulo}
        </h1>
      </header>

      <Compositor
        nomeDoPersonal={personal.name.split(" ")[0]}
        sessaoId={treino ? String(sessao) : undefined}
        treino={treino}
        naTurma={estaNaTurma(student.status)}
      />
    </div>
  );
}
