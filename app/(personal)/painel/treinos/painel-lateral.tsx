"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  BarChart3,
  ChevronDown,
  Copy,
  Eye,
  LineChart,
  Plus,
  Zap,
} from "lucide-react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Badge, Button, Dialog, Input, Select } from "@/components/ui";
import { MAXIMO_DE_DIAS } from "@/lib/domain/divisao";
import { iniciaisDe, primeiroNome } from "@/lib/domain/nome";
import { plural, preencher } from "@/lib/i18n/texto";
import type { AlunoDaDivisao, ProgramaDaDivisao } from "@/lib/queries/divisao";
import { cn } from "@/lib/utils";

import {
  arquivarPrograma,
  ativarPrograma,
  criarPrograma,
  duplicarPrograma,
  salvarObjetivo,
  salvarPrograma,
  type EstadoDaCopia,
  type EstadoDoPrograma,
} from "./acoes-de-programa";
import { CAMPO, ROTULO } from "./estilos";

/** O que o painel precisa saber dos cartões, sem receber os cartões. */
export type DiaDoPainel = { chave: string; label: string; nome: string };

/**
 * A coluna de configuração da divisão de treino (380px no protótipo): aluno,
 * macrociclo, objetivo, frequência, nomes dos dias e o volume da semana.
 *
 * **Tudo que muda de endereço passa por `aoNavegar`/`seguro`**: trocar de aluno
 * ou ativar um programa desmonta os cartões, e o personal perderia sem aviso o
 * que digitou neles.
 */
