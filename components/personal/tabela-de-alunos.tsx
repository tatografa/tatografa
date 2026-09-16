"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Card } from "@/components/ui";
import { comoPorcentagem } from "@/lib/domain/atencao";
import {
  FILTROS_DE_STATUS,
  filtrarAlunos,
  type FiltroDeStatus,
} from "@/lib/domain/carteira";
import { iniciaisDe } from "@/lib/domain/nome";
import type { AlunoNaTabela } from "@/lib/queries/painel";
import { OBJETIVO, STATUS_DO_ALUNO } from "@/lib/rotulos";

/**
 * A carteira como tabela, com busca e filtro por status (doc 06 §3).
 *
 * Tabela e não cartões porque é a tela que o doc descreve como densa de
 * propósito: o personal está sentado, no desktop, e quer comparar alunos na
 * vertical — quem está com aderência baixa, quem está sem macrotreino. Cartão
 * empilhado esconde a comparação, que é justamente o que traz ele aqui.
 *
 * `<table>` de verdade, não `<div>` com grade: o cabeçalho de coluna é o que
 * dá nome a cada célula para quem usa leitor de tela, e uma grade de divs faria
 * "72%" ser lido sem dizer 72% de quê.
 *
 * Sem banco, como as outras telas: assim ela se abre no navegador com props
 * fixas, que é o único jeito de conferir a interface neste ambiente.
 */
