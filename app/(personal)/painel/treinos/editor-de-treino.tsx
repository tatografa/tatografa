"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Search, Trash2, X } from "lucide-react";

import { Badge, Button, Card, Dialog, Input, Select, Textarea } from "@/components/ui";
import { LIMITES, mover } from "@/lib/domain/prescricao";
import { duracaoEstimadaMin, totalDeSeries } from "@/lib/domain/treino";
import type { ExercicioDisponivel } from "@/lib/queries/exercicios";
import { EQUIPAMENTO, GRUPO_MUSCULAR } from "@/lib/rotulos";
import type { Enums } from "@/types/database";

import {
  buscarExerciciosAction,
  excluirTreino,
  salvarTreino,
  type EstadoDoEditor,
} from "./actions";

export type ItemDoEditor = {
  /** Chave estável de React. Não vai para o banco. */
  chave: string;
  /** `workout_exercises.id`, só quando a linha já existe. */
  id?: string;
  exerciseId: string;
  source: Enums<"exercise_source">;
  nome: string;
  grupo: Enums<"muscle_group">;
  equipamento: Enums<"equipment">;
  sets: string;
  reps: string;
  rest: string;
  technique: string;
  notes: string;
  /** Séries já executadas pelo aluno nesta linha. Remover leva o histórico. */
  seriesRegistradas: number;
};

/**
 * O programa em que este treino vive. Vem pronto do servidor: desde o M2-01 o
 * treino nasce dentro de um macrotreino, e quem escolhe o aluno é a tela de
 * macrotreinos. O editor não pergunta nem um nem outro.
 */
export type ProgramaDoEditor = {
  id: string;
  name: string;
  total_weeks: number;
  aluno: { id: string; name: string };
};

export type TreinoEmEdicao = {
  id: string;
  label: string;
  nome: string;
  observacao: string;
  itens: ItemDoEditor[];
};

export type EditorDeTreinoProps = {
  programa: ProgramaDoEditor;
  treino?: TreinoEmEdicao;
  salvo?: boolean;
};

const INICIAL: EstadoDoEditor = {};

