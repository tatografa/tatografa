"use client";

import { Check, EllipsisVertical, Flag, History, Pencil } from "lucide-react";
import { useState } from "react";

import { BottomSheet } from "@/components/ui";
import { LIMITE_DA_OBSERVACAO_DO_TREINO } from "@/lib/domain/execucao";
import { textoDaUltimaVez, type UltimaVez } from "@/lib/domain/recordes";

import { salvarObservacaoDoTreino } from "../actions";

type Aberto = null | "menu" | "observacao" | "historico";

/**
 * O menu ⋮ da execução (doc 05 §5), que o handoff pedia e nunca existiu.
 *
 * O doc lista quatro ações; três entram aqui. **"Trocar exercício" ficou de
 * fora de propósito**: a leitura óbvia — substituir o exercício prescrito por
 * outro do catálogo — esbarra em `private.serie_no_treino_da_sessao` (migration
 * 0009), que recusa série apontando para fora do treino da sessão. Não é
 * ajuste de tela, é decisão de produto sobre quem manda na prescrição quando a
 * máquina está ocupada, e ela é do Otávio.
 *
 * O botão fica no topo à direita, **ao lado** do contador de séries pendentes
 * em vez de no lugar dele: o contador é o que torna aceitável a fila viver no
 * aparelho, e escondê-lo atrás de um menu desfaria essa promessa.
 */
export function MenuDaExecucao({
  sessionId,
  exercicio,
  ultima,
  observacaoInicial,
  aoEncerrar,
  encerrando,
  podeEncerrar,
}: {
  sessionId: string;
  /** O exercício aberto agora — o histórico do menu é o dele. */
  exercicio: { nome: string };
  /** A referência já carregada pela página. Nenhuma consulta nova daqui. */
  ultima: UltimaVez | undefined;
  observacaoInicial: string | null;
  /** O mesmo `finalizar` do rodapé: esvazia a fila, fecha e navega. */
  aoEncerrar: () => void;
  encerrando: boolean;
  /**
   * Falso enquanto nenhuma série foi registrada. Encerrar uma sessão vazia
   * não fecha nada — ela é descartada —, e oferecer "encerrar" a quem não
   * começou é oferecer um botão que não faz o que diz.
   */
  podeEncerrar: boolean;
}) {
  const [aberto, setAberto] = useState<Aberto>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto("menu")}
        aria-label="Mais opções do treino"
        className="-mr-2 flex size-11 items-center justify-center text-dark-text-2 transition active:scale-95"
      >
        <EllipsisVertical aria-hidden size={20} />
      </button>

      <BottomSheet
        aberto={aberto === "menu"}
        aoFechar={() => setAberto(null)}
        titulo="Treino"
      >
        <ul className="space-y-1">
          <li>
            <ItemDoMenu
              icone={<Pencil aria-hidden size={17} />}
              rotulo={
                observacaoInicial
                  ? "Editar observação do treino"
                  : "Anotar algo sobre o treino"
              }
              detalhe={observacaoInicial ?? undefined}
              onClick={() => setAberto("observacao")}
            />
          </li>
          <li>
            <ItemDoMenu
              icone={<History aria-hidden size={17} />}
              rotulo="Última vez neste exercício"
              detalhe={exercicio.nome}
              onClick={() => setAberto("historico")}
            />
          </li>
          {podeEncerrar && (
            <li>
              <ItemDoMenu
                icone={<Flag aria-hidden size={17} />}
                rotulo={encerrando ? "Encerrando…" : "Encerrar treino agora"}
                detalhe="Salva o que você já fez e fecha a sessão."
                onClick={aoEncerrar}
                desabilitado={encerrando}
              />
            </li>
          )}
        </ul>
      </BottomSheet>

      <Observacao
        aberto={aberto === "observacao"}
        aoFechar={() => setAberto(null)}
        sessionId={sessionId}
        inicial={observacaoInicial}
      />

      <BottomSheet
        aberto={aberto === "historico"}
        aoFechar={() => setAberto(null)}
        titulo={exercicio.nome}
      >
        <Historico ultima={ultima} />
      </BottomSheet>
    </>
  );
}

