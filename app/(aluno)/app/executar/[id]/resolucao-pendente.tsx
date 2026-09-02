"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";

import { useMontado } from "@/lib/usar-montado";

import { encerrarPendenteEComecar, registrarSeries } from "../actions";
import { apagarFilaDeSessao, seriesGuardadasDe } from "./usar-fila-de-series";

export interface ResolucaoPendenteProps {
  sessaoId: string;
  sessaoWorkoutId: string;
  /** Séries que o **servidor** já tem desta sessão. */
  seriesNoServidor: number;
  treinoId: string;
  treinoLabel: string;
}

/**
 * O que fazer com a sessão em andamento de outro treino.
 *
 * Precisa ser cliente por um motivo só, e é o motivo de existir: **a contagem
 * do servidor não é evidência de sessão vazia.** Um treino feito sem sinal tem
 * zero linhas no banco e N na fila deste aparelho. Decidir por `series === 0`
 * apagava a linha de `workout_sessions` — e com ela a sessão inteira que o
 * aluno acabou de treinar — enquanto a tela dizia "ainda não tem nenhuma
 * série".
 *
 * Então: antes de oferecer qualquer coisa destrutiva, este componente envia o
 * que o aparelho guarda daquela sessão. Enquanto houver série guardada, a ação
 * de encerrar não aparece.
 */
export function ResolucaoDaSessaoPendente(props: ResolucaoPendenteProps) {
  // `key` na virada da hidratação: só depois dela o `localStorage` pode ser
  // lido sem fazer o cliente desenhar o que não está no HTML do servidor.
  const montado = useMontado();
  return <Resolucao key={montado ? "cliente" : "servidor"} armazenamento={montado} {...props} />;
}

function Resolucao({
  sessaoId,
  sessaoWorkoutId,
  seriesNoServidor,
  treinoId,
  treinoLabel,
  armazenamento,
}: ResolucaoPendenteProps & { armazenamento: boolean }) {
  const router = useRouter();
  const [guardadas, setGuardadas] = useState(() =>
    armazenamento ? seriesGuardadasDe(sessaoId) : [],
  );
  const [enviando, setEnviando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const enviarGuardadas = useCallback(async () => {
    setEnviando(true);
    setFalhou(false);
    try {
      const resultado = await registrarSeries({
        sessionId: sessaoId,
        series: guardadas,
      });
      if (!resultado.ok) {
        setFalhou(true);
        return;
      }
      // Só apaga depois do `ok` do servidor — a ordem inversa perderia tudo
      // numa resposta que não chegou.
      apagarFilaDeSessao(sessaoId);
      setGuardadas([]);
      // A contagem do servidor muda com isto, e é ela que decide se a sessão
      // pode ser descartada ou tem que ser encerrada e salva.
      router.refresh();
    } catch {
      setFalhou(true);
    } finally {
      setEnviando(false);
    }
  }, [guardadas, router, sessaoId]);

  // Tenta sozinho ao abrir. O `setTimeout` mantém o `setState` fora do corpo
  // do efeito, que o lint do projeto recusa por causar render em cascata.
  useEffect(() => {
    if (!guardadas.length || enviando || falhou) return;
    const relogio = setTimeout(() => void enviarGuardadas(), 0);
    return () => clearTimeout(relogio);
  }, [guardadas.length, enviando, falhou, enviarGuardadas]);

  const total = seriesNoServidor + guardadas.length;

  return (
    <>
      <p className="text-[14px] leading-relaxed text-dark-text-2">
        {total > 0
          ? `${total} ${total === 1 ? "série registrada" : "séries registradas"}.`
          : "Ainda não tem nenhuma série registrada."}
      </p>

      <div className="mt-6 space-y-2.5">
        <Link
          href={`/app/executar/${sessaoWorkoutId}`}
          className="flex h-[52px] w-full items-center justify-center rounded-[13px] bg-brand text-[16px] font-bold text-white shadow-cta transition active:scale-[0.99]"
        >
          Retomar esse treino
        </Link>

        {guardadas.length ? (
          <SeriesGuardadas
            quantidade={guardadas.length}
            enviando={enviando}
            falhou={falhou}
            aoTentarDeNovo={() => void enviarGuardadas()}
          />
        ) : (
          <form action={encerrarPendenteEComecar}>
            <input type="hidden" name="sessaoId" value={sessaoId} />
            <input type="hidden" name="treinoId" value={treinoId} />
            <button
              type="submit"
              className="h-[52px] w-full rounded-[13px] border-[1.5px] border-dark-border-2 text-[15px] font-bold text-dark-text-2 transition active:scale-[0.99]"
            >
              {seriesNoServidor > 0
                ? `Encerrar e começar o Treino ${treinoLabel}`
                : `Descartar e começar o Treino ${treinoLabel}`}
            </button>
          </form>
        )}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-4">
        {guardadas.length
          ? "Nada é encerrado enquanto houver série guardada neste aparelho."
          : seriesNoServidor > 0
            ? "Encerrar salva o que já foi feito no histórico. Nenhuma série é apagada."
            : "Sem nenhuma série registrada, não há o que guardar."}
      </p>
    </>
  );
}

/**
 * O bloqueio. Enquanto o aparelho guardar série daquela sessão, encerrar não é
 * oferecido — encerrar ou descartar aqui perderia um treino inteiro feito sem
 * sinal.
 */
function SeriesGuardadas({
  quantidade,
  enviando,
  falhou,
  aoTentarDeNovo,
}: {
  quantidade: number;
  enviando: boolean;
  falhou: boolean;
  aoTentarDeNovo: () => void;
}) {
  return (
    <div
      role="status"
      className="rounded-card border border-dark-border bg-dark-surface p-3.5"
    >
      <p className="flex items-center gap-2 text-[13px] font-bold text-dark-text">
        <CloudOff aria-hidden size={15} />
        {quantidade}{" "}
        {quantidade === 1
          ? "série guardada neste aparelho"
          : "séries guardadas neste aparelho"}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-4">
        {enviando
          ? "Enviando para o servidor…"
          : "Elas ainda não chegaram ao servidor. Este treino não pode ser encerrado antes disso."}
      </p>

      {falhou ? (
        <button
          type="button"
          onClick={aoTentarDeNovo}
          className="mt-3 h-11 w-full rounded-button border-[1.5px] border-dark-border-2 text-[14px] font-bold text-dark-text-2 transition active:scale-[0.99]"
        >
          Tentar enviar de novo
        </button>
      ) : null}
    </div>
  );
}