export function EditorDeTreino({
  programa,
  treino,
  salvo = false,
}: EditorDeTreinoProps) {
  const [estado, acao, enviando] = useActionState(salvarTreino, INICIAL);

  const [label, setLabel] = useState(treino?.label ?? "A");
  const [nome, setNome] = useState(treino?.nome ?? "");
  const [observacao, setObservacao] = useState(treino?.observacao ?? "");
  const [itens, setItens] = useState<ItemDoEditor[]>(treino?.itens ?? []);
  const [aRemover, setARemover] = useState<ItemDoEditor | null>(null);
  const [buscaAberta, setBuscaAberta] = useState(false);

  const resumo = useMemo(() => {
    const parametros = itens.map((item) => ({
      sets: Number(item.sets) || 0,
      rest_seconds: Number(item.rest) || 0,
    }));
    return {
      series: totalDeSeries(parametros),
      minutos: duracaoEstimadaMin(parametros),
    };
  }, [itens]);

  function adicionar(exercicio: ExercicioDisponivel) {
    setItens((atuais) => [
      ...atuais,
      {
        chave: `novo-${exercicio.source}-${exercicio.id}-${atuais.length}-${Date.now()}`,
        exerciseId: exercicio.id,
        source: exercicio.source,
        nome: exercicio.name,
        grupo: exercicio.muscle_group,
        equipamento: exercicio.equipment,
        sets: "3",
        reps: "10",
        rest: String(exercicio.default_rest_seconds),
        technique: "",
        notes: "",
        seriesRegistradas: 0,
      },
    ]);
  }

  function alterar(chave: string, campo: keyof ItemDoEditor, valor: string) {
    setItens((atuais) =>
      atuais.map((item) => (item.chave === chave ? { ...item, [campo]: valor } : item)),
    );
  }

  function pedirRemocao(item: ItemDoEditor) {
    // Exercício nunca executado sai direto; com histórico, o personal confirma.
    if (item.seriesRegistradas === 0) {
      setItens((atuais) => atuais.filter((i) => i.chave !== item.chave));
      return;
    }
    setARemover(item);
  }

  const payload = JSON.stringify(
    itens.map((item) => ({
      id: item.id,
      exerciseId: item.exerciseId,
      source: item.source,
      sets: paraNumero(item.sets),
      reps: item.reps,
      rest: paraNumero(item.rest),
      technique: item.technique || null,
      notes: item.notes || null,
    })),
  );

  return (
    <form action={acao} noValidate className="space-y-6">
      <input type="hidden" name="treinoId" value={treino?.id ?? ""} />
      {/* `excluirTreino` lê este campo: o botão de excluir usa `formAction`
          neste mesmo formulário, porque <form> dentro de <form> é inválido. */}
      {treino && <input type="hidden" name="id" value={treino.id} />}
      {/* O programa é contexto herdado da URL, não escolha do formulário. Vai
          num hidden porque campo que o usuário não edita não vira controle —
          e campo desabilitado nem sequer entra no FormData. */}
      <input type="hidden" name="programaId" value={programa.id} />
      <input type="hidden" name="exercicios" value={payload} />

      {salvo && (
        <p
          role="status"
          className="rounded-card border border-success/30 bg-success/10 px-4 py-3 text-[13.5px] font-semibold text-success-dark"
        >
          Treino salvo. O aluno já vê essa prescrição.
        </p>
      )}

      <Card size="lg" className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-soft pb-4">
          <div>
            <p className="eyebrow text-ink-4">Programa</p>
            <p className="mt-1 text-[14.5px] font-bold text-ink">{programa.name}</p>
          </div>
          <p className="text-[12.5px] text-ink-4">
            {programa.aluno.name} · {programa.total_weeks} semanas
          </p>
        </div>

        {estado.errosPorCampo?.programa && (
          <p
            role="alert"
            className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
          >
            {estado.errosPorCampo.programa}
          </p>
        )}

        <div className="sm:max-w-[140px]">
          <Input
            label="Letra"
            name="label"
            value={label}
            maxLength={4}
            onChange={(e) => setLabel(e.target.value.toUpperCase())}
            error={estado.errosPorCampo?.label}
            hint="A, B, C…"
          />
        </div>

        <Input
          label="Nome do treino"
          name="nome"
          placeholder="Peito e tríceps"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={estado.errosPorCampo?.nome}
        />

        <Textarea
          label="Observação para o aluno"
          name="observacao"
          placeholder="Opcional. Aparece no topo do treino."
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          error={estado.errosPorCampo?.observacao}
        />

      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="eyebrow text-ink-4">Exercícios · {itens.length}</h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-ink-4">
              {/* Sem exercício não há duração: a estimativa tem piso de 5 min e
                  mostrar "~5 min" num treino vazio seria mentira. */}
              {itens.length === 0
                ? "sem exercícios"
                : `${resumo.series} séries · ~${resumo.minutos} min`}
            </span>
            <Button size="sm" onClick={() => setBuscaAberta(true)}>
              <Plus size={15} aria-hidden /> Adicionar
            </Button>
          </div>
        </div>

        {estado.errosPorCampo?.exercicios && (
          <p
            role="alert"
            className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
          >
            {estado.errosPorCampo.exercicios}
          </p>
        )}

        {itens.length === 0 ? (
          <Card size="lg" className="text-[14px] leading-[1.6] text-ink-3">
            Nenhum exercício ainda. Clique em <strong>Adicionar</strong> para buscar no
            catálogo.
          </Card>
        ) : (
          <ul className="space-y-2.5">
            {itens.map((item, indice) => (
              <li key={item.chave}>
                <LinhaDoExercicio
                  item={item}
                  indice={indice}
                  total={itens.length}
                  erros={estado.errosPorExercicio?.[indice]}
                  aoAlterar={(campo, valor) => alterar(item.chave, campo, valor)}
                  aoMover={(destino) =>
                    setItens((atuais) => mover(atuais, indice, destino))
                  }
                  aoRemover={() => pedirRemocao(item)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {estado.erro && (
        <p
          role="alert"
          className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        {treino ? (
          <ExcluirTreino nome={treino.nome} />
        ) : (
          <Link
            href="/painel/macrotreinos"
            className="text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
          >
            Cancelar
          </Link>
        )}
        <Button type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar treino"}
        </Button>
      </div>

      <BuscaDeExercicios
        aberto={buscaAberta}
        aoFechar={() => setBuscaAberta(false)}
        aoEscolher={adicionar}
      />

      <Dialog
        aberto={aRemover !== null}
        aoFechar={() => setARemover(null)}
        titulo="Remover exercício já treinado"
        descricao={
          aRemover
            ? `${aRemover.nome} tem ${aRemover.seriesRegistradas} ${
                aRemover.seriesRegistradas === 1 ? "série registrada" : "séries registradas"
              } pelo aluno. Remover apaga esse histórico junto — não dá para desfazer.`
            : undefined
        }
      >
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" block onClick={() => setARemover(null)}>
            Manter
          </Button>
          <Button
            type="button"
            variant="danger"
            block
            onClick={() => {
              setItens((atuais) => atuais.filter((i) => i.chave !== aRemover?.chave));
              setARemover(null);
            }}
          >
            Remover mesmo assim
          </Button>
        </div>
      </Dialog>
    </form>
  );
}

// ------------------------------------------------------------ linha ----------

type CampoEditavel = "sets" | "reps" | "rest" | "technique" | "notes";

function LinhaDoExercicio({
  item,
  indice,
  total,
  erros,
  aoAlterar,
  aoMover,
  aoRemover,
}: {
  item: ItemDoEditor;
  indice: number;
  total: number;
  erros?: Partial<Record<"sets" | "reps" | "descanso", string>>;
  aoAlterar: (campo: CampoEditavel, valor: string) => void;
  aoMover: (destino: number) => void;
  aoRemover: () => void;
}) {
  const idBase = useId();

  return (
    <Card className="space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="truncate text-[14.5px] font-bold text-ink">
            <span className="font-mono text-ink-4">{indice + 1}.</span> {item.nome}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge>{GRUPO_MUSCULAR[item.grupo]}</Badge>
            <Badge tone="neutro">{EQUIPAMENTO[item.equipamento]}</Badge>
            {item.seriesRegistradas > 0 && (
              <Badge tone="brand">{item.seriesRegistradas} séries feitas</Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <BotaoDeIcone
            rotulo={`Subir ${item.nome}`}
            disabled={indice === 0}
            onClick={() => aoMover(indice - 1)}
          >
            <ChevronUp size={16} aria-hidden />
          </BotaoDeIcone>
          <BotaoDeIcone
            rotulo={`Descer ${item.nome}`}
            disabled={indice === total - 1}
            onClick={() => aoMover(indice + 1)}
          >
            <ChevronDown size={16} aria-hidden />
          </BotaoDeIcone>
          <BotaoDeIcone rotulo={`Remover ${item.nome}`} onClick={aoRemover} perigo>
            <Trash2 size={15} aria-hidden />
          </BotaoDeIcone>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          id={`${idBase}-sets`}
          label="Séries"
          type="number"
          inputMode="numeric"
          min={LIMITES.seriesMin}
          max={LIMITES.seriesMax}
          value={item.sets}
          onChange={(e) => aoAlterar("sets", e.target.value)}
          error={erros?.sets}
        />
        <Input
          id={`${idBase}-reps`}
          label="Repetições"
          placeholder="12 ou 8-10"
          value={item.reps}
          onChange={(e) => aoAlterar("reps", e.target.value)}
          error={erros?.reps}
          hint="Número ou faixa."
        />
        <Input
          id={`${idBase}-rest`}
          label="Descanso (s)"
          type="number"
          inputMode="numeric"
          min={LIMITES.descansoMin}
          max={LIMITES.descansoMax}
          step={5}
          value={item.rest}
          onChange={(e) => aoAlterar("rest", e.target.value)}
          error={erros?.descanso}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id={`${idBase}-tecnica`}
          label="Técnica"
          placeholder="Drop-set, bi-set…"
          value={item.technique}
          onChange={(e) => aoAlterar("technique", e.target.value)}
        />
        <Input
          id={`${idBase}-obs`}
          label="Observação"
          placeholder="Cadência lenta na descida"
          value={item.notes}
          onChange={(e) => aoAlterar("notes", e.target.value)}
        />
      </div>
    </Card>
  );
}

function BotaoDeIcone({
  rotulo,
  children,
  perigo = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  rotulo: string;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface transition " +
        "disabled:opacity-35 " +
        (perigo
          ? "text-ink-4 hover:border-danger hover:text-danger"
          : "text-ink-3 hover:border-border-strong hover:text-ink")
      }
      {...props}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------ busca ----------

function BuscaDeExercicios({
  aberto,
  aoFechar,
  aoEscolher,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoEscolher: (exercicio: ExercicioDisponivel) => void;
}) {
  const [termo, setTermo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [resultados, setResultados] = useState<ExercicioDisponivel[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const requisicao = useRef(0);

  useEffect(() => {
    if (!aberto) return;

    // Espera o personal parar de digitar antes de consultar: sem isso, cada
    // tecla vira uma ida ao servidor.
    const id = setTimeout(async () => {
      const minha = ++requisicao.current;
      setCarregando(true);
      try {
        const lista = await buscarExerciciosAction({
          termo: termo || undefined,
          grupo: (grupo || undefined) as Enums<"muscle_group"> | undefined,
          equipamento: (equipamento || undefined) as Enums<"equipment"> | undefined,
        });
        // Resposta de uma busca antiga chegando depois da nova sobrescreveria
        // a lista certa com a errada.
        if (minha !== requisicao.current) return;
        setResultados(lista);
        setFalhou(false);
      } catch {
        if (minha !== requisicao.current) return;
        setFalhou(true);
      } finally {
        if (minha === requisicao.current) setCarregando(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [aberto, termo, grupo, equipamento]);

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Adicionar exercício"
      descricao="Busque pelo nome ou filtre por grupo e equipamento."
      className="max-w-[560px]"
    >
      {/* O <dialog> nativo não usa portal: este bloco continua dentro do <form>
          do treino. Sem isto, Enter no campo de busca dispara o envio implícito
          e salva o treino no meio da escolha do exercício. */}
      <div
        className="space-y-4"
        onKeyDown={(evento) => {
          const alvo = evento.target as HTMLElement;
          const ehCampo = alvo.tagName === "INPUT" || alvo.tagName === "SELECT";
          if (evento.key === "Enter" && ehCampo) evento.preventDefault();
        }}
      >
        <div className="relative">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4"
          />
          <Input
            aria-label="Buscar exercício"
            placeholder="Supino, remada, agachamento…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            aria-label="Grupo muscular"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          >
            <option value="">Todos os grupos</option>
            {Object.entries(GRUPO_MUSCULAR).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Equipamento"
            value={equipamento}
            onChange={(e) => setEquipamento(e.target.value)}
          >
            <option value="">Todos os equipamentos</option>
            {Object.entries(EQUIPAMENTO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
        </div>

        <div className="max-h-[320px] overflow-y-auto rounded-card border border-border">
          {falhou ? (
            <p className="px-4 py-6 text-center text-[13px] font-semibold text-danger">
              Não deu para buscar agora. Tente de novo.
            </p>
          ) : carregando && resultados.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-4">Buscando…</p>
          ) : resultados.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-4">
              Nenhum exercício com esse filtro.
            </p>
          ) : (
            <ul className="divide-y divide-border-soft">
              {resultados.map((exercicio) => (
                <li key={`${exercicio.source}:${exercicio.id}`}>
                  <button
                    type="button"
                    onClick={() => aoEscolher(exercicio)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-canvas-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {exercicio.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-4">
                        {GRUPO_MUSCULAR[exercicio.muscle_group]} ·{" "}
                        {EQUIPAMENTO[exercicio.equipment]}
                        {exercicio.source === "custom" ? " · seu exercício" : ""}
                      </span>
                    </span>
                    <Plus size={16} aria-hidden className="shrink-0 text-ink-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={aoFechar}
          className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
        >
          <X size={14} aria-hidden /> Fechar
        </button>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------- auxiliares -------

function ExcluirTreino({ nome }: { nome: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-[13px] font-semibold text-ink-4 transition hover:text-danger"
      >
        Excluir treino
      </button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Excluir treino"
        descricao={`"${nome}" e todo o histórico de execução dele somem. Não dá para desfazer.`}
      >
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" block onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          {/* `formAction` desvia o envio deste formulário para a exclusão, sem
              precisar de um segundo <form> aninhado. */}
          <Button type="submit" variant="danger" block formAction={excluirTreino} formNoValidate>
            Excluir
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/** Campo numérico vazio vira `null`, para o zod dizer "informe" em português. */
function paraNumero(bruto: string): number | null {
  if (bruto.trim() === "") return null;
  const valor = Number(bruto);
  return Number.isFinite(valor) ? valor : null;
}
