"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CloudOff, History, Pencil, X } from "lucide-react";

import { Stepper } from "@/components/aluno/stepper";
import { TimerDeDescanso } from "@/components/aluno/timer-de-descanso";
import {
  alvoDeRepeticoes,
  chaveDaSerie,
  execucaoConcluida,
  exercicioConcluido,
  LIMITES_DA_EXECUCAO,
  PASSO_DE_CARGA,
  primeiroExercicioPendente,
  progressoDaExecucao,
  serieAtiva,
  seriesQueFaltam,
  type SerieDaExecucao,
} from "@/lib/domain/execucao";
import { textoDaUltimaVez, type UltimaVez } from "@/lib/domain/recordes";
import { comoRelogio } from "@/lib/domain/treino";
import type { ExercicioPrescrito, TreinoCompleto } from "@/lib/queries/treinos";
import { useMontado } from "@/lib/usar-montado";
import { cn } from "@/lib/utils";

import { concluirTreino } from "../actions";
import { useFilaDeSeries } from "./usar-fila-de-series";

/**
 * Só o que precisa sobreviver a recarregar a página. Nada de dado de série.
 *
 * A chave é por sessão, como a da fila (`usar-fila-de-series.ts`): com chave
 * global, concluir um treino apagava a tela gravada de outra sessão que ainda
 * estivesse no aparelho — o caso do celular emprestado na academia.
 */
const PREFIXO_DA_TELA = "repsclub.execucao.tela.v1";

function chaveDaTela(sessionId: string): string {
  return `${PREFIXO_DA_TELA}:${sessionId}`;
}

type TelaGravada = {
  sessionId: string;
  indice: number;
  descansoAte: number | null;
};

export type SessaoEmExecucao = { id: string; started_at: string };

export interface ExecucaoProps {
  treino: TreinoCompleto;
  sessao: SessaoEmExecucao;
  /** As séries que o servidor já tem. A fila cobre por cima o que falta. */
  seriesIniciais: SerieDaExecucao[];
  /**
   * "Última vez: 60 kg × 10", por linha da prescrição
   * (`workout_exercises.id`). Exercício nunca feito não aparece aqui, e a tela
   * não desenha pílula nenhuma — "0 kg" seria mentira sobre um treino que não
   * aconteceu.
   */
  referencia: Record<string, UltimaVez>;
}

/** Qual série já registrada está aberta para correção. */
type EmEdicao = { exercicioId: string; numero: number };

/**
 * A tela de execução (doc 05, seção 5). Tema escuro, uma mão só, de pé.
 *
 * O componente não fala com o banco: ele confirma séries na fila
 * (`useFilaDeSeries`) e desenha o estado que `lib/domain/execucao.ts` calcula.
 * As duas únicas idas ao servidor daqui são o envio da fila e o fechamento da
 * sessão.
 */
export function Execucao(props: ExecucaoProps) {
  /*
   * `montado` é `false` no servidor e no render de hidratação, e `true` daí em
   * diante. A `key` remonta a execução nessa virada, e só então os
   * inicializadores de estado leem o `localStorage`.
   *
   * Testar `typeof window` no lugar disto não serviria: no render de
   * hidratação a janela já existe, e ler a fila ali desenharia séries que não
   * estão no HTML do servidor. Antes da virada a tela mostra o que veio do
   * banco — não é um esqueleto vazio, é o treino já retomado pelo servidor.
   */
  const montado = useMontado();
  return (
    <ExecucaoMontada
      key={montado ? "cliente" : "servidor"}
      armazenamento={montado}
      {...props}
    />
  );
}