export function TabelaDeAlunos({
  alunos,
  idDoPersonal,
}: {
  alunos: AlunoNaTabela[];
  /**
   * Para marcar a própria linha. O personal que treina é aluno de si mesmo
   * (migration 0019), então ele aparece na própria carteira — e sem o selo a
   * lista fica com um nome repetido do cabeçalho, sem explicação.
   */
  idDoPersonal: string;
}) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroDeStatus>("todos");

  const lista = useMemo(
    () => filtrarAlunos(alunos, { busca, status }),
    [alunos, busca, status],
  );

  const filtrando = Boolean(busca.trim()) || status !== "todos";

  // Carteira vazia não ganha busca nem filtro: um campo de busca em cima de
  // "nenhum aluno ainda" oferece reduzir uma lista que não existe, e no
  // primeiro acesso do personal é a primeira coisa que ele vê.
  if (!alunos.length) return <Vazio filtrando={false} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          aria-label="Buscar aluno por nome ou e-mail"
          className="h-11 min-w-[240px] flex-1 rounded-input border-[1.5px] border-border bg-surface px-3.5 text-[14px] font-medium text-ink transition placeholder:font-normal placeholder:text-ink-5 focus:border-brand focus:ring-[3px] focus:ring-brand/15 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as FiltroDeStatus)}
          aria-label="Filtrar por status"
          className="h-11 rounded-input border-[1.5px] border-border bg-surface px-3 text-[14px] font-medium text-ink focus:border-brand focus:outline-none"
        >
          {FILTROS_DE_STATUS.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>

      {lista.length === 0 ? (
        <Vazio filtrando={filtrando} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <Coluna>Aluno</Coluna>
                  <Coluna>Objetivo</Coluna>
                  <Coluna>Macrotreino</Coluna>
                  <Coluna>Última sessão</Coluna>
                  <Coluna alinhada>Aderência</Coluna>
                  <Coluna>Status</Coluna>
                </tr>
              </thead>
              <tbody>
                {lista.map((aluno) => (
                  <Linha
                    key={aluno.id}
                    aluno={aluno}
                    ehVoce={aluno.id === idDoPersonal}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[12.5px] text-ink-4">
            {filtrando
              ? `${lista.length} de ${alunos.length} ${alunos.length === 1 ? "aluno" : "alunos"}`
              : `${alunos.length} ${alunos.length === 1 ? "aluno" : "alunos"}`}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * A linha inteira é clicável, e quem carrega o link é o **nome**, não a linha.
 *
 * `<tr onClick>` daria o clique e nada mais: sem foco pelo teclado, sem menu de
 * contexto, sem abrir em outra aba. O link no nome com `after:absolute` estica
 * a área de clique por cima da linha toda — o alvo grande do mouse e o alvo
 * certo do teclado, sem duplicar o destino em seis células.
 */
function Linha({ aluno, ehVoce }: { aluno: AlunoNaTabela; ehVoce: boolean }) {
  return (
    <tr className="group relative border-b border-border last:border-0 transition hover:bg-canvas-sunken">
      <Celula>
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white"
          >
            {iniciaisDe(aluno.name)}
          </span>
          <span className="min-w-0">
            <Link
              href={`/painel/alunos/${aluno.id}`}
              className="truncate text-[14px] font-semibold text-ink after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
            >
              {aluno.name}
            </Link>
            <span className="block truncate text-[12.5px] text-ink-4">
              {aluno.email}
            </span>
          </span>
        </span>
      </Celula>

      <Celula>{aluno.goal ? OBJETIVO[aluno.goal] : "—"}</Celula>

      <Celula>
        {aluno.programa ? (
          <span className="block max-w-[200px] truncate">
            {aluno.programa.name}
          </span>
        ) : (
          <span className="text-ink-5">Sem macrotreino</span>
        )}
      </Celula>

      <Celula>
        {aluno.dias_sem_treinar === null ? (
          <span className="text-ink-5">Nunca treinou</span>
        ) : (
          desde(aluno.dias_sem_treinar)
        )}
      </Celula>

      {/*
        "—" e não "0%" quando não há programa com treino: zero por cento diz que
        o aluno faltou; o traço diz que não há o que medir. Mesma regra do
        indicador do painel, e a conta vem da mesma função.
      */}
      <Celula alinhada>
        <span className="tabular-nums">{comoPorcentagem(aluno.aderencia)}</span>
      </Celula>

      <Celula>
        <span className="flex items-center gap-1.5">
          {ehVoce ? <Badge tone="brand">Você</Badge> : null}
          <Badge tone={aluno.status === "ativo" ? "sucesso" : "neutro"}>
            {STATUS_DO_ALUNO[aluno.status]}
          </Badge>
        </span>
      </Celula>
    </tr>
  );
}

function Coluna({
  children,
  alinhada = false,
}: {
  children: React.ReactNode;
  alinhada?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`eyebrow px-4 py-3 text-[9px] text-ink-4 ${alinhada ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

function Celula({
  children,
  alinhada = false,
}: {
  children: React.ReactNode;
  alinhada?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-[13.5px] text-ink-2 ${alinhada ? "text-right" : ""}`}
    >
      {children}
    </td>
  );
}

/**
 * Dois vazios diferentes de propósito: "ninguém entrou ainda" é o primeiro
 * acesso do personal e pede o caminho para convidar; "nada com esse filtro" é
 * uma busca sem resultado e pede só que ele apague o que digitou. Um texto só
 * para os dois mandaria convidar aluno quem já tem trinta.
 */
function Vazio({ filtrando }: { filtrando: boolean }) {
  return (
    <Card size="lg" className="max-w-xl space-y-2">
      <h2 className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">
        {filtrando ? "Nenhum aluno com esse filtro" : "Nenhum aluno ainda"}
      </h2>
      <p className="text-[14px] leading-[1.6] text-ink-3">
        {filtrando
          ? "Tente outro nome, ou volte o status para “Todos”."
          : "Use “Convidar aluno” aqui em cima: você gera um link e manda pelo WhatsApp."}
      </p>
    </Card>
  );
}

/**
 * "Hoje" / "Há 3 dias" — a coluna de última sessão.
 *
 * Recebe o número já contado pelo servidor, e não a data: a conta de dia de
 * calendário é do fuso do produto, e aqui é o navegador. Só a conjugação é
 * desta camada.
 */
function desde(dias: number): string {
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}