export function PainelLateral({
  alunos,
  aluno,
  programas,
  programa,
  dias,
  volume,
  hoje,
  abrirNovo,
  aoNavegar,
  seguro,
  aoRenomearDia,
  aoFrequencia,
  aoAdicionarDia,
}: {
  alunos: AlunoDaDivisao[];
  aluno: AlunoDaDivisao;
  programas: ProgramaDaDivisao[];
  programa: ProgramaDaDivisao | null;
  dias: DiaDoPainel[];
  volume: { series: number; reps: number };
  hoje: string;
  abrirNovo: boolean;
  aoNavegar: (href: string) => void;
  /** Roda `continuar` na hora, ou depois de o personal aceitar descartar. */
  seguro: (continuar: () => void) => void;
  aoRenomearDia: (chave: string, nome: string) => void;
  aoFrequencia: (n: number) => void;
  aoAdicionarDia: () => void;
}) {
  const noLimite = dias.length >= MAXIMO_DE_DIAS;
  const { t } = usePainel();
  const l = t.treinos.lateral;

  return (
    <aside
      aria-label={l.configuracao}
      className="flex w-[340px] shrink-0 flex-col overflow-hidden rounded-[12px] border border-border bg-surface xl:w-[380px]"
    >
      <div className="flex-1 space-y-[18px] overflow-y-auto px-[18px] pt-[18px] pb-2">
        {/* ------------------------------------------------ aluno --- */}
        <div>
          <label htmlFor="divisao-aluno" className={ROTULO}>
            {l.aluno}
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 flex size-[26px] -translate-y-1/2 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand"
            >
              {iniciaisDe(aluno.name)}
            </span>
            {/* `<select>` nativo com a roupa do protótipo: a lista suspensa
                desenhada à mão teria de reimplementar teclado, busca por letra
                e leitor de tela — e a nativa já faz os três. */}
            <select
              id="divisao-aluno"
              value={aluno.id}
              onChange={(e) =>
                aoNavegar(`/painel/treinos?aluno=${e.target.value}`)
              }
              className={cn(
                CAMPO,
                "h-[48px] appearance-none pr-9 pl-12 text-[13.5px] font-semibold",
              )}
            >
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.status === "ativo" ? "" : l.inativo}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              size={14}
              className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-4"
            />
          </div>
        </div>

        <PainelDeMacrociclos
          key={programa?.id ?? "sem"}
          aluno={aluno}
          alunos={alunos}
          programas={programas}
          programa={programa}
          hoje={hoje}
          abrirNovo={abrirNovo}
          aoNavegar={aoNavegar}
          seguro={seguro}
        />

        {programa ? (
          <>
            <Objetivo key={programa.id} programa={programa} />

            {/* ------------------------------------------- frequência --- */}
            <div>
              <p id="divisao-frequencia" className={ROTULO}>
                {l.frequencia}
              </p>
              {/*
                A frequência É o número de treinos da divisão: com a rotação
                (27/09), quem treina 4x passa pelos 4 treinos na semana. Por
                isso os botões acrescentam ou tiram cartões, como no protótipo.
              */}
              <div
                role="group"
                aria-labelledby="divisao-frequencia"
                className="flex gap-1.5"
              >
                {Array.from({ length: MAXIMO_DE_DIAS }, (_, i) => i + 1).map(
                  (n) => {
                    const ativo = n === dias.length;
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={ativo}
                        aria-label={plural(n, l.porSemana)}
                        onClick={() => aoFrequencia(n)}
                        className={cn(
                          "flex-1 rounded-[9px] border-[1.5px] py-2 text-[12.5px] font-semibold transition",
                          ativo
                            ? "border-brand bg-brand text-white"
                            : "border-border text-ink-3 hover:border-border-strong hover:text-ink",
                        )}
                      >
                        {n}x
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* ----------------------------------------- nomear dias --- */}
            <div>
              <p className={ROTULO}>{l.nomearDias}</p>
              {dias.length ? (
                <ol className="space-y-2">
                  {dias.map((dia, i) => (
                    <li key={dia.chave} className="flex items-center gap-[9px]">
                      <span
                        aria-hidden
                        className="w-[26px] shrink-0 text-center text-[12px] font-semibold text-ink-5 tabular-nums"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <input
                        value={dia.nome}
                        onChange={(e) =>
                          aoRenomearDia(dia.chave, e.target.value)
                        }
                        placeholder={l.nomeExemplo}
                        aria-label={preencher(t.treinos.cartao.nomeDe, { label: dia.label })}
                        maxLength={80}
                        className={CAMPO}
                      />
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[12.5px] text-ink-4">
                  {l.nenhumAinda}
                </p>
              )}
              <button
                type="button"
                onClick={aoAdicionarDia}
                disabled={noLimite}
                className="mt-[11px] inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-brand transition hover:text-brand-hover disabled:text-ink-5"
              >
                <Plus size={15} aria-hidden />
                {noLimite
                  ? preencher(l.maximoDias, { n: MAXIMO_DE_DIAS })
                  : l.adicionarDia}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* ------------------------------------------ volume da semana --- */}
      {programa ? (
        <div className="shrink-0 border-t border-border-soft bg-canvas px-[18px] py-[15px]">
          <p className="mb-[11px] flex items-center gap-2 text-[12.5px] font-semibold text-ink">
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-[8px] bg-brand-soft text-brand"
            >
              <BarChart3 size={15} />
            </span>
            {l.volumeSemanal}
          </p>
          <dl className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[8px] border border-border bg-surface px-[13px] py-[11px]">
              <dd className="text-[28px] leading-none font-semibold tracking-[-0.01em] text-ink tabular-nums">
                {volume.series}
              </dd>
              <dt className="mt-1 text-[12px] font-medium tracking-[0.02em] text-ink-5">
                {l.totalSeries}
              </dt>
            </div>
            <div
              className="rounded-[8px] border border-border bg-surface px-[13px] py-[11px]"
              title={t.treinos.cartao.dicaReps}
            >
              <dd className="text-[28px] leading-none font-semibold tracking-[-0.01em] text-ink tabular-nums">
                {volume.reps}
              </dd>
              <dt className="mt-1 text-[12px] font-medium tracking-[0.02em] text-ink-5">
                {l.totalReps}
              </dt>
            </div>
          </dl>
        </div>
      ) : null}
    </aside>
  );
}

// -------------------------------------------------------------- objetivo ---

function Objetivo({ programa }: { programa: ProgramaDaDivisao }) {
  const [valor, setValor] = useState<string>(programa.goal ?? "");
  const [salvando, iniciar] = useTransition();
  const [falhou, setFalhou] = useState(false);
  const { t } = usePainel();

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor="divisao-objetivo" className={ROTULO}>
          {t.treinos.lateral.objetivo}
        </label>
        <span aria-live="polite" className="text-[11.5px] text-ink-5">
          {salvando ? t.comum.salvando : null}
        </span>
      </div>
      <div className="relative">
        <select
          id="divisao-objetivo"
          value={valor}
          aria-describedby={falhou ? "divisao-objetivo-erro" : undefined}
          onChange={(e) => {
            const anterior = valor;
            const novo = e.target.value;
            setValor(novo);
            setFalhou(false);
            // Salva na escolha, sem botão (ver `salvarObjetivo`). Falhou,
            // volta ao que o banco tem — seletor mostrando um valor que não
            // foi gravado é a tela mentindo.
            iniciar(async () => {
              const { ok } = await salvarObjetivo(programa.id, novo);
              if (!ok) {
                setValor(anterior);
                setFalhou(true);
              }
            });
          }}
          className={cn(
            CAMPO,
            "h-[44px] appearance-none pr-9 text-[13.5px] font-semibold",
          )}
        >
          <option value="">{t.comum.naoInformado}</option>
          {Object.entries(t.rotulos.objetivoDoPrograma).map(([chave, rotulo]) => (
            <option key={chave} value={chave}>
              {rotulo}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={14}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-4"
        />
      </div>
      {falhou ? (
        <p
          id="divisao-objetivo-erro"
          role="alert"
          className="mt-1 text-[12px] font-semibold text-danger"
        >
          {t.treinos.lateral.falhaObjetivo}
        </p>
      ) : null}
    </div>
  );
}

// ----------------------------------------------------------- macrociclos ---

type Aba = "atual" | "historico" | "novo";

/**
 * O "Painel de Macrociclos" do protótipo. As abas do protótipo eram ATIVOS,
 * INATIVOS e RASCUNHOS; aqui são **Atual, Histórico e Novo**, porque o modelo
 * não tem rascunho separado — o programa arquivado **é** o rascunho (a cópia
 * nasce arquivada, 17/09) — e "o programa que está na tela" nem sempre é o
 * ativo: o personal pode estar ajustando um arquivado antes de ativar.
 */
function PainelDeMacrociclos({
  aluno,
  alunos,
  programas,
  programa,
  hoje,
  abrirNovo,
  aoNavegar,
  seguro,
}: {
  aluno: AlunoDaDivisao;
  alunos: AlunoDaDivisao[];
  programas: ProgramaDaDivisao[];
  programa: ProgramaDaDivisao | null;
  hoje: string;
  abrirNovo: boolean;
  aoNavegar: (href: string) => void;
  seguro: (continuar: () => void) => void;
}) {
  const [aberto, setAberto] = useState(abrirNovo || !programa);
  const [aba, setAba] = useState<Aba>(
    abrirNovo || !programa ? "novo" : "atual",
  );
  const outros = programas.filter((p) => p.id !== programa?.id);
  const ativo = programas.find((p) => p.status === "ativo") ?? null;
  const { t, f } = usePainel();
  const m = t.treinos.macro;

  const abas: { chave: Aba; rotulo: string; some?: boolean }[] = [
    { chave: "atual", rotulo: m.abas.atual, some: !programa },
    {
      chave: "historico",
      rotulo: `${m.abas.historico}${outros.length ? ` · ${outros.length}` : ""}`,
      some: !outros.length,
    },
    { chave: "novo", rotulo: m.abas.novo },
  ];
  const abasVisiveis = abas.filter((a) => !a.some);

  return (
    <div className="overflow-hidden rounded-[12px] border border-border">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 bg-canvas px-3.5 py-3 text-left transition hover:bg-canvas-sunken"
      >
        <span className="flex min-w-0 items-center gap-[9px]">
          <LineChart size={15} aria-hidden className="shrink-0 text-ink-3" />
          <span className="min-w-0">
            <span className="block text-[12.5px] font-semibold text-ink">
              {m.painel}
            </span>
            {programa ? (
              <span className="block truncate text-[11.5px] text-ink-4">
                {programa.name} ·{" "}
                {programa.status === "ativo" ? m.ativoMinusculo : m.arquivadoMinusculo}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          size={14}
          aria-hidden
          className={cn(
            "shrink-0 text-ink-4 transition-transform",
            aberto && "rotate-180",
          )}
        />
      </button>

      {aberto ? (
        <div className="border-t border-border-soft px-3.5 pt-3 pb-3.5">
          {/* Uma aba só não é escolha: sem programa nenhum, o painel abre
              direto no formulário do primeiro. */}
          {abasVisiveis.length > 1 ? (
            <div
              role="tablist"
              aria-label={m.macrociclos}
              className="mb-[13px] flex gap-1 rounded-[9px] border border-border bg-canvas p-[3px]"
            >
              {abasVisiveis.map((a) => (
                <button
                  key={a.chave}
                  type="button"
                  role="tab"
                  aria-selected={aba === a.chave}
                  onClick={() => setAba(a.chave)}
                  className={cn(
                    "flex-1 rounded-[7px] px-1 py-1.5 text-[11.5px] font-semibold tracking-[0.04em] uppercase transition",
                    aba === a.chave
                      ? "bg-surface text-ink shadow-xs"
                      : "text-ink-4 hover:text-ink-2",
                  )}
                >
                  {a.rotulo}
                </button>
              ))}
            </div>
          ) : null}

          <div role={abasVisiveis.length > 1 ? "tabpanel" : undefined}>
            {aba === "atual" && programa ? (
              <ProgramaAtual
                programa={programa}
                aluno={aluno}
                alunos={alunos}
                ativoAtual={
                  ativo && ativo.id !== programa.id ? ativo.name : null
                }
                seguro={seguro}
              />
            ) : null}

            {aba === "historico" ? (
              <ul className="space-y-2">
                {outros.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-[10px] border border-border py-2 pr-1.5 pl-[11px]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink-2">
                        {p.name}
                      </span>
                      <span className="block text-[11px] text-ink-4">
                        {preencher(m.desde, {
                          status: p.status === "ativo" ? m.ativo : m.arquivado,
                          data: f.diaComAno(p.started_at),
                        })}
                      </span>
                    </span>
                    {p.status !== "ativo" ? (
                      <FormularioSeguro action={ativarPrograma} seguro={seguro}>
                        <input type="hidden" name="id" value={p.id} />
                        <BotaoDeFormulario
                          rotulo={preencher(m.ativarX, { nome: p.name })}
                          className="text-brand hover:bg-brand-soft"
                        >
                          <Zap size={14} aria-hidden />
                        </BotaoDeFormulario>
                      </FormularioSeguro>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        aoNavegar(
                          `/painel/treinos?aluno=${aluno.id}&programa=${p.id}`,
                        )
                      }
                      aria-label={preencher(m.abrirX, { nome: p.name })}
                      title={m.abrir}
                      className="inline-flex size-[26px] items-center justify-center rounded-[7px] text-ink-4 transition hover:bg-canvas-sunken hover:text-ink"
                    >
                      <Eye size={14} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {aba === "novo" ? (
              <NovoPrograma
                aluno={aluno}
                temAtivo={Boolean(ativo)}
                hoje={hoje}
                seguro={seguro}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SEM_ESTADO: EstadoDoPrograma = {};

function ProgramaAtual({
  programa,
  aluno,
  alunos,
  ativoAtual,
  seguro,
}: {
  programa: ProgramaDaDivisao;
  aluno: AlunoDaDivisao;
  alunos: AlunoDaDivisao[];
  ativoAtual: string | null;
  seguro: (continuar: () => void) => void;
}) {
  const [estado, acao, enviando] = useActionState(salvarPrograma, SEM_ESTADO);
  const [arquivar, setArquivar] = useState(false);
  const [ativar, setAtivar] = useState(false);
  const [duplicar, setDuplicar] = useState(false);
  const ativo = programa.status === "ativo";
  const { t } = usePainel();
  const m = t.treinos.macro;
  const nome = primeiroNome(aluno.name);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge tone={ativo ? "brand" : "neutro"}>
          {ativo ? m.ativo : m.arquivado}
        </Badge>
        <span className="text-[11.5px] text-ink-4">
          {ativo ? preencher(m.veEstes, { nome }) : m.naoVe}
        </span>
      </div>

      <form action={acao} noValidate className="space-y-2.5">
        <input type="hidden" name="programaId" value={programa.id} />
        <div>
          <label
            htmlFor="programa-nome"
            className="mb-1 block text-[12px] font-medium text-ink-4"
          >
            {m.nome}
          </label>
          <div className="flex gap-2">
            <input
              id="programa-nome"
              name="nome"
              defaultValue={programa.name}
              maxLength={80}
              placeholder={m.nomeExemplo}
              aria-invalid={estado.errosPorCampo?.nome ? true : undefined}
              className={CAMPO}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="programa-semanas"
              className="mb-1 block text-[12px] font-medium text-ink-4"
            >
              {m.semanas}
            </label>
            <input
              id="programa-semanas"
              name="semanas"
              type="number"
              inputMode="numeric"
              min={1}
              max={52}
              defaultValue={programa.total_weeks}
              className={CAMPO}
            />
          </div>
          <div>
            <label
              htmlFor="programa-inicio"
              className="mb-1 block text-[12px] font-medium text-ink-4"
            >
              {m.inicio}
            </label>
            <input
              id="programa-inicio"
              name="inicio"
              type="date"
              defaultValue={programa.started_at}
              className={CAMPO}
            />
          </div>
        </div>
        {Object.values(estado.errosPorCampo ?? {}).map((m) => (
          <p
            key={m}
            role="alert"
            className="text-[12px] font-semibold text-danger"
          >
            {m}
          </p>
        ))}
        {estado.erro ? (
          <p role="alert" className="text-[12px] font-semibold text-danger">
            {estado.erro}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span aria-live="polite" className="text-[11.5px] text-success">
            {estado.salvo && !enviando ? m.salvo : null}
          </span>
          <Button type="submit" size="sm" disabled={enviando}>
            {enviando ? t.comum.salvando : t.comum.salvar}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-border-soft pt-3">
        {ativo ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setArquivar(true)}
          >
            {m.arquivar}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setAtivar(true)}>
            <Zap size={14} aria-hidden /> {m.ativar}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setDuplicar(true)}>
          <Copy size={14} aria-hidden /> {m.duplicar}
        </Button>
      </div>

      <Dialog
        aberto={arquivar}
        aoFechar={() => setArquivar(false)}
        titulo={preencher(m.arquivarTitulo, { nome: programa.name })}
        descricao={preencher(m.arquivamento, { nome })}
      >
        <FormularioSeguro
          action={arquivarPrograma}
          seguro={seguro}
          className="flex gap-2.5"
        >
          <input type="hidden" name="id" value={programa.id} />
          <Button
            type="button"
            variant="secondary"
            block
            onClick={() => setArquivar(false)}
          >
            {m.manterAtivo}
          </Button>
          <BotaoDeEnvio variant="danger">{m.arquivar}</BotaoDeEnvio>
        </FormularioSeguro>
      </Dialog>

      <Dialog
        aberto={ativar}
        aoFechar={() => setAtivar(false)}
        titulo={preencher(m.ativarTitulo, { nome: programa.name })}
        // Sem outro ativo, nada sai da tela do aluno — só entra. A frase diz
        // isso em vez de repetir a da troca, que falaria de um programa que
        // não existe.
        descricao={
          ativoAtual
            ? preencher(m.ativacao, { atual: ativoAtual, nome, programa: programa.name })
            : preencher(m.passaAVer, { nome, programa: programa.name })
        }
      >
        <FormularioSeguro
          action={ativarPrograma}
          seguro={seguro}
          className="flex gap-2.5"
        >
          <input type="hidden" name="id" value={programa.id} />
          <Button
            type="button"
            variant="secondary"
            block
            onClick={() => setAtivar(false)}
          >
            {t.comum.cancelar}
          </Button>
          <BotaoDeEnvio>{m.ativar}</BotaoDeEnvio>
        </FormularioSeguro>
      </Dialog>

      <DuplicarPrograma
        aberto={duplicar}
        aoFechar={() => setDuplicar(false)}
        programa={programa}
        aluno={aluno}
        alunos={alunos}
        seguro={seguro}
      />
    </div>
  );
}

const SEM_COPIA: EstadoDaCopia = {};

function DuplicarPrograma({
  aberto,
  aoFechar,
  programa,
  aluno,
  alunos,
  seguro,
}: {
  aberto: boolean;
  aoFechar: () => void;
  programa: ProgramaDaDivisao;
  aluno: AlunoDaDivisao;
  alunos: AlunoDaDivisao[];
  seguro: (continuar: () => void) => void;
}) {
  const [estado, acao, enviando] = useActionState(duplicarPrograma, SEM_COPIA);
  // Cópia para aluno inativo seria treino que ninguém recebe.
  const destinos = alunos.filter(
    (a) => a.status === "ativo" || a.id === aluno.id,
  );
  const { t } = usePainel();
  const m = t.treinos.macro;

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={preencher(m.duplicarTitulo, { nome: programa.name })}
      // A frase muda com o tamanho da carteira: "para outro aluno" não faz
      // sentido para quem só tem um, e faria o personal procurar o que não há.
      descricao={`${destinos.length > 1 ? m.paraOutro : m.paraOMesmo} ${m.duplicacao}`}
    >
      <FormularioSeguro action={acao} seguro={seguro} className="space-y-4">
        <input type="hidden" name="programaId" value={programa.id} />
        <Select
          name="alunoId"
          label={m.paraQuem}
          defaultValue={aluno.id}
          error={estado.errosPorCampo?.aluno}
        >
          {destinos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Input
          name="nome"
          label={m.nomeNovo}
          defaultValue={preencher(m.copia, { nome: programa.name }).slice(0, 80)}
          maxLength={80}
          error={estado.errosPorCampo?.nome}
        />
        {estado.erro ? (
          <p className="text-[12.5px] font-semibold text-danger">
            {estado.erro}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={aoFechar}
            disabled={enviando}
          >
            {t.comum.cancelar}
          </Button>
          <Button type="submit" disabled={enviando}>
            {enviando ? m.copiando : m.duplicar}
          </Button>
        </div>
      </FormularioSeguro>
    </Dialog>
  );
}

function NovoPrograma({
  aluno,
  temAtivo,
  hoje,
  seguro,
}: {
  aluno: AlunoDaDivisao;
  temAtivo: boolean;
  hoje: string;
  seguro: (continuar: () => void) => void;
}) {
  const [estado, acao, enviando] = useActionState(criarPrograma, SEM_ESTADO);
  const { t } = usePainel();
  const m = t.treinos.macro;
  const nome = primeiroNome(aluno.name);

  if (aluno.status !== "ativo") {
    return (
      <p className="text-[12.5px] leading-relaxed text-ink-3">
        {preencher(m.pausado, { nome })}
      </p>
    );
  }

  return (
    <FormularioSeguro
      action={acao}
      seguro={seguro}
      noValidate
      className="space-y-2.5"
    >
      <input type="hidden" name="alunoId" value={aluno.id} />
      <div>
        <label
          htmlFor="novo-nome"
          className="mb-1 block text-[12px] font-medium text-ink-4"
        >
          {m.nome}
        </label>
        <input
          id="novo-nome"
          name="nome"
          maxLength={80}
          placeholder={m.nomeExemplo}
          aria-invalid={estado.errosPorCampo?.nome ? true : undefined}
          className={CAMPO}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor="novo-semanas"
            className="mb-1 block text-[12px] font-medium text-ink-4"
          >
            {m.semanas}
          </label>
          <input
            id="novo-semanas"
            name="semanas"
            type="number"
            inputMode="numeric"
            min={1}
            max={52}
            defaultValue={8}
            className={CAMPO}
          />
        </div>
        <div>
          <label
            htmlFor="novo-inicio"
            className="mb-1 block text-[12px] font-medium text-ink-4"
          >
            {m.inicio}
          </label>
          <input
            id="novo-inicio"
            name="inicio"
            type="date"
            defaultValue={hoje}
            className={CAMPO}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="novo-objetivo"
          className="mb-1 block text-[12px] font-medium text-ink-4"
        >
          {m.objetivo}
        </label>
        <div className="relative">
          <select
            id="novo-objetivo"
            name="objetivo"
            defaultValue=""
            className={cn(CAMPO, "appearance-none pr-9")}
          >
            <option value="">{t.comum.naoInformado}</option>
            {Object.entries(t.rotulos.objetivoDoPrograma).map(([chave, rotulo]) => (
              <option key={chave} value={chave}>
                {rotulo}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            size={14}
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-4"
          />
        </div>
      </div>

      {/* O aviso vem antes do clique: criar arquiva o atual, e o aluno passa
          a ver os treinos deste — que nasce vazio. */}
      {temAtivo ? (
        <p className="rounded-[9px] border border-warning/30 bg-warning-bg px-3 py-2.5 text-[12px] leading-[1.5] text-ink-2">
          <strong className="font-bold">{preencher(m.jaTem, { nome })}</strong>{" "}
          {m.jaTemTexto}
        </p>
      ) : null}

      {Object.values(estado.errosPorCampo ?? {}).map((m) => (
        <p
          key={m}
          role="alert"
          className="text-[12px] font-semibold text-danger"
        >
          {m}
        </p>
      ))}
      {estado.erro ? (
        <p role="alert" className="text-[12px] font-semibold text-danger">
          {estado.erro}
        </p>
      ) : null}

      <Button type="submit" size="sm" block disabled={enviando}>
        {enviando ? m.criando : m.criar}
      </Button>
    </FormularioSeguro>
  );
}

// ---------------------------------------------------------------- miúdos ---

/**
 * Formulário cuja ação muda de endereço. Com cartão por salvar, o envio espera
 * o personal aceitar descartar — senão o redirect levaria as alterações sem
 * aviso.
 */
function FormularioSeguro({
  seguro,
  children,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => void | Promise<void>;
  seguro: (continuar: () => void) => void;
}) {
  const liberado = useRef(false);
  return (
    <form
      {...props}
      onSubmit={(evento) => {
        if (liberado.current) {
          liberado.current = false;
          return;
        }
        const form = evento.currentTarget;
        const botao = (evento.nativeEvent as SubmitEvent).submitter;
        // **Sem nada por salvar, o envio original segue — e não é re-enviado.**
        // `seguro` chama `continuar` na hora quando não há o que perguntar, e
        // `requestSubmit` dentro do próprio evento de submit é ignorado pelo
        // navegador (o formulário ainda está "disparando o envio"). A primeira
        // versão fazia isso: cancelava o envio e pedia outro que nunca saía, e
        // "Criar e ativar" não fazia nada justamente no caso comum (teste do
        // Otávio, 02/10). Só quando há confirmação o envio é cancelado e
        // refeito depois, já fora do evento.
        let naHora = true;
        let liberouNaHora = false;
        seguro(() => {
          if (naHora) {
            liberouNaHora = true;
            return;
          }
          liberado.current = true;
          form.requestSubmit(botao instanceof HTMLElement ? botao : undefined);
        });
        naHora = false;
        if (!liberouNaHora) evento.preventDefault();
      }}
    >
      {children}
    </form>
  );
}

function BotaoDeEnvio({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const { t } = usePainel();
  return (
    <Button type="submit" variant={variant} block disabled={pending}>
      {pending ? t.treinos.macro.aguarde : children}
    </Button>
  );
}

function BotaoDeFormulario({
  rotulo,
  className,
  children,
}: {
  rotulo: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={rotulo}
      title={rotulo}
      disabled={pending}
      className={cn(
        "inline-flex size-[26px] items-center justify-center rounded-[7px] transition disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