function ItemDoMenu({
  icone,
  rotulo,
  detalhe,
  onClick,
  desabilitado = false,
}: {
  icone: React.ReactNode;
  rotulo: string;
  detalhe?: string;
  onClick: () => void;
  desabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className="flex w-full items-center gap-3 rounded-[13px] px-3 py-3.5 text-left transition disabled:opacity-50 active:bg-dark-elev"
    >
      <span className="shrink-0 text-dark-muted">{icone}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-dark-text">
          {rotulo}
        </span>
        {detalhe && (
          <span className="mt-0.5 block truncate text-[12.5px] text-dark-muted">
            {detalhe}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * O que o aluno levantou da última vez neste exercício, série por série.
 *
 * Sem consulta nova: é a mesma `UltimaVez` que a página já carregou para a
 * pílula "última vez: 60 kg × 10". A pílula cabe uma linha; aqui cabe a série
 * inteira, que é o que decide a carga de hoje.
 */
function Historico({ ultima }: { ultima: UltimaVez | undefined }) {
  // A guarda é em `ultima`, e não no tamanho da lista, porque `textoDaUltimaVez`
  // abaixo exige o objeto: checar só `series.length` deixaria o TypeScript sem
  // como saber que ele existe.
  const series = ultima
    ? Object.entries(ultima.porSerie).sort((a, b) => Number(a[0]) - Number(b[0]))
    : [];

  if (!ultima || !series.length) {
    return (
      <p className="px-3 pb-2 text-[14px] leading-[1.6] text-dark-muted">
        Primeira vez que você faz este exercício. Depois de hoje, a carga da
        última vez aparece aqui.
      </p>
    );
  }

  return (
    <div className="pb-1">
      <p className="px-3 text-[13px] text-dark-muted">
        {textoDaUltimaVez(ultima)}
      </p>
      <ul className="mt-2.5 space-y-1">
        {series.map(([numero, serie]) => (
          <li
            key={numero}
            className="flex items-center gap-3 rounded-[11px] bg-dark-surface px-3 py-2.5"
          >
            <span className="font-mono text-[12px] font-bold text-dark-muted">
              {numero}
            </span>
            <span className="text-[14.5px] font-semibold text-dark-text tabular-nums">
              {serie.carga === null || serie.carga === 0
                ? "Peso corporal"
                : `${serie.carga} kg`}
              {serie.reps !== null && (
                <span className="font-normal text-dark-text-2">
                  {" "}
                  × {serie.reps}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * O campo de observação.
 *
 * Grava numa ação só e fecha. O erro fica na folha em vez de sumir com ela —
 * ao contrário do sucesso, um erro que fecha a tela é um erro que ninguém lê.
 */
function Observacao({
  aberto,
  aoFechar,
  sessionId,
  inicial,
}: {
  aberto: boolean;
  aoFechar: () => void;
  sessionId: string;
  inicial: string | null;
}) {
  const [texto, setTexto] = useState(inicial ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const resultado = await salvarObservacaoDoTreino({ sessionId, texto });
    setSalvando(false);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    aoFechar();
  }

  const restam = LIMITE_DA_OBSERVACAO_DO_TREINO - texto.length;

  return (
    <BottomSheet aberto={aberto} aoFechar={aoFechar} titulo="Observação do treino">
      <p className="mb-2.5 text-[13px] leading-[1.5] text-dark-muted">
        O que o número não conta: dor, sono ruim, máquina ocupada. Seu personal
        lê isso junto do treino.
      </p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={LIMITE_DA_OBSERVACAO_DO_TREINO}
        rows={4}
        aria-label="Observação sobre este treino"
        placeholder="Ombro direito doeu, fui leve no supino."
        className="w-full rounded-[13px] border-[1.5px] border-dark-border-2 bg-dark-bg px-3.5 py-3 text-[15px] text-dark-text placeholder:text-dark-muted focus:border-brand-on-dark focus:outline-none"
      />

      {/* O contador só perto do teto: visível sempre, ele transforma um campo
          de texto livre num campo com cota. */}
      {texto.length >= LIMITE_DA_OBSERVACAO_DO_TREINO - 100 && (
        <p className="mt-1 text-right font-mono text-[11px] text-dark-muted tabular-nums">
          {restam}
        </p>
      )}

      {erro && (
        <p className="mt-2 text-[13px] font-semibold text-danger">{erro}</p>
      )}

      <div className="mt-3 flex gap-2.5">
        <button
          type="button"
          onClick={aoFechar}
          disabled={salvando}
          className="h-[50px] flex-1 rounded-[13px] border-[1.5px] border-dark-border-2 text-[14px] font-bold text-dark-text-2 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void salvar()}
          disabled={salvando}
          className="flex h-[50px] flex-[1.3] items-center justify-center gap-1.5 rounded-[13px] bg-brand-on-dark text-[14px] font-bold text-white disabled:opacity-60"
        >
          <Check aria-hidden size={16} />
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </BottomSheet>
  );
}
