"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { IndicadoresDaCarteiraNoTopo } from "@/components/personal/indicadores-da-carteira";
import { StatusDoAluno } from "@/components/personal/status-do-aluno";
import { comoPorcentagem } from "@/lib/domain/atencao";
import {
  FILTROS_DE_PROGRAMA,
  FILTROS_DE_STATUS,
  SEM_FILTRO,
  filtrarAlunos,
  filtrosDeTempo,
  filtrosLigados,
  ordenarAlunos,
  precisaDeAtencao,
  type CampoDeOrdem,
  type FiltrosDaCarteira,
  type IndicadoresDaCarteira,
  type Ordem,
} from "@/lib/domain/carteira";
import { iniciaisDe } from "@/lib/domain/nome";
import type { AlunoNaTabela } from "@/lib/queries/painel";
import { PERFIL_BIOLOGICO } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/**
 * A carteira como tabela, no layout do protótipo (27/09): os quatro números,
 * a busca com o botão "Filtros" que abre os filtros avançados, e a tabela com
 * o rodapé "Mostrando N de M alunos".
 *
 * Tabela e não cartões porque é a tela que o doc 06 descreve como densa de
 * propósito: o personal está sentado, no desktop, e quer comparar alunos na
 * vertical — quem está com aderência baixa, quem está sem programa.
 *
 * `<table>` de verdade, não `<div>` com grade: o cabeçalho de coluna é o que
 * dá nome a cada célula para quem usa leitor de tela, e uma grade de divs faria
 * "72%" ser lido sem dizer 72% de quê.
 *
 * **As colunas do protótipo que não existem aqui, e o que entrou no lugar.**
 * "Plano" virou **Programa** e "Vencimento" virou **Aderência**: não há plano
 * nem cobrança no modelo (18/09), e as duas perguntas que sobram daquelas
 * colunas são "ele tem treino montado?" e "ele está fazendo?". A caixinha de
 * seleção da primeira coluna não entrou: não existe ação em lote, e uma caixa
 * que se marca sem nada para fazer com a marcação é um controle mentindo.
 *
 * **Sem paginação.** O protótipo pagina de seis em seis; uma carteira de
 * piloto cabe numa página, e paginar esconderia do Ctrl+F e da ordenação
 * justamente o aluno que o personal está procurando. Quando a carteira passar
 * de uma página de consulta, a busca vira filtro do servidor e a paginação
 * vem junto.
 *
 * Os indicadores moram aqui, e não na página, porque o quarto deles é um botão
 * que liga o filtro "N+ dias" desta tabela — e o estado do filtro é daqui.
 */
