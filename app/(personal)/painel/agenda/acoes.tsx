"use client";

import { CalendarPlus, Check, Trash2, UserX, X } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Dialog, Input, Select, Textarea } from "@/components/ui";
import {
  DURACAO_PADRAO,
  conflitos,
  horaDaSessaoNaAgenda,
  minutoDoDia,
  rotuloDoDiaDaAgenda,
  type Semana,
} from "@/lib/domain/agenda";
import type { AlunoDaLista } from "@/lib/queries/alunos";
import type { SessaoAgendada } from "@/lib/queries/agenda";

import {
  agendarSessao,
  descartarSessao,
  marcarSessao,
  type EstadoDoAgendamento,
  type EstadoDaMarcacao,
  type EstadoDoDescarte,
} from "./actions";

const AGENDAMENTO: EstadoDoAgendamento = {};
const MARCACAO: EstadoDaMarcacao = {};
const DESCARTE: EstadoDoDescarte = {};

/**
 * "Nova sessão": aluno, dia, hora, duração e uma observação.
 *
 * **O aviso de conflito é aviso, não trava.** Duas sessões no mesmo horário
 * podem ser erro de digitação ou dois alunos treinando juntos, e só o personal
 * sabe qual — o banco não tem constraint para isso de propósito (migration
 * 0027). A tela mostra com quem bate e deixa ele decidir.
 */
