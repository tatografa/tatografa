"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Dumbbell,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { mover, LIMITES } from "@/lib/domain/prescricao";
import { resumoDoDia, subtituloDoDia } from "@/lib/domain/divisao";
import { GRUPO_MUSCULAR } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

import type { ErroDeExercicio, ResultadoDoTreino } from "./actions";
import { BOTAO_DE_ICONE, CAMPO, CAMPO_COM_ERRO } from "./estilos";
import { foiAlterado, type DiaDoQuadro, type ItemDoQuadro } from "./quadro";

type ErrosDoCartao = Extract<ResultadoDoTreino, { ok: false }>;

/**
 * Um treino da divisão: o cartão de 400px do protótipo.
 *
 * Cada exercício mostra SÉRIES · REPS · RIR fechado e abre, num clique, os
 * campos da prescrição. **Não há "séries detalhadas" série a série** como no
 * protótipo: a prescrição continua por exercício (decisão do Otávio, 27/09), e
 * o que abriu no lugar é o que o editor antigo tinha — descanso, técnica e
 * observação.
 */
export function CartaoDoTreino({
  dia,
  erros,
  ocupado,
  aoMudar,
  aoAdicionarExercicio,
  aoPedirRemocao,
  aoDuplicar,
  aoExcluir,
}: {
  dia: DiaDoQuadro;
  erros?: ErrosDoCartao;
  /** Uma ação do cartão (duplicar, excluir) está em andamento. */
  ocupado: boolean;
  aoMudar: (atualizar: (dia: DiaDoQuadro) => DiaDoQuadro) => void;
  aoAdicionarExercicio: () => void;
  aoPedirRemocao: (item: ItemDoQuadro) => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
}) {
  const idBase = useId();
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());
  const [insights, setInsights] = useState(false);

  // Linha com erro abre sozinha: o erro mora nos campos de dentro, e um erro
  // num exercício fechado seria uma borda vermelha sem explicação.
  const [errosVistos, setErrosVistos] = useState(erros);
  if (erros !== errosVistos) {
    setErrosVistos(erros);
    const comErro = Object.keys(erros?.errosPorExercicio ?? {}).map(Number);
    if (comErro.length) {
      setAbertos((atuais) => {
        const novos = new Set(atuais);
        for (const indice of comErro) {
          const item = dia.itens[indice];
          if (item) novos.add(item.chave);
        }
        return novos;
      });
    }
  }

  const resumo = resumoDoDia(
    dia.itens.map((i) => ({ sets: Number(i.sets), reps: i.reps, grupo: i.grupo })),
  );
  const alterado = foiAlterado(dia);

  function alterarItem(chave: string, campo: keyof ItemDoQuadro, valor: string) {
    aoMudar((d) => ({
      ...d,
      itens: d.itens.map((i) => (i.chave === chave ? { ...i, [campo]: valor } : i)),
    }));
  }

  function alternar(chave: string) {
    setAbertos((atuais) => {
      const novos = new Set(atuais);
      if (novos.has(chave)) novos.delete(chave);
      else novos.add(chave);
      return novos;
    });
  }

  const maiorGrupo = Math.max(1, ...resumo.porGrupo.map((g) => g.series));

  return (
    <section
      aria-labelledby={`${idBase}-nome`}
      className="w-[400px] shrink-0 rounded-[12px] border border-border bg-surface shadow-cartao"
    >
      {/* ------------------------------------------------ cabeçalho --- */}
      <header className="flex items-start justify-between gap-2 border-b border-border-soft px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <input
            id={`${idBase}-nome`}
            value={dia.nome}
            onChange={(e) => aoMudar((d) => ({ ...d, nome: e.target.value }))}
            placeholder="Nome do treino"
            aria-label={`Nome do treino ${dia.label}`}
            aria-invalid={erros?.errosPorCampo?.nome ? true : undefined}
            maxLength={80}
            className="w-full rounded-[6px] bg-transparent p-0 text-[16px] font-semibold tracking-[-0.01em] text-ink placeholder:text-ink-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          />
          <p className="mt-[3px] flex items-center gap-2 text-[12px] text-ink-4">
            {subtituloDoDia(dia.label, dia.itens.length)}
            {/* "Não salvo" diz o estado com palavra, não só com um ponto
                colorido: cor sozinha não é sinal para todo mundo. */}
            {alterado ? (
              <span className="rounded-full bg-warning-bg px-1.5 py-px text-[11px] font-semibold text-warning">
                Não salvo
              </span>
            ) : null}
          </p>
          {erros?.errosPorCampo?.nome ? (
            <p role="alert" className="mt-1 text-[12px] font-semibold text-danger">
              {erros.errosPorCampo.nome}
            </p>
          ) : null}
        </div>

        <MenuDoCartao
          nome={dia.nome || `Treino ${dia.label}`}
          podeDuplicar={Boolean(dia.id) && !alterado}
          ocupado={ocupado}
          aoDuplicar={aoDuplicar}
          aoExcluir={aoExcluir}
        />
      </header>

      {/* ----------------------------------------------- exercícios --- */}
      <div className="space-y-3 px-4 py-3">
        {dia.itens.map((item, indice) => (
          <BlocoDoExercicio
            key={item.chave}
            item={item}
            indice={indice}
            total={dia.itens.length}
            aberto={abertos.has(item.chave)}
            erros={erros?.errosPorExercicio?.[indice]}
            aoAlternar={() => alternar(item.chave)}
            aoAlterar={(campo, valor) => alterarItem(item.chave, campo, valor)}
            aoMover={(destino) => aoMudar((d) => ({ ...d, itens: mover(d.itens, indice, destino) }))}
            aoRemover={() => aoPedirRemocao(item)}
          />
        ))}

        {erros?.errosPorCampo?.exercicios ? (
          <p role="alert" className="text-[12px] font-semibold text-danger">
            {erros.errosPorCampo.exercicios}
          </p>
        ) : null}

        <button
          type="button"
          onClick={aoAdicionarExercicio}
          className="flex w-full items-center justify-center gap-[7px] rounded-[8px] border-[1.5px] border-dashed border-border py-2.5 text-[12.5px] font-semibold text-ink-3 transition hover:border-border-strong hover:bg-canvas hover:text-ink"
        >
          <Plus size={15} aria-hidden /> Adicionar exercício
        </button>

        <label className="block">
          <span className="sr-only">Observação para o aluno</span>
          <textarea
            value={dia.observacao}
            onChange={(e) => aoMudar((d) => ({ ...d, observacao: e.target.value }))}
            placeholder="Observação para o aluno (opcional). Aparece no topo do treino."
            rows={2}
            maxLength={500}
            className={cn(CAMPO, "resize-none font-normal")}
          />
        </label>

        {erros?.erro ? (
          <p role="alert" className="rounded-[8px] bg-danger-bg px-3 py-2 text-[12px] font-semibold text-danger">
            {erros.erro}
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------- volume insights --- */}
      <div className="rounded-b-[11px] border-t border-border-soft bg-canvas">
        <button
          type="button"
          onClick={() => setInsights((v) => !v)}
          aria-expanded={insights}
          className="flex w-full items-center justify-between px-4 py-[11px] text-[12px] font-medium tracking-[0.02em] text-ink-2 transition hover:text-ink"
        >
          Volume do treino
          <ChevronDown
            size={14}
            aria-hidden
            className={cn("text-ink-4 transition-transform", insights && "rotate-180")}
          />
        </button>

        {insights ? (
          <div className="space-y-3 px-4 pb-4">
            <dl className="grid grid-cols-3 gap-2">
              <Numero rotulo="Exercícios" valor={resumo.exercicios} />
              <Numero rotulo="Séries" valor={resumo.series} />
              <Numero rotulo="Reps" valor={resumo.reps} dica="Faixas contam pelo meio: 8-12 vale 10." />
            </dl>

            {/*
              No protótipo, esta barra divide o esforço por tipo de série
              (aquecimento, work, drop…). Sem tipo por série (27/09), a divisão
              que existe é por grupo muscular — que é a pergunta que o personal
              faz a um treino: "estou pondo peito demais?".
            */}
            {resumo.porGrupo.length ? (
              <div>
                <p className="mb-1.5 text-[12px] font-medium text-ink-5">
                  Séries por grupo muscular
                </p>
                <ul className="space-y-1.5">
                  {resumo.porGrupo.map((g) => (
                    <li key={g.grupo} className="flex items-center gap-2 text-[12px]">
                      <span className="w-[92px] shrink-0 truncate font-medium text-ink-2">
                        {GRUPO_MUSCULAR[g.grupo as keyof typeof GRUPO_MUSCULAR] ?? g.grupo}
                      </span>
                      <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-canvas-sunken">
                        <span
                          className="block h-full rounded-full bg-brand"
                          style={{ width: `${(g.series / maiorGrupo) * 100}%` }}
                        />
                      </span>
                      <span className="w-14 shrink-0 text-right text-ink-4 tabular-nums">
                        {g.series} {g.series === 1 ? "série" : "séries"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[12px] text-ink-4">Sem exercícios ainda.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Numero({ rotulo, valor, dica }: { rotulo: string; valor: number; dica?: string }) {
  return (
    <div title={dica} className="rounded-[10px] border border-border bg-surface p-[9px] text-center">
      <dd className="text-[17px] leading-none font-semibold text-ink tabular-nums">{valor}</dd>
      <dt className="mt-[3px] text-[9.5px] font-semibold tracking-[0.04em] text-ink-5 uppercase">
        {rotulo}
      </dt>
    </div>
  );
}

// ------------------------------------------------------------ exercício ---

type CampoEditavel = "sets" | "reps" | "rir" | "rest" | "technique" | "notes";

function BlocoDoExercicio({
  item,
  indice,
  total,
  aberto,
  erros,
  aoAlternar,
  aoAlterar,
  aoMover,
  aoRemover,
}: {
  item: ItemDoQuadro;
  indice: number;
  total: number;
  aberto: boolean;
  erros?: ErroDeExercicio;
  aoAlternar: () => void;
  aoAlterar: (campo: CampoEditavel, valor: string) => void;
  aoMover: (destino: number) => void;
  aoRemover: () => void;
}) {
  const idBase = useId();
  const temErro = Boolean(erros && Object.keys(erros).length);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border",
        temErro ? "border-danger/60" : "border-border",
      )}
    >
      <div className="flex items-center gap-[9px] bg-canvas py-2 pr-2 pl-[13px]">
        <Dumbbell size={16} aria-hidden className="shrink-0 text-ink-3" />
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink" title={item.nome}>
          {item.nome}
        </p>
        {/* Reordenar por setas, não por arraste (17/09): o gesto é meio, o
            que o personal quer é a ordem — e seta funciona no teclado. */}
        <button
          type="button"
          onClick={() => aoMover(indice - 1)}
          disabled={indice === 0}
          aria-label={`Subir ${item.nome}`}
          title="Subir"
          className={BOTAO_DE_ICONE}
        >
          <ChevronUp size={15} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => aoMover(indice + 1)}
          disabled={indice === total - 1}
          aria-label={`Descer ${item.nome}`}
          title="Descer"
          className={BOTAO_DE_ICONE}
        >
          <ChevronDown size={15} aria-hidden />
        </button>
        <button
          type="button"
          onClick={aoRemover}
          aria-label={`Remover ${item.nome}`}
          title="Remover"
          className={cn(BOTAO_DE_ICONE, "hover:text-danger")}
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        aria-controls={`${idBase}-campos`}
        aria-label={`${item.nome}: ${item.sets || "?"} séries de ${item.reps || "?"} repetições${
          item.rir ? `, RIR ${item.rir}` : ""
        }. ${aberto ? "Fechar" : "Editar"} a prescrição.`}
        className="grid w-full grid-cols-3 transition hover:bg-canvas"
      >
        <Resumo valor={item.sets || "—"} rotulo="Séries" />
        <Resumo valor={item.reps || "—"} rotulo="Reps" divisoria />
        <Resumo
          valor={item.rir || "—"}
          rotulo={
            <abbr
              title="Repetições em reserva: quantas o aluno ainda faria ao fim da série"
              className="no-underline"
            >
              RIR
            </abbr>
          }
          divisoria
        />
      </button>

      {aberto ? (
        <div id={`${idBase}-campos`} className="space-y-2.5 border-t border-border-soft p-[13px]">
          <div className="grid grid-cols-4 gap-2">
            <CampoPequeno
              rotulo="Séries"
              valor={item.sets}
              erro={erros?.sets}
              aoMudar={(v) => aoAlterar("sets", v)}
              inputMode="numeric"
              type="number"
              min={LIMITES.seriesMin}
              max={LIMITES.seriesMax}
            />
            <CampoPequeno
              rotulo="Reps"
              valor={item.reps}
              erro={erros?.reps}
              aoMudar={(v) => aoAlterar("reps", v)}
              placeholder="8-12"
            />
            <CampoPequeno
              rotulo="RIR"
              valor={item.rir}
              erro={erros?.rir}
              aoMudar={(v) => aoAlterar("rir", v)}
              placeholder="0-2"
            />
            <CampoPequeno
              rotulo="Desc. (s)"
              valor={item.rest}
              erro={erros?.descanso}
              aoMudar={(v) => aoAlterar("rest", v)}
              inputMode="numeric"
              type="number"
              min={LIMITES.descansoMin}
              max={LIMITES.descansoMax}
              step={5}
            />
          </div>

          {/* Os erros por extenso embaixo da grade: a coluna de 80px não
              cabe a frase, e o campo vermelho sozinho não diz o que fazer. */}
          {temErro ? (
            <ul role="alert" className="space-y-0.5 text-[12px] font-semibold text-danger">
              {Object.values(erros ?? {}).map((mensagem) => (
                <li key={mensagem}>{mensagem}</li>
              ))}
            </ul>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <CampoPequeno
              rotulo="Técnica"
              valor={item.technique}
              aoMudar={(v) => aoAlterar("technique", v)}
              placeholder="Drop-set, bi-set…"
              maxLength={60}
            />
            <CampoPequeno
              rotulo="Observação"
              valor={item.notes}
              aoMudar={(v) => aoAlterar("notes", v)}
              placeholder="Cadência lenta"
              maxLength={280}
            />
          </div>

          {item.seriesRegistradas > 0 ? (
            <p className="text-[11.5px] text-ink-4">
              {item.seriesRegistradas}{" "}
              {item.seriesRegistradas === 1 ? "série registrada" : "séries registradas"} pelo
              aluno neste exercício.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Resumo({
  valor,
  rotulo,
  divisoria = false,
}: {
  valor: string;
  rotulo: React.ReactNode;
  divisoria?: boolean;
}) {
  return (
    <span className={cn("block px-1 py-[9px] text-center", divisoria && "border-l border-border-soft")}>
      <span className="block text-[15px] leading-tight font-semibold text-ink">{valor}</span>
      <span className="block text-[9.5px] font-semibold tracking-[0.05em] text-ink-5 uppercase">
        {rotulo}
      </span>
    </span>
  );
}

function CampoPequeno({
  rotulo,
  valor,
  erro,
  aoMudar,
  ...props
}: {
  rotulo: string;
  valor: string;
  erro?: string;
  aoMudar: (valor: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[11px] font-medium text-ink-5">
        {rotulo}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        className={cn(CAMPO, "px-2.5 py-[7px] text-[12.5px]", erro && CAMPO_COM_ERRO)}
        {...props}
      />
    </div>
  );
}

// ------------------------------------------------------------------ menu ---

function MenuDoCartao({
  nome,
  podeDuplicar,
  ocupado,
  aoDuplicar,
  aoExcluir,
}: {
  nome: string;
  podeDuplicar: boolean;
  ocupado: boolean;
  aoDuplicar: () => void;
  aoExcluir: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Fecha com clique fora e com Esc — um menu que só fecha escolhendo algo
  // prende o personal numa escolha que ele não quer fazer.
  useEffect(() => {
    if (!aberto) return;
    function fora(evento: MouseEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }
    function esc(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label={`Ações de ${nome}`}
        disabled={ocupado}
        className={BOTAO_DE_ICONE}
      >
        <MoreHorizontal size={17} aria-hidden />
      </button>

      {aberto ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-[190px] overflow-hidden rounded-[8px] border border-border bg-surface shadow-flutuante"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!podeDuplicar}
            // Duplicar copia o que está no banco. Com alteração por salvar, a
            // cópia sairia diferente do cartão que o personal está vendo.
            title={podeDuplicar ? undefined : "Salve o treino antes de duplicar"}
            onClick={() => {
              setAberto(false);
              aoDuplicar();
            }}
            className="flex w-full items-center gap-[9px] px-[13px] py-2.5 text-left text-[12.5px] font-semibold text-ink-2 transition hover:bg-canvas disabled:text-ink-5 disabled:hover:bg-transparent"
          >
            <Copy size={14} aria-hidden /> Duplicar treino
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false);
              aoExcluir();
            }}
            className="flex w-full items-center gap-[9px] px-[13px] py-2.5 text-left text-[12.5px] font-semibold text-danger transition hover:bg-danger-bg"
          >
            <Trash2 size={14} aria-hidden /> Excluir treino
          </button>
        </div>
      ) : null}
    </div>
  );
}
