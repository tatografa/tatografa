"use client";

import { Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Card, Textarea } from "@/components/ui";
import {
  AVISO_DA_OBSERVACAO,
  LIMITE_DAS_OBSERVACOES,
  LIMITE_DA_OBSERVACAO,
} from "@/lib/domain/observacao";
import { plural, preencher } from "@/lib/i18n/texto";
import type { Observacao } from "@/lib/queries/observacoes";

import {
  apagarObservacao,
  criarObservacao,
  editarObservacao,
  type EstadoDaExclusao,
  type EstadoDaObservacao,
} from "@/app/(personal)/painel/alunos/[id]/actions";

const VAZIO: EstadoDaObservacao = {};
const EXCLUSAO: EstadoDaExclusao = {};

/**
 * "Observações do personal sobre o aluno (privadas)" — doc 06 §4.
 *
 * **O cadeado no cabeçalho não é enfeite.** Um campo de texto numa ficha não
 * diz a quem pertence, e o personal precisa saber que pode escrever "não
 * confio na execução dele no agachamento" sem que o aluno leia. Quem garante
 * isso é o RLS (o aluno não tem policy de select em `trainer_notes`), mas quem
 * faz o personal *confiar* nisso é a linha que a tela mostra. Sem ela, o campo
 * vira um lugar onde ele escreve elogio.
 *
 * Lista de anotações datadas, e não um bloco único de texto: o personal anota
 * eventos ("faltou por viagem", "dor no ombro desde agosto"), e num bloco único
 * ele teria que manter a cronologia na mão, editando uma parede de texto numa
 * caixinha.
 */
export function ObservacoesDoAluno({
  alunoId,
  observacoes,
  nome,
}: {
  alunoId: string;
  observacoes: Observacao[];
  /** Só o primeiro nome, para o texto do estado vazio. */
  nome: string;
}) {
  const [escrevendo, setEscrevendo] = useState(false);
  const o = usePainel().t.ficha.observacoes;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="eyebrow flex items-center gap-1.5 text-ink-4">
          <Lock aria-hidden size={12} />
          {o.titulo}
        </h2>
        {!escrevendo && (
          <button
            type="button"
            onClick={() => setEscrevendo(true)}
            className="inline-flex min-h-8 items-center gap-1 text-[13px] font-semibold text-ink-3 transition hover:text-ink"
          >
            <Plus aria-hidden size={14} /> {o.anotar}
          </button>
        )}
      </div>

      {escrevendo && (
        <Formulario
          alunoId={alunoId}
          aoFechar={() => setEscrevendo(false)}
          rotulo={o.salvarAnotacao}
        />
      )}

      {observacoes.length === 0 ? (
        !escrevendo && (
          <Card className="text-[14px] leading-[1.6] text-ink-3">
            {preencher(o.vazio, { nome })}{" "}
            <strong className="font-semibold text-ink-2">{o.alunoNaoVe}</strong>
          </Card>
        )
      ) : (
        <ul className="space-y-2">
          {observacoes.map((observacao) => (
            <Linha
              key={observacao.id}
              alunoId={alunoId}
              observacao={observacao}
            />
          ))}
        </ul>
      )}

      {observacoes.length >= LIMITE_DAS_OBSERVACOES && (
        <p className="text-[12.5px] text-ink-4">
          {preencher(o.limite, { n: LIMITE_DAS_OBSERVACOES })}
        </p>
      )}
    </section>
  );
}