function ExecucaoMontada({
  treino,
  sessao,
  seriesIniciais,
  referencia,
  armazenamento,
}: ExecucaoProps & { armazenamento: boolean }) {
  const router = useRouter();
  const fila = useFilaDeSeries(sessao.id, seriesIniciais, armazenamento);
  const { series } = fila;

  // O exercício aberto e o descanso em curso vêm do armazenamento; o índice é
  // preso à lista atual porque o personal pode ter removido exercícios entre a
  // sessão começar e o app reabrir, e um índice fora da lista deixaria a tela
  // em branco no meio do treino.
  const [retomado] = useState(() =>
    armazenamento ? lerTela(sessao.id) : null,
  );
  const [indice, setIndice] = useState(() =>
    retomado
      ? Math.min(Math.max(0, retomado.indice), treino.exercicios.length - 1)
      : primeiroExercicioPendente(treino.exercicios, series),
  );
  const [descansoAte, setDescansoAte] = useState<number | null>(
    () => retomado?.descansoAte ?? null,
  );
  const [emEdicao, setEmEdicao] = useState<EmEdicao | null>(null);
  const [valores, setValores] = useState<Record<string, Valores>>({});
  const [concluindo, setConcluindo] = useState(false);
  const [avisoDeEnvio, setAvisoDeEnvio] = useState<string | null>(null);

  useEffect(() => {
    if (!armazenamento) return;
    gravarTela({ sessionId: sessao.id, indice, descansoAte });
  }, [armazenamento, sessao.id, indice, descansoAte]);

  const exercicio = treino.exercicios[indice];
  const progresso = progressoDaExecucao(treino.exercicios, series);
  const acabou = execucaoConcluida(treino.exercicios, series);
  const ultimo = indice >= treino.exercicios.length - 1;

  const confirmar = useCallback(
    (serie: SerieDaExecucao, iniciarDescanso: boolean, descanso: number) => {
      fila.registrar([serie]);
      // O rascunho do stepper cumpriu o papel: daqui em diante o valor da
      // série é o registro, não o rascunho.
      setValores((v) => {
        const resto = { ...v };
        delete resto[chaveDaSerie(serie.workout_exercise_id, serie.set_number)];
        return resto;
      });
      setEmEdicao(null);
      setAvisoDeEnvio(null);
      // Correção de série antiga não inicia descanso: o aluno está arrumando um
      // número, não acabou de levantar.
      if (iniciarDescanso && descanso > 0) {
        setDescansoAte(Date.now() + descanso * 1000);
      }
    },
    [fila],
  );

  const pularExercicio = useCallback(() => {
    if (!exercicio) return;
    // As séries que faltam viram registro `skipped`, não sumiço: sem isso o
    // exercício voltaria a aparecer como pendente ao reabrir o app, e a barra
    // de progresso nunca fecharia.
    fila.registrar(seriesQueFaltam(exercicio, series));
    setDescansoAte(null);
    setEmEdicao(null);
    if (!ultimo) setIndice((i) => i + 1);
  }, [exercicio, fila, series, ultimo]);

  const finalizar = useCallback(async () => {
    setConcluindo(true);
    setAvisoDeEnvio(null);
    try {
      // `esvaziar` devolve "a fila ficou vazia", não "o lote que enviei foi
      // aceito". Fechar a sessão antes disso gravaria uma duração e um volume
      // sem as séries ainda a caminho.
      const vazia = await fila.esvaziar();
      if (!vazia) {
        setAvisoDeEnvio(
          "Ainda há séries para enviar. Assim que a internet voltar, toque de novo.",
        );
        return;
      }

      const resultado = await concluirTreino({ sessionId: sessao.id });
      if (!resultado.ok) {
        setAvisoDeEnvio(resultado.erro);
        return;
      }

      /*
       * Entre o `await` de cima e este ponto o aluno pode ter confirmado ou
       * corrigido uma série. `descartar` recusa quando a fila não está vazia —
       * antes disso ele apagava esse item, e como a sessão já fechou não havia
       * reenvio para recuperá-lo. A gravação aceita sessão encerrada, então a
       * série tardia ainda entra no histórico.
       */
      if (!fila.descartar()) {
        const tardias = await fila.esvaziar();
        if (!tardias || !fila.descartar()) {
          setAvisoDeEnvio(
            "A última série ainda não foi enviada. Toque em concluir de novo quando a internet voltar.",
          );
          return;
        }
      }

      apagarTela(sessao.id);
      router.replace(`/app/executar/${treino.id}/fim`);
    } catch {
      setAvisoDeEnvio("Não deu para concluir agora. Tente de novo.");
    } finally {
      setConcluindo(false);
    }
  }, [fila, router, sessao.id, treino.id]);

  if (!exercicio) return null;

  const ativa = serieAtiva(exercicio, series);
  const podeConcluir = acabou || ultimo;

  return (
    // A execução cobre a moldura do app: fundo escuro de borda a borda e sem a
    // bottom nav, que só atrapalharia quem está de pé com o celular na mão.
    <div className="fixed inset-0 z-40 flex flex-col bg-dark-bg text-dark-text">
      <Cabecalho
        treino={treino}
        indice={indice}
        fracao={progresso.fracao}
        inicioEm={sessao.started_at}
        pendentes={fila.pendentes}
      />

      <main className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="mx-auto max-w-[440px]">
          <h1 className="mt-4 text-[26px] leading-tight font-extrabold tracking-[-0.02em] text-dark-text">
            {exercicio.exercicio.name}
          </h1>
          <p className="mt-1 text-[13px] text-ink-4">
            {exercicio.sets} séries · {exercicio.reps_target} reps ·{" "}
            {exercicio.rest_seconds}s descanso
          </p>

          <UltimaVezDoExercicio ultima={referencia[exercicio.id]} />

          {exercicio.technique ? (
            <p className="mt-2.5 inline-block rounded-[8px] border border-dark-border px-2.5 py-1.5 text-[11px] font-medium text-ink-5">
              {exercicio.technique}
            </p>
          ) : null}

          {exercicio.notes ? (
            <p className="mt-2.5 rounded-card bg-dark-surface p-3 text-[13px] leading-relaxed text-dark-text-2">
              {exercicio.notes}
            </p>
          ) : null}

          <ol className="mt-4 space-y-2">
            {numerosDasSeries(exercicio).map((numero) => {
              const registrada = series.get(chaveDaSerie(exercicio.id, numero));
              const editando =
                emEdicao?.exercicioId === exercicio.id &&
                emEdicao.numero === numero;
              const estaAtiva = !registrada && ativa === numero;

              if (editando || estaAtiva) {
                const chave = chaveDaSerie(exercicio.id, numero);
                return (
                  <li key={numero}>
                    <SerieAtiva
                      numero={numero}
                      exercicio={exercicio}
                      valores={valores[chave] ?? padraoPara(exercicio, numero, series)}
                      aoMudar={(novos) =>
                        setValores((v) => ({ ...v, [chave]: novos }))
                      }
                      correcao={Boolean(editando && registrada)}
                      // Confirmar durante a conclusão criaria justamente a
                      // série que a sessão já fechada não esperaria.
                      desabilitado={concluindo}
                      aoCancelar={() => {
                        // O rascunho do stepper morre com o cancelamento: sem
                        // isto, reabrir a série mostrava o valor abandonado e
                        // um toque no ✓ gravava um número que o aluno tinha
                        // desistido de gravar.
                        setValores((v) => {
                          const resto = { ...v };
                          delete resto[chave];
                          return resto;
                        });
                        setEmEdicao(null);
                      }}
                      aoConfirmar={(v) =>
                        confirmar(
                          {
                            workout_exercise_id: exercicio.id,
                            set_number: numero,
                            load_kg: exercicio.exercicio.is_bodyweight
                              ? null
                              : v.carga,
                            reps: v.reps,
                            skipped: false,
                          },
                          !editando,
                          exercicio.rest_seconds,
                        )
                      }
                    />
                  </li>
                );
              }

              return (
                <li key={numero}>
                  <SerieRegistrada
                    numero={numero}
                    serie={registrada}
                    bodyweight={exercicio.exercicio.is_bodyweight}
                    aoCorrigir={() =>
                      setEmEdicao({ exercicioId: exercicio.id, numero })
                    }
                  />
                </li>
              );
            })}
          </ol>

          {avisoDeEnvio ? (
            <p
              role="status"
              className="mt-4 rounded-card border border-dark-border bg-dark-surface p-3 text-[13px] leading-relaxed text-dark-text-2"
            >
              {avisoDeEnvio}
            </p>
          ) : null}

          {fila.aviso ? (
            <p
              role="alert"
              className="mt-4 rounded-card border border-brand bg-brand-tint p-3 text-[13px] leading-relaxed text-dark-text"
            >
              {fila.aviso}
            </p>
          ) : null}
        </div>
      </main>

      {descansoAte !== null ? (
        <TimerDeDescanso
          fimEm={descansoAte}
          aoPular={() => setDescansoAte(null)}
          aoAcrescentar={(segundos) =>
            setDescansoAte((fim) =>
              // Somar ao fim, e não ao restante, mantém o timer correto mesmo
              // se o aluno tocar "+30s" com a contagem já zerada.
              Math.max(fim ?? Date.now(), Date.now()) + segundos * 1000,
            )
          }
        />
      ) : null}

      <footer className="border-t border-dark-border bg-dark-bg px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-[440px] gap-2.5">
          <button
            type="button"
            onClick={pularExercicio}
            // Também trava durante a conclusão: pular enfileira as séries que
            // faltam, e uma série que entra depois do `await` cai na sessão
            // que acabou de fechar.
            disabled={exercicioConcluido(exercicio, series) || concluindo}
            className="h-[52px] flex-1 rounded-[13px] border-[1.5px] border-dark-border-2 text-[14px] font-bold text-dark-text-2 transition disabled:opacity-30 active:scale-[0.99]"
          >
            Pular exercício
          </button>

          {podeConcluir ? (
            <button
              type="button"
              onClick={() => void finalizar()}
              disabled={concluindo}
              className="h-[52px] flex-[1.3] rounded-[13px] bg-brand text-[14px] font-bold text-white shadow-cta transition disabled:opacity-60 active:scale-[0.99]"
            >
              {concluindo ? "Concluindo…" : "Concluir treino"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDescansoAte(null);
                setEmEdicao(null);
                setIndice((i) => Math.min(i + 1, treino.exercicios.length - 1));
              }}
              className="h-[52px] flex-[1.3] rounded-[13px] bg-dark-elev text-[14px] font-bold text-dark-text transition active:scale-[0.99]"
            >
              Próximo exercício →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/**
 * A pílula de referência histórica (doc 05).
 *
 * Fica logo abaixo da prescrição porque é a decisão que ela informa: o aluno
 * olha "última vez: 60 kg × 10" e escolhe o peso da série de agora. Sem
 * histórico, nada é desenhado — o espaço vazio diz a verdade melhor que um
 * traço.
 */
function UltimaVezDoExercicio({ ultima }: { ultima: UltimaVez | undefined }) {
  if (!ultima) return null;
  const texto = textoDaUltimaVez(ultima);
  if (!texto) return null;

  return (
    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-dark-surface px-3 py-1.5 text-[12px] font-semibold text-dark-text-2">
      <History aria-hidden size={13} className="text-ink-4" />
      <span className="text-ink-4">Última vez:</span> {texto}
    </p>
  );
}

// ------------------------------------------------------------ cabeçalho ----

function Cabecalho({
  treino,
  indice,
  fracao,
  inicioEm,
  pendentes,
}: {
  treino: TreinoCompleto;
  indice: number;
  fracao: number;
  inicioEm: string;
  pendentes: number;
}) {
  return (
    <header className="border-b border-dark-border bg-dark-bg px-5 pt-[calc(12px+env(safe-area-inset-top))] pb-3">
      <div className="mx-auto max-w-[440px]">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/app/treinos/${treino.id}`}
            aria-label="Sair da execução"
            className="-ml-2 flex size-11 items-center justify-center text-dark-text-2"
          >
            <ArrowLeft aria-hidden size={20} />
          </Link>

          <div className="min-w-0 text-center">
            <p className="eyebrow text-[12px] text-dark-text">
              Treino {treino.label}
            </p>
            <p className="mt-0.5 truncate font-mono text-[10px] font-medium tracking-[0.08em] text-ink-4 uppercase">
              {treino.name}
            </p>
          </div>

          <SeriesPendentes quantidade={pendentes} />
        </div>

        <div
          role="progressbar"
          aria-label="Exercícios concluídos"
          aria-valuemin={0}
          aria-valuemax={treino.exercicios.length}
          aria-valuenow={Math.round(fracao * treino.exercicios.length)}
          className="mt-3 h-1 overflow-hidden rounded-full bg-dark-elev"
        >
          <div
            className="h-full bg-brand transition-[width] duration-300"
            style={{ width: `${Math.round(fracao * 100)}%` }}
          />
        </div>

        <div className="mt-2 flex items-baseline justify-between font-mono text-[10px] tracking-[0.08em] text-ink-4 uppercase">
          <span>
            Exercício {indice + 1} de {treino.exercicios.length}
          </span>
          <Cronometro inicioEm={inicioEm} />
        </div>
      </div>
    </header>
  );
}

/**
 * O contador de séries ainda não gravadas no servidor.
 *
 * Fica no topo, sempre visível, porque é o que torna aceitável o limite de a
 * fila viver no aparelho: o aluno vê que ainda falta enviar em vez de
 * descobrir depois que sumiu.
 */
function SeriesPendentes({ quantidade }: { quantidade: number }) {
  if (!quantidade) {
    // Espaço reservado para o cabeçalho não pular quando o aviso aparece.
    return <span aria-hidden className="size-11 shrink-0" />;
  }

  return (
    <p
      role="status"
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-dark-elev px-2.5 py-1.5 text-[11px] font-bold text-dark-text-2"
    >
      <CloudOff aria-hidden size={13} />
      {quantidade}
      <span className="sr-only">
        {quantidade === 1 ? "série a enviar" : "séries a enviar"}
      </span>
    </p>
  );
}

/** Cronômetro da sessão, derivado de `started_at`. */
function Cronometro({ inicioEm }: { inicioEm: string }) {
  const inicio = useMemo(() => new Date(inicioEm).getTime(), [inicioEm]);
  const [agora, setAgora] = useState(inicio);

  // O primeiro valor é `inicio`, e não `Date.now()`, porque o inicializador de
  // estado roda dos dois lados: o relógio do servidor e o do aparelho dariam
  // números diferentes no mesmo HTML. O primeiro tique chega em até 500ms.
  useEffect(() => {
    const marcar = () => setAgora(Date.now());
    const intervalo = setInterval(marcar, 500);
    document.addEventListener("visibilitychange", marcar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", marcar);
    };
  }, []);

  return (
    <span className="tabular-nums">
      {comoRelogio(Math.max(0, (agora - inicio) / 1000))}
    </span>
  );
}

// ------------------------------------------------------------- séries ------

type Valores = { carga: number; reps: number };

function SerieAtiva({
  numero,
  exercicio,
  valores,
  correcao,
  desabilitado,
  aoMudar,
  aoConfirmar,
  aoCancelar,
}: {
  numero: number;
  exercicio: ExercicioPrescrito;
  valores: Valores;
  correcao: boolean;
  desabilitado: boolean;
  aoMudar: (valores: Valores) => void;
  aoConfirmar: (valores: Valores) => void;
  aoCancelar: () => void;
}) {
  const bodyweight = exercicio.exercicio.is_bodyweight;

  return (
    <div
      aria-current="step"
      /*
       * Colunas apertadas de propósito: com os dois steppers de alvo de toque
       * de 44px, `gap-2` e `px-3` estouravam os 390px de um celular comum e a
       * linha vazava para fora do cartão.
       */
      className="grid grid-cols-[18px_1fr_1fr_48px] items-center gap-1 rounded-card-lg border-[1.5px] border-brand bg-brand-tint px-2 py-3.5"
    >
      <span className="font-mono text-[13px] font-bold text-brand">
        {numero}
      </span>

      {bodyweight ? (
        // Exercício de peso corporal não pede carga (handoff, item 3): o
        // stepper daria um número que não existe, e `volumeDaSessao` ignora
        // carga nula de propósito.
        <p className="text-center text-[13px] font-semibold text-dark-text-2">
          peso corporal
        </p>
      ) : (
        <Stepper
          rotulo="carga"
          unidade="kg"
          valor={valores.carga}
          passo={PASSO_DE_CARGA}
          minimo={LIMITES_DA_EXECUCAO.cargaMin}
          maximo={LIMITES_DA_EXECUCAO.cargaMax}
          aoMudar={(carga) => aoMudar({ ...valores, carga })}
        />
      )}

      <Stepper
        rotulo="repetições"
        valor={valores.reps}
        passo={1}
        minimo={LIMITES_DA_EXECUCAO.repsMin}
        maximo={LIMITES_DA_EXECUCAO.repsMax}
        aoMudar={(reps) => aoMudar({ ...valores, reps })}
      />

      <div className="flex items-center justify-end gap-1">
        {correcao ? (
          <button
            type="button"
            onClick={aoCancelar}
            aria-label={`Cancelar correção da série ${numero}`}
            className="flex size-9 items-center justify-center rounded-full text-ink-4"
          >
            <X aria-hidden size={16} />
          </button>
        ) : null}
        <button
          type="button"
          disabled={desabilitado}
          onClick={() => aoConfirmar(valores)}
          aria-label={
            correcao ? `Salvar correção da série ${numero}` : `Confirmar série ${numero}`
          }
          className="flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-brand transition active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          <Check aria-hidden size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function SerieRegistrada({
  numero,
  serie,
  bodyweight,
  aoCorrigir,
}: {
  numero: number;
  serie: SerieDaExecucao | undefined;
  bodyweight: boolean;
  aoCorrigir: () => void;
}) {
  // Série sem registro e que não é a ativa: ainda vai chegar a vez dela.
  if (!serie) {
    return (
      <div className="grid grid-cols-[26px_1fr_1fr_40px] items-center gap-2 rounded-card bg-dark-surface px-3 py-3">
        <span className="font-mono text-[13px] font-bold text-dark-muted">
          {numero}
        </span>
        <span className="text-center text-[15px] font-semibold text-dark-muted">
          —
        </span>
        <span className="text-center text-[15px] font-semibold text-dark-muted">
          —
        </span>
        <span
          aria-hidden
          className="justify-self-end size-8 rounded-full border-[1.5px] border-dark-border"
        />
      </div>
    );
  }

  const carga = serie.skipped
    ? "pulada"
    : bodyweight || serie.load_kg === null
      ? "peso corporal"
      : `${formatarCarga(serie.load_kg)} kg`;

  return (
    /*
     * A série já feita é um botão inteiro para caber o polegar, mas o toque
     * acidental não muda nada: ele só abre os steppers com os valores atuais,
     * e alterar o registro exige um segundo toque deliberado no ✓ (ou sair
     * pelo ✕). O alvo grande de verdade continua sendo o ✓ da série ativa.
     */
    <button
      type="button"
      onClick={aoCorrigir}
      aria-label={`Corrigir série ${numero}: ${carga}${serie.reps === null ? "" : `, ${serie.reps} repetições`}`}
      className={cn(
        "grid w-full grid-cols-[26px_1fr_1fr_40px] items-center gap-2 rounded-card bg-dark-surface px-3 py-3 text-left",
        "opacity-50 transition active:opacity-80",
      )}
    >
      <span className="font-mono text-[13px] font-bold text-dark-text-2">
        {numero}
      </span>
      <span className="text-center text-[15px] font-semibold text-dark-text-2">
        {carga}
      </span>
      <span className="text-center text-[15px] font-semibold text-dark-text-2">
        {serie.reps === null ? "—" : serie.reps}
      </span>
      <span className="justify-self-end flex items-center gap-1">
        <Pencil aria-hidden size={12} className="text-ink-4" />
        <span
          aria-hidden
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            serie.skipped ? "border-[1.5px] border-dark-border" : "bg-success-dark",
          )}
        >
          {serie.skipped ? null : (
            <Check size={15} strokeWidth={3} className="text-white" />
          )}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------- ajuda ----

function numerosDasSeries(exercicio: ExercicioPrescrito): number[] {
  return Array.from({ length: exercicio.sets }, (_, i) => i + 1);
}

/**
 * Onde os steppers abrem.
 *
 * A carga repete a última série registrada do mesmo exercício nesta sessão —
 * é quase sempre a mesma, e o aluno não deveria ter que remontar o número a
 * cada série. As repetições abrem no alvo prescrito.
 */
function padraoPara(
  exercicio: ExercicioPrescrito,
  numero: number,
  series: Map<string, SerieDaExecucao>,
): Valores {
  const registrada = series.get(chaveDaSerie(exercicio.id, numero));
  if (registrada && !registrada.skipped) {
    return {
      carga: registrada.load_kg ?? 0,
      reps: registrada.reps ?? alvoDeRepeticoes(exercicio.reps_target),
    };
  }

  for (let anterior = numero - 1; anterior >= 1; anterior -= 1) {
    const feita = series.get(chaveDaSerie(exercicio.id, anterior));
    if (feita && !feita.skipped && feita.load_kg !== null) {
      return {
        carga: feita.load_kg,
        reps: feita.reps ?? alvoDeRepeticoes(exercicio.reps_target),
      };
    }
  }

  return { carga: 0, reps: alvoDeRepeticoes(exercicio.reps_target) };
}

function formatarCarga(valor: number): string {
  return Number.isInteger(valor)
    ? String(valor)
    : String(valor).replace(".", ",");
}

function lerTela(sessionId: string): TelaGravada | null {
  // O inicializador de estado também roda no servidor, onde não há janela.
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(chaveDaTela(sessionId));
    if (!bruto) return null;
    const gravada = JSON.parse(bruto) as TelaGravada;
    if (gravada?.sessionId !== sessionId) return null;
    if (typeof gravada.indice !== "number") return null;
    return gravada;
  } catch {
    return null;
  }
}

function gravarTela(tela: TelaGravada): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(chaveDaTela(tela.sessionId), JSON.stringify(tela));
  } catch {
    // Sem persistência a tela ainda funciona; só não retoma o exercício certo.
  }
}

function apagarTela(sessionId: string): void {
  try {
    window.localStorage.removeItem(chaveDaTela(sessionId));
  } catch {
    // Nada a fazer.
  }
}