export function NovaSessao({
  alunos,
  semana,
  sessoes,
  hoje,
}: {
  alunos: AlunoDaLista[];
  semana: Semana;
  sessoes: SessaoAgendada[];
  hoje: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(agendarSessao, AGENDAMENTO);

  // O dia e a hora ficam no estado porque o aviso de conflito depende deles
  // enquanto o personal digita — esperar o envio para avisar seria avisar tarde.
  const [dia, setDia] = useState(diaInicial(semana, hoje));
  const [hora, setHora] = useState("18:00");
  const [duracao, setDuracao] = useState(String(DURACAO_PADRAO));

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto usa desde o onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) setAberto(false);
  }

  const batem = calcularConflitos(dia, hora, duracao, sessoes);

  if (alunos.length === 0) return null;

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <CalendarPlus size={16} aria-hidden /> Nova sessão
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Marcar sessão presencial"
        descricao="O aluno vê a próxima sessão na tela inicial do app dele."
      >
        <form action={acao} noValidate className="space-y-4">
          <Select
            name="alunoId"
            label="Aluno"
            defaultValue={estado.campos?.alunoId ?? ""}
            error={estado.errosPorCampo?.alunoId}
          >
            <option value="" disabled>
              Escolha um aluno
            </option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              name="dia"
              label="Dia"
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              error={estado.errosPorCampo?.dia}
            />
            <Input
              name="hora"
              label="Hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              error={estado.errosPorCampo?.hora}
            />
          </div>

          <Input
            name="duracao"
            label="Duração (minutos)"
            type="number"
            inputMode="numeric"
            min={10}
            max={480}
            step={5}
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            error={estado.errosPorCampo?.duracao}
            hint="O padrão é uma hora."
          />

          {batem.length > 0 && (
            <p className="rounded-[9px] bg-warning-bg px-3 py-2.5 text-[12.5px] leading-[1.5] text-warning">
              Você já tem{" "}
              <strong>
                {batem.map((s) => s.alunoNome).join(", ")}
              </strong>{" "}
              nesse horário. Dá para marcar assim mesmo — só confira se é
              atendimento em dupla ou engano.
            </p>
          )}

          <Textarea
            name="observacao"
            label="Observação"
            rows={2}
            defaultValue={estado.campos?.observacao ?? ""}
            error={estado.errosPorCampo?.observacao}
            hint="Opcional. Aparece na agenda, ao lado do nome."
          />

          {estado.erro && (
            <p role="alert" className="text-[13px] text-danger">
              {estado.erro}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Marcando…" : "Marcar sessão"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

/**
 * O que aconteceu com a sessão.
 *
 * Três botões diretos e sem confirmação: marcar presença é a ação mais repetida
 * da tela, e um diálogo a cada uma transformaria a revisão da semana em vinte
 * cliques. O que **tem** confirmação é apagar, que é o único caminho sem volta.
 */
export function MarcarSessao({ sessao }: { sessao: SessaoAgendada }) {
  const [estado, acao, enviando] = useActionState(marcarSessao, MARCACAO);

  return (
    <div className="flex items-center gap-1.5">
      {estado.erro && (
        <span role="alert" className="text-[11.5px] text-danger">
          {estado.erro}
        </span>
      )}

      {sessao.situacao === "agendada" ? (
        <>
          <form action={acao}>
            <input type="hidden" name="id" value={sessao.id} />
            <input type="hidden" name="situacao" value="realizada" />
            <BotaoDeMarcar rotulo="Veio" disabled={enviando}>
              <Check size={14} aria-hidden />
            </BotaoDeMarcar>
          </form>
          <form action={acao}>
            <input type="hidden" name="id" value={sessao.id} />
            <input type="hidden" name="situacao" value="faltou" />
            <BotaoDeMarcar rotulo="Faltou" disabled={enviando}>
              <UserX size={14} aria-hidden />
            </BotaoDeMarcar>
          </form>
          <form action={acao}>
            <input type="hidden" name="id" value={sessao.id} />
            <input type="hidden" name="situacao" value="cancelada" />
            <BotaoDeMarcar rotulo="Cancelar" disabled={enviando}>
              <X size={14} aria-hidden />
            </BotaoDeMarcar>
          </form>
          <DescartarSessao sessao={sessao} />
        </>
      ) : (
        // Marcou errado, desmarca. Volta para "agendada" em vez de virar outra
        // coisa: é o estado de onde os três caminhos saem.
        <form action={acao}>
          <input type="hidden" name="id" value={sessao.id} />
          <input type="hidden" name="situacao" value="agendada" />
          <button
            type="submit"
            disabled={enviando}
            className="min-h-11 text-[12px] font-semibold text-ink-4 transition hover:text-ink"
          >
            Desfazer
          </button>
        </form>
      )}
    </div>
  );
}

function BotaoDeMarcar({
  rotulo,
  disabled,
  children,
}: {
  rotulo: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      title={rotulo}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-border px-2.5 text-[12px] font-semibold text-ink-3 transition hover:border-ink hover:text-ink disabled:opacity-50"
    >
      {children}
      {rotulo}
    </button>
  );
}

/** Apagar a sessão marcada por engano. Só funciona enquanto ela é “agendada”. */
function DescartarSessao({ sessao }: { sessao: SessaoAgendada }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(descartarSessao, DESCARTE);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={`Apagar a sessão de ${sessao.alunoNome}`}
        className="grid size-11 place-items-center text-ink-5 transition hover:text-danger"
      >
        <Trash2 size={14} aria-hidden />
      </button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Apagar a sessão?"
        descricao={`${sessao.alunoNome}, ${rotuloDoDiaDaAgenda(sessao.dia)} às ${horaDaSessaoNaAgenda(sessao.inicio)}. Some da agenda e do app do aluno, sem deixar registro. Para desmarcar mantendo o rastro, use “Cancelar”.`}
      >
        <form action={acao} noValidate className="space-y-4">
          <input type="hidden" name="id" value={sessao.id} />

          {estado.erro && (
            <p role="alert" className="text-[13px] text-danger">
              {estado.erro}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAberto(false)}
              disabled={enviando}
            >
              Manter
            </Button>
            <Button type="submit" variant="danger" disabled={enviando}>
              {enviando ? "Apagando…" : "Apagar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

/** Hoje, se a semana mostrada contém hoje; a segunda dela, se não contém. */
function diaInicial(semana: Semana, hoje: string): string {
  return hoje >= semana.de && hoje <= semana.ate ? hoje : semana.de;
}

function calcularConflitos(
  dia: string,
  hora: string,
  duracao: string,
  sessoes: SessaoAgendada[],
): SessaoAgendada[] {
  const minutos = Number(duracao);
  const inicio = minutoDoDia(hora);
  if (!dia || inicio === null || !Number.isFinite(minutos) || minutos <= 0) return [];

  const batem = conflitos({ dia, minutoDoDia: inicio, duracaoMin: minutos }, sessoes);
  return batem as SessaoAgendada[];
}
