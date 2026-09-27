"use client";

import { PlayCircle } from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/components/ui";
import { VideoDoExercicio } from "@/components/video-do-exercicio";
import type { ExercicioDisponivel } from "@/lib/queries/exercicios";

/**
 * "Como fazer": o vídeo, a descrição e as instruções de segurança que o
 * personal cadastrou no exercício (migration 0038, decisão do Otávio de 27/09).
 *
 * Folha de baixo, e não tela nova: o aluno está no meio de uma série, e sair da
 * execução para ver um vídeo faria o cronômetro de descanso e a posição na
 * lista dependerem de voltar pelo caminho certo. Sem conteúdo nenhum o botão
 * não aparece — um "Como fazer" que abre vazio ensina a não abrir.
 */
export function ComoFazer({ exercicio }: { exercicio: ExercicioDisponivel }) {
  const [aberto, setAberto] = useState(false);
  const temConteudo = Boolean(exercicio.video_url || exercicio.description || exercicio.safety_notes);
  if (!temConteudo) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-2.5 inline-flex min-h-9 items-center gap-1.5 rounded-[8px] border border-dark-border px-2.5 text-[12px] font-semibold text-dark-text-2 transition hover:border-dark-border-2 hover:text-dark-text"
      >
        <PlayCircle size={14} aria-hidden /> Como fazer
      </button>

      <BottomSheet aberto={aberto} aoFechar={() => setAberto(false)} titulo={exercicio.name}>
        <div className="space-y-4">
          {exercicio.video_url ? (
            <VideoDoExercicio url={exercicio.video_url} nome={exercicio.name} className="rounded-[12px]" />
          ) : null}
          {exercicio.description ? (
            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.06em] text-dark-muted uppercase">
                Execução
              </h3>
              <p className="text-[14px] leading-relaxed whitespace-pre-line text-dark-text-2">
                {exercicio.description}
              </p>
            </section>
          ) : null}
          {exercicio.safety_notes ? (
            <section>
              <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.06em] text-dark-muted uppercase">
                Segurança
              </h3>
              <p className="text-[14px] leading-relaxed whitespace-pre-line text-dark-text-2">
                {exercicio.safety_notes}
              </p>
            </section>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
}