export function TabelaDeAlunos({
  alunos,
  idDoPersonal,
  indicadores,
  diasParaAlerta,
}: {
  alunos: AlunoNaTabela[];
  /**
   * Para marcar a própria linha. O personal que treina é aluno de si mesmo
   * (migration 0019), então ele aparece na própria carteira — e sem o selo a
   * lista fica com um nome repetido do cabeçalho, sem explicação.
   */
  idDoPersonal: string;
  indicadores: IndicadoresDaCarteira;
  /** O limiar que o personal configurou. */
  diasParaAlerta: number;
}) {
  const [filtros, setFiltros] = useState<FiltrosDaCarteira>(SEM_FILTRO);
  const [abertos, setAbertos] = useState(false);
  // Nome crescente é a ordem que o personal espera ao abrir uma lista de
  // pessoas. As outras duas colunas ele pede clicando.
  const [ordem, setOrdem] = useState<Ordem>({ campo: "nome", crescente: true });
  const idDoPainel = useId();

  const lista = useMemo(
    () => ordenarAlunos(filtrarAlunos(alunos, filtros, diasParaAlerta), ordem),
    [alunos, filtros, diasParaAlerta, ordem],
  );

  // Primeiro clique numa coluna nova entra na ordem mais útil dela, não sempre
  // na crescente: em "último treino" e "aderência", quem interessa é o extremo
  // ruim — quem está sumido há mais tempo e quem está treinando menos.
  function ordenarPor(campo: CampoDeOrdem) {
    setOrdem((atual) =>
      atual.campo === campo
        ? { campo, crescente: !atual.crescente }
        : { campo, crescente: campo === "nome" },
    );
  }

  function mudar<C extends keyof FiltrosDaCarteira>(campo: C, valor: FiltrosDaCarteira[C]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  }

  const ligados = filtrosLigados(filtros);
  const filtrando = Boolean(filtros.busca.trim()) || ligados > 0;

  // "Convidado" é um valor do enum que nenhum caminho grava hoje (13/09). O
  // chip só aparece se alguém estiver nele: um filtro que sempre devolve zero
  // é um botão a mais para ignorar.
  const opcoesDeStatus = FILTROS_DE_STATUS.filter(
    (o) => o.valor !== "convidado" || alunos.some((a) => a.status === "convidado"),
  );

  // Carteira vazia não ganha números, busca nem filtro: um campo de busca em
  // cima de "nenhum aluno ainda" oferece reduzir uma lista que não existe, e no
  // primeiro acesso do personal é a primeira coisa que ele vê.
  if (!alunos.length) return <Vazio filtrando={false} />;

  return (
    <div className="space-y-4">
      <IndicadoresDaCarteiraNoTopo
        indicadores={indicadores}
        diasParaAlerta={diasParaAlerta}
        filtrandoAtencao={filtros.tempo === "alerta"}
        aoFiltrarAtencao={() => {
          const ligar = filtros.tempo !== "alerta";
          mudar("tempo", ligar ? "alerta" : "todos");
          if (ligar) setAbertos(true);
        }}
      />

      <div className="flex gap-3">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-4 text-ink-5" />
          <span className="sr-only">Buscar aluno por nome ou e-mail</span>
          <input
            type="search"
            value={filtros.busca}
            onChange={(e) => mudar("busca", e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="h-11 w-full rounded-[10px] border border-border bg-surface pr-3.5 pl-10 text-[14px] text-ink transition placeholder:text-ink-5 focus:border-ink focus:outline-none"
          />
        </label>
        <button
          type="button"
          aria-expanded={abertos}
          aria-controls={idDoPainel}
          onClick={() => setAbertos((a) => !a)}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border px-4 text-[13.5px] font-semibold transition",
            abertos ? "border-ink bg-surface text-ink" : "border-border bg-surface text-ink hover:border-border-strong",
          )}
        >
          <SlidersHorizontal size={15} aria-hidden />
          Filtros
          {ligados > 0 ? (
            <span className="rounded-full bg-brand px-1.5 text-[11px] leading-[18px] text-white tabular-nums">
              {ligados}
              <span className="sr-only"> ligados</span>
            </span>
          ) : null}
        </button>
      </div>

      {abertos ? (
        <section
          id={idDoPainel}
          aria-label="Filtros avançados"
          className="rounded-[12px] border border-border bg-surface px-5 py-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-ink">Filtros avançados</h2>
            {ligados > 0 ? (
              <button
                type="button"
                onClick={() => setFiltros((atual) => ({ ...SEM_FILTRO, busca: atual.busca }))}
                className="text-[13px] font-semibold text-brand transition hover:text-brand-hover"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
          <div className="grid gap-x-8 gap-y-4 @min-[760px]:grid-cols-2 @min-[1060px]:grid-cols-3">
            <GrupoDeChips
              titulo="Status"
              opcoes={opcoesDeStatus}
              valor={filtros.status}
              aoEscolher={(v) => mudar("status", v)}
            />
            <GrupoDeChips
              titulo="Programa"
              opcoes={FILTROS_DE_PROGRAMA}
              valor={filtros.programa}
              aoEscolher={(v) => mudar("programa", v)}
            />
            <GrupoDeChips
              titulo="Tempo sem treino"
              opcoes={filtrosDeTempo(diasParaAlerta)}
              valor={filtros.tempo}
              aoEscolher={(v) => mudar("tempo", v)}
            />
          </div>
        </section>
      ) : null}

      {lista.length === 0 ? (
        <Vazio filtrando={filtrando} />
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <Coluna ordem={ordem} campo="nome" aoOrdenar={ordenarPor}>
                    Aluno
                  </Coluna>
                  <Coluna>Programa</Coluna>
                  <Coluna>Perfil biológico</Coluna>
                  <Coluna>Status</Coluna>
                  <Coluna ordem={ordem} campo="ultima" aoOrdenar={ordenarPor}>
                    Último treino
                  </Coluna>
                  <Coluna ordem={ordem} campo="aderencia" aoOrdenar={ordenarPor}>
                    Aderência
                  </Coluna>
                </tr>
              </thead>
              <tbody>
                {lista.map((aluno) => (
                  <Linha
                    key={aluno.id}
                    aluno={aluno}
                    ehVoce={aluno.id === idDoPersonal}
                    parado={precisaDeAtencao(aluno, diasParaAlerta)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border-soft px-5 py-3.5 text-[13px] text-ink-4" aria-live="polite">
            {filtrando
              ? `Mostrando ${lista.length} de ${alunos.length} ${alunos.length === 1 ? "aluno" : "alunos"}`
              : alunos.length === 1
                ? "1 aluno"
                : `${alunos.length} alunos`}
          </p>
        </div>
      )}
    </div>
  );
}

function GrupoDeChips<V extends string>({
  titulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  titulo: string;
  opcoes: { valor: V; rotulo: string }[];
  valor: V;
  aoEscolher: (valor: V) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[12.5px] text-ink-4">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={o.valor === valor}
            onClick={() => aoEscolher(o.valor)}
            className={cn(
              "min-h-8 rounded-[8px] border px-3 text-[12.5px] font-semibold transition",
              o.valor === valor
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-ink-2 hover:border-border-strong",
            )}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </fieldset>
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
function Linha({
  aluno,
  ehVoce,
  parado,
}: {
  aluno: AlunoNaTabela;
  ehVoce: boolean;
  /** Passou do limiar: o "último treino" vai em vermelho, com o triângulo. */
  parado: boolean;
}) {
  return (
    <tr className="group relative border-b border-border-soft last:border-0 transition hover:bg-canvas">
      <Celula>
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12.5px] font-semibold text-brand"
          >
            {iniciaisDe(aluno.name)}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <Link
                href={`/painel/alunos/${aluno.id}`}
                className="truncate text-[13.5px] font-semibold text-ink after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline"
              >
                {aluno.name}
              </Link>
              {ehVoce ? (
                <span className="shrink-0 rounded-full bg-ink px-1.5 py-px text-[10px] font-bold text-white">
                  Você
                </span>
              ) : null}
            </span>
            <span className="block truncate text-[12.5px] text-ink-4">{aluno.email}</span>
          </span>
        </span>
      </Celula>

      <Celula>
        {aluno.programa ? (
          <>
            <span className="block max-w-[210px] truncate text-ink">{aluno.programa.name}</span>
            <span className="block text-[12px] text-ink-4">
              Semana {aluno.semana_do_programa} de {aluno.programa.total_weeks}
            </span>
          </>
        ) : (
          <span className="text-ink-5">Sem programa</span>
        )}
      </Celula>

      <Celula>
        {aluno.biological_profile ? (
          PERFIL_BIOLOGICO[aluno.biological_profile]
        ) : (
          <span className="text-ink-5">Não informado</span>
        )}
      </Celula>

      <Celula>
        <StatusDoAluno status={aluno.status} />
      </Celula>

      <Celula>
        {aluno.dias_sem_treinar === null ? (
          // Quem nunca treinou não é alerta: ele não parou, ele não começou
          // (mesma regra do indicador).
          <span className="text-ink-5">Nunca treinou</span>
        ) : parado ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-brand">
            <AlertTriangle size={13} aria-hidden />
            {desde(aluno.dias_sem_treinar)}
            <span className="sr-only">, passou do seu limite</span>
          </span>
        ) : (
          desde(aluno.dias_sem_treinar)
        )}
      </Celula>

      {/*
        "—" e não "0%" quando não há programa com treino: zero por cento diz que
        o aluno faltou; o traço diz que não há o que medir. Mesma regra do
        indicador do painel, e a conta vem da mesma função.
      */}
      <Celula>
        <span className="block font-semibold text-ink tabular-nums">
          {comoPorcentagem(aluno.aderencia)}
        </span>
        <span className="block text-[12px] text-ink-4">
          {aluno.aderencia === null ? "sem o que medir" : "nesta semana"}
        </span>
      </Celula>
    </tr>
  );
}

/**
 * O cabeçalho de coluna, ordenável quando recebe `campo`.
 *
 * `aria-sort` no `<th>` e não só a setinha: é ele que faz o leitor de tela
 * anunciar "ordenado crescente" ao entrar na tabela. Sem isso a ordem existe
 * para quem vê o ícone e para mais ninguém.
 */
function Coluna({
  children,
  campo,
  ordem,
  aoOrdenar,
}: {
  children: React.ReactNode;
  campo?: CampoDeOrdem;
  ordem?: Ordem;
  aoOrdenar?: (campo: CampoDeOrdem) => void;
}) {
  const ativa = Boolean(campo && ordem?.campo === campo);
  const Seta = ativa ? (ordem?.crescente ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th
      scope="col"
      aria-sort={
        !campo ? undefined : ativa ? (ordem?.crescente ? "ascending" : "descending") : "none"
      }
      className="px-5 py-3.5 text-[12.5px] font-normal text-ink-4"
    >
      {campo && aoOrdenar ? (
        <button
          type="button"
          onClick={() => aoOrdenar(campo)}
          className={cn(
            "inline-flex items-center gap-1 rounded-[5px] transition hover:text-ink",
            ativa && "text-ink",
          )}
        >
          {children}
          <Seta size={11} aria-hidden className={ativa ? "" : "opacity-60"} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function Celula({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3.5 text-[13.5px] text-ink-2">{children}</td>;
}

/**
 * Dois vazios diferentes de propósito: "ninguém entrou ainda" é o primeiro
 * acesso do personal e pede o caminho para convidar; "nada com esse filtro" é
 * uma busca sem resultado e pede só que ele desfaça o filtro. Um texto só
 * para os dois mandaria convidar aluno quem já tem trinta.
 */
function Vazio({ filtrando }: { filtrando: boolean }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface px-5 py-11 text-center">
      <p className="text-[14px] font-semibold text-ink">
        {filtrando ? "Nenhum aluno com esses filtros" : "Nenhum aluno ainda"}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-4">
        {filtrando
          ? "Tente outro nome, ou use “Limpar filtros”."
          : "Use “Convidar aluno” aqui em cima: você gera um link e manda pelo WhatsApp."}
      </p>
    </div>
  );
}

/**
 * "Hoje" / "Há 3 dias" — a coluna de último treino.
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