/** Uma anotação: leitura, ou o mesmo formulário por cima quando em edição. */
function Linha({
  alunoId,
  observacao,
}: {
  alunoId: string;
  observacao: Observacao;
}) {
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [estado, acao, apagando] = useActionState(apagarObservacao, EXCLUSAO);
  const { t } = usePainel();
  const o = t.ficha.observacoes;

  if (editando) {
    return (
      <li>
        <Formulario
          alunoId={alunoId}
          observacao={observacao}
          aoFechar={() => setEditando(false)}
          rotulo={t.comum.salvar}
        />
      </li>
    );
  }

  return (
    <li className="rounded-card border border-border bg-surface px-4 py-3.5">
      <p className="text-[14px] leading-[1.6] whitespace-pre-wrap text-ink-2">
        {observacao.texto}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-ink-5">
          {observacao.rotuloDoDia}
          {observacao.editadaEm ? o.editada : ""}
        </p>

        {confirmando ? (
          <form action={acao} className="flex items-center gap-2">
            <input type="hidden" name="id" value={observacao.id} />
            <input type="hidden" name="alunoId" value={alunoId} />
            <span className="text-[12.5px] text-ink-3">{o.apagar}</span>
            <button
              type="submit"
              disabled={apagando}
              className="text-[12.5px] font-semibold text-ink transition hover:underline disabled:opacity-60"
            >
              {apagando ? t.comum.apagando : o.simApagar}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
            >
              {o.nao}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="inline-flex min-h-8 items-center gap-1 text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
            >
              <Pencil aria-hidden size={13} /> {t.comum.editar}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="inline-flex min-h-8 items-center gap-1 text-[12.5px] font-semibold text-ink-4 transition hover:text-danger"
            >
              <Trash2 aria-hidden size={13} /> {t.comum.apagar}
            </button>
          </div>
        )}
      </div>

      {estado.erro && (
        <p className="mt-2 text-[12.5px] font-semibold text-danger">
          {estado.erro}
        </p>
      )}
    </li>
  );
}

/**
 * O mesmo formulário para criar e para editar — a diferença é a ação e se há
 * texto de partida. Dois formulários quase iguais divergiriam no contador, no
 * limite ou na mensagem de erro, e o personal veria regras diferentes para a
 * mesma caixa de texto.
 */
function Formulario({
  alunoId,
  observacao,
  aoFechar,
  rotulo,
}: {
  alunoId: string;
  observacao?: Observacao;
  aoFechar: () => void;
  rotulo: string;
}) {
  const [estado, acao, enviando] = useActionState(
    observacao ? editarObservacao : criarObservacao,
    VAZIO,
  );
  const [texto, setTexto] = useState(observacao?.texto ?? "");
  const { t } = usePainel();
  const o = t.ficha.observacoes;

  /*
   * Fecha sozinho quando deu certo, **ajustando o estado no render** e
   * comparando a identidade do objeto — não o valor de `ok`.
   *
   * Comparar o booleano parece equivalente e não é: `useActionState` devolve um
   * objeto novo a cada ação, mas `ok` continua `true` entre dois sucessos
   * seguidos, e aí a transição some e o formulário fica aberto na segunda vez.
   * Foi exatamente esse o defeito de `NovaReavaliacao`, encontrado em campo.
   */
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.ok) aoFechar();
  }

  const restam = LIMITE_DA_OBSERVACAO - texto.length;

  return (
    <Card className="space-y-3">
      <form action={acao} noValidate className="space-y-3">
        {observacao ? (
          <input type="hidden" name="id" value={observacao.id} />
        ) : null}
        <input type="hidden" name="alunoId" value={alunoId} />

        <Textarea
          name="texto"
          label={o.anotacao}
          rows={4}
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={LIMITE_DA_OBSERVACAO}
          error={estado.errosPorCampo?.texto ?? estado.erro}
          hint={o.dica}
        />

        {/*
          O contador aparece só perto do teto. Visível o tempo todo, ele
          transforma um campo de texto livre num campo com cota — e o personal
          começa a escrever curto por causa de um número que não tinha por que
          estar na frente dele.
        */}
        {texto.length >= AVISO_DA_OBSERVACAO && (
          <p className="text-right text-[12px] text-ink-4 tabular-nums">
            {plural(restam, o.caracteres)}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={aoFechar}
            disabled={enviando}
          >
            <X aria-hidden size={15} /> {t.comum.cancelar}
          </Button>
          <Button type="submit" disabled={enviando || !texto.trim()}>
            {enviando ? t.comum.salvando : rotulo}
          </Button>
        </div>
      </form>
    </Card>
  );
}
