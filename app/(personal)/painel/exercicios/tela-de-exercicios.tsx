"use client";

import { useActionState, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronRight,
  Library,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button } from "@/components/ui";
import { VideoDoExercicio } from "@/components/video-do-exercicio";
import { langDe } from "@/lib/domain/idioma";
import { normalizarParaBusca } from "@/lib/domain/texto";
import {
  enderecoDeEmbed,
  LIMITE_DA_DESCRICAO,
  LIMITE_DA_SEGURANCA,
} from "@/lib/domain/video";
import type { ExercicioDisponivel, ExercicioProprio } from "@/lib/queries/exercicios";
import { plural, preencher } from "@/lib/i18n/texto";
import { GRUPO_MUSCULAR } from "@/lib/rotulos";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

import { salvarExercicio, type EstadoExercicio } from "./actions";
import { DialogoDeExclusao } from "./dialogo-de-exclusao";

type Linha = ExercicioDisponivel & { em_uso?: number };
type Origem = "todos" | "seus" | "catalogo";
type Modo = { tipo: "vazio" } | { tipo: "ver"; chave: string } | { tipo: "editar"; chave: string } | { tipo: "criar" };

const chaveDe = (e: ExercicioDisponivel) => `${e.source}:${e.id}`;
// Só as chaves, e na ordem do enum: os rótulos vêm do idioma do painel.
const GRUPOS = Object.keys(GRUPO_MUSCULAR) as Enums<"muscle_group">[];

/**
 * A biblioteca de exercícios no layout do protótipo (27/09): à esquerda, a
 * lista por grupo muscular, com busca; à direita, o exercício escolhido — vídeo,
 * descrição, grupo e instruções de segurança —, ou o formulário dele.
 *
 * **O formulário mora no painel, não num diálogo**, como no protótipo: com
 * vídeo, descrição e segurança o cadastro ficou grande demais para uma caixa
 * no meio da tela, e editar ao lado da lista deixa ver o que muda.
 *
 * O catálogo do Reps Club aparece junto e **não se edita daqui**: o conteúdo
 * dele (vídeo e textos) entra por migration, fornecido pelo Otávio (27/09).
 */
