import type { Metadata } from "next";
import Link from "next/link";

import { requireTrainer } from "@/lib/auth/session";
import { tenhoPerfilDeAluno } from "@/lib/queries/modo-aluno";

import { CartaoDeModoAluno } from "./cartao-de-modo-aluno";

export const metadata: Metadata = { title: "Treinar" };

/**
 * O personal treinando também — como aluno dele mesmo.
 *
 * **Por que não existe um "modo" guardado em lugar nenhum.** O painel e o app
 * do aluno são endereços diferentes (`/painel` e `/app`), cada um com a sua
 * autorização no layout. Trocar de lado é navegar. Um campo "modo atual" no
 * banco criaria um estado que pode discordar da URL — e aí a tela mostra uma
 * coisa e o banco acha outra.
 *
 * O que existe de verdade é a **linha de aluno**: `students` com `id` e
 * `trainer_id` iguais ao próprio usuário, criada uma vez, aqui. Depois disso o
 * personal aparece na própria lista de alunos, monta o próprio macrotreino no
 * editor de sempre, executa no app do aluno e posta no feed da turma. Nenhuma
 * tela nova foi escrita para nada disso.
 *
 * A página não pula sozinha para `/app` quando a linha já existe: item de menu
 * que joga o usuário para outra interface sem avisar é desorientador, ainda
 * mais quando o caminho de volta não está óbvio.
 */
export default async function Treinar() {
  const { trainer } = await requireTrainer();
  const jaSouAluno = await tenhoPerfilDeAluno(trainer.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/painel"
          className="eyebrow text-ink-4 transition hover:text-ink-2"
        >
          ← Painel
        </Link>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
          Treinar como aluno
        </h1>
        <p className="max-w-xl text-[13.5px] leading-relaxed text-ink-3">
          Você também treina. Aqui você vira aluno de si mesmo: monta o próprio
          macrotreino no mesmo editor, executa pelo app do aluno no celular e
          aparece no feed junto com a sua turma.
        </p>
      </header>

      <CartaoDeModoAluno jaSouAluno={jaSouAluno} />
    </div>
  );
}