export function TelaDeExercicios({
  catalogo,
  proprios,
}: {
  catalogo: ExercicioDisponivel[];
  proprios: ExercicioProprio[];
}) {
  const [termo, setTermo] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [origem, setOrigem] = useState<Origem>("todos");
  const [equipamento, setEquipamento] = useState<Enums<"equipment"> | "">("");
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());
  const [modo, setModo] = useState<Modo>({ tipo: "vazio" });
  const [aExcluir, setAExcluir] = useState<ExercicioProprio | null>(null);
  const { idioma, t } = usePainel();
  const x = t.exercicios;
  const { grupo: rotuloDoGrupo, equipamento: rotuloDoEquipamento } = t.rotulos;

  const todos = useMemo<Linha[]>(() => [...proprios, ...catalogo], [catalogo, proprios]);
  const busca = normalizarParaBusca(termo);

  const filtrados = useMemo(
    () =>
      todos.filter((e) => {
        if (origem === "seus" && e.source !== "custom") return false;
        if (origem === "catalogo" && e.source !== "catalog") return false;
        if (equipamento && e.equipment !== equipamento) return false;
        if (busca && !normalizarParaBusca(e.name).includes(busca)) return false;
        return true;
      }),
    [todos, origem, equipamento, busca],
  );

  // Na ordem da lista de grupos (a do enum), que é a do corpo, de cima a baixo.
  const porGrupo = GRUPOS.map((g) => ({
    grupo: g,
    itens: filtrados
      .filter((e) => e.muscle_group === g)
      // Os seus primeiro dentro do grupo: é o que o personal acabou de
      // cadastrar e vem conferir.
      .sort((a, b) =>
        a.source === b.source ? a.name.localeCompare(b.name, langDe(idioma)) : a.source === "custom" ? -1 : 1,
      ),
  })).filter((g) => g.itens.length > 0);

  const filtrando = Boolean(busca || equipamento || origem !== "todos");
  const selecionado =
    modo.tipo === "ver" || modo.tipo === "editar" ? todos.find((e) => chaveDe(e) === modo.chave) : undefined;

  function alternar(grupo: string) {
    setAbertos((atuais) => {
      const novos = new Set(atuais);
      if (novos.has(grupo)) novos.delete(grupo);
      else novos.add(grupo);
      return novos;
    });
  }

  function abrir(e: Linha) {
    setModo({ tipo: "ver", chave: chaveDe(e) });
    setAbertos((atuais) => new Set(atuais).add(e.muscle_group));
  }

  return (
    <>
      <CabecalhoDaPagina
        titulo={x.titulo}
        subtitulo={x.subtitulo}
        acoes={
          <Button size="sm" onClick={() => setModo({ tipo: "criar" })}>
            <Plus size={15} aria-hidden /> {x.adicionarExercicio}
          </Button>
        }
      />

      <div className="flex h-[calc(100dvh-172px)] min-h-[560px] gap-4">
        {/* ------------------------------------------------- a lista --- */}
        <aside
          aria-label={x.biblioteca}
          className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[12px] border border-border bg-surface"
        >
          <div className="border-b border-border-soft px-4 pt-4 pb-3">
            <div className="mb-[13px] flex gap-2">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-border bg-canvas px-[11px] focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/15">
                <Search size={15} aria-hidden className="shrink-0 text-ink-4" />
                <input
                  type="search"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder={x.buscar}
                  aria-label={x.buscar}
                  className="h-9 min-w-0 flex-1 bg-transparent text-[12.5px] font-medium text-ink placeholder:font-normal placeholder:text-ink-5 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => setFiltrosAbertos((v) => !v)}
                aria-expanded={filtrosAbertos}
                aria-label={x.filtros}
                title={x.filtros}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-[10px] border transition",
                  filtrosAbertos || equipamento || origem !== "todos"
                    ? "border-ink bg-canvas-sunken text-ink"
                    : "border-border text-ink-4 hover:text-ink",
                )}
              >
                <SlidersHorizontal size={15} aria-hidden />
              </button>
            </div>

            {filtrosAbertos ? (
              <div className="mb-3 space-y-2">
                <div role="group" aria-label={x.origem} className="flex gap-1 rounded-[9px] border border-border bg-canvas p-[3px]">
                  {(["todos", "seus", "catalogo"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      aria-pressed={origem === valor}
                      onClick={() => setOrigem(valor)}
                      className={cn(
                        "flex-1 rounded-[7px] py-1 text-[12px] font-semibold transition",
                        origem === valor ? "bg-surface text-ink shadow-xs" : "text-ink-4 hover:text-ink-2",
                      )}
                    >
                      {x.origens[valor]}
                    </button>
                  ))}
                </div>
                <select
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value as Enums<"equipment"> | "")}
                  aria-label={x.porEquipamento}
                  className="h-9 w-full rounded-[9px] border border-border bg-surface px-2.5 text-[12.5px] font-medium text-ink focus:border-brand focus:outline-none"
                >
                  <option value="">{x.todosOsEquipamentos}</option>
                  {Object.entries(rotuloDoEquipamento).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-semibold text-ink" aria-live="polite">
                {filtrando
                  ? preencher(x.contagemFiltrada, { n: filtrados.length, total: todos.length })
                  : preencher(x.contagem, { n: todos.length })}
              </p>
              <button
                type="button"
                onClick={() => setModo({ tipo: "criar" })}
                className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-ink transition hover:text-ink-2"
              >
                <Plus size={14} aria-hidden /> {x.adicionar}
              </button>
            </div>
          </div>

          <nav aria-label={x.porGrupo} className="flex-1 overflow-y-auto p-2">
            {porGrupo.length === 0 ? (
              <p className="px-2.5 py-4 text-[12.5px] leading-relaxed text-ink-4">
                {x.nadaComFiltro}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {porGrupo.map(({ grupo, itens }) => {
                  // Buscando, os grupos com resultado abrem sozinhos: esconder
                  // o que o personal acabou de procurar atrás de um clique a
                  // mais é o contrário de uma busca.
                  const aberto = busca ? true : abertos.has(grupo);
                  return (
                    <li key={grupo}>
                      <button
                        type="button"
                        onClick={() => alternar(grupo)}
                        aria-expanded={aberto}
                        className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-[9px] text-left transition hover:bg-canvas"
                      >
                        <span className="text-[12.5px] font-semibold text-ink-2">
                          {rotuloDoGrupo[grupo]}{" "}
                          <span className="font-medium text-ink-5">({itens.length})</span>
                        </span>
                        <ChevronRight
                          size={14}
                          aria-hidden
                          className={cn("text-ink-5 transition-transform", aberto && "rotate-90")}
                        />
                      </button>
                      {aberto ? (
                        <ul className="pt-0.5 pb-1.5 pl-2">
                          {itens.map((e) => {
                            const ativo = selecionado ? chaveDe(selecionado) === chaveDe(e) : false;
                            return (
                              <li key={chaveDe(e)}>
                                <button
                                  type="button"
                                  onClick={() => abrir(e)}
                                  aria-current={ativo ? "true" : undefined}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-[8px] border-l-2 px-2.5 py-2 text-left text-[12.5px] transition",
                                    ativo
                                      ? "border-ink bg-canvas-sunken font-semibold text-ink"
                                      : "border-transparent font-medium text-ink-2 hover:bg-canvas",
                                  )}
                                >
                                  <span className="min-w-0 flex-1 truncate">{e.name}</span>
                                  {e.source === "custom" ? (
                                    <span className="shrink-0 rounded-full bg-canvas-sunken px-1.5 text-[10px] font-semibold text-ink-3">
                                      {x.seuSelo}
                                    </span>
                                  ) : null}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </aside>

        {/* ------------------------------------------------ o detalhe --- */}
        <section
          aria-label={x.detalhes}
          className="min-w-0 flex-1 overflow-y-auto rounded-[12px] border border-border bg-surface"
        >
          {modo.tipo === "criar" || (modo.tipo === "editar" && selecionado?.source === "custom") ? (
            <FormularioDoExercicio
              key={modo.tipo === "editar" ? modo.chave : "novo"}
              exercicio={modo.tipo === "editar" ? (selecionado as ExercicioProprio) : null}
              aoCancelar={() =>
                setModo(modo.tipo === "editar" ? { tipo: "ver", chave: modo.chave } : { tipo: "vazio" })
              }
              aoSalvar={(id) => {
                setModo({ tipo: "ver", chave: `custom:${id}` });
              }}
            />
          ) : selecionado ? (
            <DetalheDoExercicio
              exercicio={selecionado}
              aoEditar={() => setModo({ tipo: "editar", chave: chaveDe(selecionado) })}
              aoAdicionar={() => setModo({ tipo: "criar" })}
              aoExcluir={() => setAExcluir(selecionado as ExercicioProprio)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-10 text-center">
              <span
                aria-hidden
                className="mb-[18px] flex size-[72px] items-center justify-center rounded-full bg-canvas text-ink-4"
              >
                <PlayCircle size={30} strokeWidth={1.7} />
              </span>
              <p className="mb-1.5 text-[18px] font-semibold text-ink">{x.selecione}</p>
              <p className="max-w-[280px] text-[13px] font-medium text-ink-4">{x.selecioneApoio}</p>
            </div>
          )}
        </section>
      </div>

      <DialogoDeExclusao
        exercicio={aExcluir}
        aoFechar={() => setAExcluir(null)}
        aoExcluir={() => {
          setAExcluir(null);
          setModo({ tipo: "vazio" });
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------- detalhe ---

function DetalheDoExercicio({
  exercicio,
  aoEditar,
  aoAdicionar,
  aoExcluir,
}: {
  exercicio: Linha;
  aoEditar: () => void;
  aoAdicionar: () => void;
  aoExcluir: () => void;
}) {
  const seu = exercicio.source === "custom";
  const emUso = exercicio.em_uso ?? 0;
  const { t } = usePainel();
  const x = t.exercicios;

  return (
    <article className="px-[26px] py-6">
      <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{exercicio.name}</h2>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            seu ? "bg-brand-soft text-brand" : "bg-canvas text-ink-3",
          )}
        >
          {seu ? x.seu : x.catalogoReps}
        </span>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          <VideoDoExercicio url={exercicio.video_url} nome={exercicio.name} titulo={x.video} />
          <p
            className={cn(
              "mt-2.5 truncate rounded-[10px] border border-border bg-canvas px-[13px] py-[9px] text-[12px] font-medium",
              exercicio.video_url ? "text-ink-2" : "text-ink-5",
            )}
          >
            {exercicio.video_url ?? (seu ? x.semVideoSeu : x.semVideo)}
          </p>
        </div>

        <div className="flex flex-col gap-[9px]">
          {seu ? (
            <>
              <button
                type="button"
                onClick={aoEditar}
                className="flex items-center justify-center gap-[7px] rounded-[8px] border-[1.5px] border-ink py-[11px] text-[13px] font-semibold text-ink transition hover:bg-canvas-sunken"
              >
                <Pencil size={15} aria-hidden /> {x.editar}
              </button>
              <Button onClick={aoAdicionar}>
                <Plus size={15} aria-hidden /> {x.adicionar}
              </Button>
              <button
                type="button"
                onClick={aoExcluir}
                className="flex items-center justify-center gap-[7px] rounded-[8px] border-[1.5px] border-border py-[11px] text-[13px] font-semibold text-ink-3 transition hover:border-danger hover:text-danger"
              >
                <Trash2 size={15} aria-hidden /> {x.excluir}
              </button>
            </>
          ) : (
            <>
              {/* Catálogo não se edita daqui: o conteúdo dele é do Reps Club, e
                  mudar aqui mudaria para todo personal do produto. */}
              <p className="flex items-start gap-2 rounded-[10px] bg-canvas p-3 text-[12px] leading-relaxed text-ink-3">
                <Library size={14} aria-hidden className="mt-0.5 shrink-0" />
                {x.doCatalogo}
              </p>
              <Button onClick={aoAdicionar}>
                <Plus size={15} aria-hidden /> {x.adicionar}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-[26px] flex flex-col gap-[22px]">
        <Bloco rotulo={x.descricao}>
          <Texto valor={exercicio.description} vazio={x.semDescricao} />
        </Bloco>

        <Bloco rotulo={x.grupo}>
          <span className="inline-block rounded-[8px] bg-brand-soft px-[11px] py-[5px] text-[12px] font-semibold text-brand">
            {t.rotulos.grupo[exercicio.muscle_group]}
          </span>
        </Bloco>

        <Bloco rotulo={x.execucao}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-4">
            <Dado rotulo={x.equipamento} valor={t.rotulos.equipamento[exercicio.equipment]} />
            <Dado rotulo={x.descansoPadrao} valor={`${exercicio.default_rest_seconds}s`} />
            <Dado rotulo={x.carga} valor={exercicio.is_bodyweight ? x.pesoCorporal : x.comCarga} />
            <Dado rotulo={x.lado} valor={exercicio.is_unilateral ? x.unilateral : x.bilateral} />
          </dl>
        </Bloco>

        <Bloco rotulo={x.seguranca}>
          <Texto valor={exercicio.safety_notes} vazio={x.semSeguranca} />
        </Bloco>

        {seu ? (
          <p className="text-[12px] text-ink-4">
            {emUso === 0 ? x.emNenhum : plural(emUso, x.prescritoEm)}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Bloco({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-[9px] text-[12px] font-medium tracking-[0.02em] text-ink-5">{rotulo}</h3>
      {children}
    </section>
  );
}

function Texto({ valor, vazio }: { valor: string | null; vazio: string }) {
  return (
    <p className={cn("text-[13.5px] leading-[1.6] font-medium whitespace-pre-line", valor ? "text-ink-2" : "text-ink-5")}>
      {valor ?? vazio}
    </p>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11.5px] text-ink-5">{rotulo}</dt>
      <dd className="font-medium text-ink-2">{valor}</dd>
    </div>
  );
}

// -------------------------------------------------------------- formulário ---

const INICIAL: EstadoExercicio = {};

const CAMPO =
  "w-full rounded-[8px] border-[1.5px] border-border bg-canvas px-[13px] py-[10px] text-[13px] font-medium text-ink transition " +
  "placeholder:font-normal placeholder:text-ink-5 focus:border-brand focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-brand/15";

function FormularioDoExercicio({
  exercicio,
  aoCancelar,
  aoSalvar,
}: {
  exercicio: ExercicioProprio | null;
  aoCancelar: () => void;
  aoSalvar: (id: string) => void;
}) {
  const [estado, acao, enviando] = useActionState(salvarExercicio, INICIAL);
  const idBase = useId();
  const campos = estado.campos;
  const { t } = usePainel();
  const x = t.exercicios;
  const fx = x.formulario;

  const [video, setVideo] = useState(exercicio?.video_url ?? campos?.video ?? "");
  const [descricao, setDescricao] = useState(exercicio?.description ?? campos?.descricao ?? "");
  const [seguranca, setSeguranca] = useState(exercicio?.safety_notes ?? campos?.seguranca ?? "");
  const [grupo, setGrupo] = useState<string>(exercicio?.muscle_group ?? campos?.grupo ?? "");

  // Fecha no sucesso comparando a identidade do estado, no render — o padrão
  // que o projeto usa desde o onboarding (e não efeito com setState).
  const [ultimo, setUltimo] = useState(estado);
  if (estado !== ultimo) {
    setUltimo(estado);
    if (estado.sucesso && estado.id) aoSalvar(estado.id);
  }

  const erros = estado.errosPorCampo ?? {};
  const previa = video.trim() && enderecoDeEmbed(video) ? video : null;

  return (
    <form action={acao} noValidate className="px-[26px] py-6">
      {exercicio ? <input type="hidden" name="id" value={exercicio.id} /> : null}
      <input type="hidden" name="grupo" value={grupo} />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          <label htmlFor={`${idBase}-nome`} className="sr-only">
            {fx.nome}
          </label>
          <input
            id={`${idBase}-nome`}
            name="nome"
            defaultValue={exercicio?.name ?? campos?.nome}
            placeholder={fx.nome}
            maxLength={80}
            autoComplete="off"
            aria-invalid={erros.nome ? true : undefined}
            className={cn(
              "w-full border-b-2 bg-transparent pb-1.5 text-[26px] font-semibold tracking-[-0.01em] text-ink placeholder:text-ink-5 focus:outline-none",
              erros.nome ? "border-danger" : "border-border focus:border-brand",
            )}
          />
          <Erro mensagem={erros.nome} />
        </div>
        <div className="flex shrink-0 gap-[9px]">
          <Button type="button" size="sm" variant="secondary" onClick={aoCancelar} disabled={enviando}>
            {t.comum.cancelar}
          </Button>
          <Button type="submit" size="sm" disabled={enviando}>
            {enviando ? t.comum.salvando : fx.salvar}
          </Button>
        </div>
      </div>

      <div className="max-w-[560px] space-y-[22px]">
        <div>
          <VideoDoExercicio
            url={previa}
            nome={exercicio?.name ?? fx.novoExercicio}
            titulo={x.video}
          />
          <label htmlFor={`${idBase}-video`} className="sr-only">
            {fx.linkDoVideo}
          </label>
          <input
            id={`${idBase}-video`}
            name="video"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder={fx.linkExemplo}
            maxLength={500}
            inputMode="url"
            aria-invalid={erros.video ? true : undefined}
            className={cn(CAMPO, "mt-2.5", (erros.video || (video.trim() && !previa)) && "border-danger")}
          />
          {/* Avisa enquanto digita, antes de salvar: a prévia vazia sozinha não
              diz se o link está errado ou se o vídeo só está carregando. */}
          <Erro
            mensagem={
              erros.video ?? (video.trim() && !previa ? fx.linkNaoReconhecido : undefined)
            }
          />
        </div>

        <CampoLongo
          id={`${idBase}-descricao`}
          rotulo={x.descricao}
          name="descricao"
          valor={descricao}
          aoMudar={setDescricao}
          limite={LIMITE_DA_DESCRICAO}
          placeholder={fx.descricaoExemplo}
          erro={erros.descricao}
        />

        <fieldset>
          <legend className="text-[12px] font-medium tracking-[0.02em] text-ink-5">{x.grupo}</legend>
          {/* Um grupo só, de propósito (decisão do Otávio, 27/09): recorde,
              progresso e volume por grupo contam por um grupo por exercício. */}
          <div role="radiogroup" aria-label={x.grupo} className="mt-[9px] flex flex-wrap gap-[7px]">
            {GRUPOS.map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={grupo === g}
                onClick={() => setGrupo(g)}
                className={cn(
                  "rounded-[9px] border-[1.5px] px-[13px] py-[7px] text-[12px] font-semibold transition",
                  grupo === g
                    ? "border-ink bg-ink text-white"
                    : "border-border text-ink-3 hover:border-border-strong hover:text-ink",
                )}
              >
                {t.rotulos.grupo[g]}
              </button>
            ))}
          </div>
          <Erro mensagem={erros.grupo} />
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idBase}-equip`} className="mb-2 block text-[12px] font-medium text-ink-5">
              {x.equipamento}
            </label>
            <select
              id={`${idBase}-equip`}
              name="equipamento"
              defaultValue={exercicio?.equipment ?? campos?.equipamento ?? ""}
              aria-invalid={erros.equipamento ? true : undefined}
              className={cn(CAMPO, erros.equipamento && "border-danger")}
            >
              <option value="">{fx.escolha}</option>
              {Object.entries(t.rotulos.equipamento).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
            <Erro mensagem={erros.equipamento} />
          </div>
          <div>
            <label htmlFor={`${idBase}-descanso`} className="mb-2 block text-[12px] font-medium text-ink-5">
              {fx.descansoSegundos}
            </label>
            <input
              id={`${idBase}-descanso`}
              name="descanso"
              type="number"
              inputMode="numeric"
              defaultValue={exercicio?.default_rest_seconds ?? campos?.descanso ?? "120"}
              aria-invalid={erros.descanso ? true : undefined}
              className={cn(CAMPO, erros.descanso && "border-danger")}
            />
            <Erro mensagem={erros.descanso} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          <Marcar
            name="peso_corporal"
            padrao={exercicio?.is_bodyweight}
            rotulo={x.pesoCorporal}
            apoio={fx.pesoCorporalApoio}
          />
          <Marcar
            name="unilateral"
            padrao={exercicio?.is_unilateral}
            rotulo={x.unilateral}
            apoio={fx.unilateralApoio}
          />
        </div>

        <CampoLongo
          id={`${idBase}-seguranca`}
          rotulo={x.seguranca}
          name="seguranca"
          valor={seguranca}
          aoMudar={setSeguranca}
          limite={LIMITE_DA_SEGURANCA}
          placeholder={fx.segurancaExemplo}
          erro={erros.seguranca}
        />

        {estado.erro ? (
          <p role="alert" className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger">
            {estado.erro}
          </p>
        ) : null}

        <p className="text-[12px] text-ink-4">
          {exercicio ? fx.alterarMuda : fx.novoAparece} {fx.alunoVe}
        </p>
      </div>
    </form>
  );
}

function CampoLongo({
  id,
  rotulo,
  name,
  valor,
  aoMudar,
  limite,
  placeholder,
  erro,
}: {
  id: string;
  rotulo: string;
  name: string;
  valor: string;
  aoMudar: (v: string) => void;
  limite: number;
  placeholder: string;
  erro?: string;
}) {
  // O contador muda de tom perto do limite, e diz o número: cor sozinha não
  // avisa ninguém.
  const perto = valor.length > limite * 0.9;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-medium tracking-[0.02em] text-ink-5">
          {rotulo}
        </label>
        <span className={cn("text-[12px] font-medium tabular-nums", perto ? "text-warning" : "text-ink-5")}>
          {valor.length}/{limite}
        </span>
      </div>
      <textarea
        id={id}
        name={name}
        value={valor}
        onChange={(e) => aoMudar(e.target.value.slice(0, limite))}
        placeholder={placeholder}
        rows={3}
        aria-invalid={erro ? true : undefined}
        className={cn(CAMPO, "resize-y leading-[1.5]", erro && "border-danger")}
      />
      <Erro mensagem={erro} />
    </div>
  );
}

function Marcar({
  name,
  padrao,
  rotulo,
  apoio,
}: {
  name: string;
  padrao?: boolean;
  rotulo: string;
  apoio: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input type="checkbox" name={name} defaultChecked={padrao} className="mt-0.5 size-4 shrink-0 accent-brand" />
      <span className="text-[13px] leading-[1.5] text-ink-2">
        {rotulo}
        <span className="block text-[12px] text-ink-4">{apoio}</span>
      </span>
    </label>
  );
}

function Erro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-[5px] text-[12px] text-danger">
      <AlertCircle size={12} aria-hidden /> {mensagem}
    </p>
  );
}
