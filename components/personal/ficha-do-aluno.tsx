import { CalendarPlus, ChevronRight } from "lucide-react";
import Link from "next/link";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { CartaoDeAtividade } from "@/components/personal/cartao-de-atividade";
import { IdentidadeDoAluno } from "@/components/personal/identidade-do-aluno";
import { ObservacoesDoAluno } from "@/components/personal/observacoes-do-aluno";
import { ProgramaAtual } from "@/components/personal/programa-atual";
import { Comparacao } from "@/components/reavaliacao/comparacao";
import { Badge, Card } from "@/components/ui";
import { montarAtividade } from "@/lib/domain/atividade";
import { duracaoCurta, formatarNumero, rotuloDoDia } from "@/lib/domain/historico";
import { iniciaisDe, primeiroNome } from "@/lib/domain/nome";
import type { AlunoDaFicha, ResumoDoAluno } from "@/lib/queries/alunos";
import type { TreinoDaDivisao } from "@/lib/queries/divisao";
import type { SessaoDoHistorico } from "@/lib/queries/historico";
import { LIMITE_DO_HISTORICO } from "@/lib/queries/historico";
import type { Macrotreino } from "@/lib/queries/macrotreinos";
import type { Observacao } from "@/lib/queries/observacoes";
import type { ExercicioComProgresso } from "@/lib/queries/progresso";
import { comparar, type Reavaliacao } from "@/lib/queries/reavaliacao";
import type { PostDaCarteira, TreinoDoPostNoPainel } from "@/lib/queries/social";

export type FichaDoAlunoProps = {
  aluno: AlunoDaFicha;
  programa: Macrotreino | null;
  /** A semana do programa, contada no servidor. */
  semana: number | null;
  /** Os treinos do programa ativo, com a prescrição. */
  treinos: TreinoDaDivisao[];
  sessoes: SessaoDoHistorico[];
  /** As publicações do aluno, com a conversa. */
  posts: PostDaCarteira[];
  /**
   * O bloco escuro das sessões que não viraram post, por id de sessão. As que
   * viraram trazem o próprio, dentro do post.
   */
  treinosDasSessoes: Record<string, TreinoDoPostNoPainel>;
  exercicios: ExercicioComProgresso[];
  /**
   * As reavaliações do aluno, da mais recente para a mais antiga — **sem as
   * URLs das fotos**. Ver a foto do corpo de alguém exige intenção: aqui a
   * ficha mostra os números, e a tela de comparação mostra as fotos, onde ele
   * foi de propósito.
   */
  reavaliacoes: Reavaliacao[];
  /**
   * As anotações do personal sobre este aluno. Nunca chegam a nenhuma tela do
   * aluno: `trainer_notes` não tem policy de select para ele (migration 0028).
   */
  observacoes: Observacao[];
  /** Sessões totais e dias seguidos — os dois números do topo da ficha. */
  resumo: ResumoDoAluno;
  /** Os controles do post são componentes cliente com Server Action; a página os monta. */
  curtir: (post: PostDaCarteira) => React.ReactNode;
  responder: (post: PostDaCarteira) => React.ReactNode;
  /** Para os rótulos "Hoje"/"Ontem"; parâmetro para a tela abrir com data fixa. */
  /** A linha do personal que treina a si mesmo (13/09): não oferece pausar. */
  ehVoce?: boolean;
  agora?: Date;
};

/**
 * O perfil do aluno no painel, no layout do protótipo (27/09): três colunas —
 * quem é o aluno à esquerda, a atividade dele no meio, o programa à direita.
 *
 * Sem nenhum acesso a banco, como as outras telas: é o que permite conferir no
 * navegador com props fixas.
 *
 * **O que a ficha tinha e o protótipo não desenha, e onde foi parar.** A
 * evolução por exercício virou a aba "Gráfico" do programa. O histórico de
 * sessões virou a própria coluna de atividade — cada treino é um cartão, com a
 * foto quando houve post — e o que passa de quinze cartões continua numa lista
 * compacta embaixo, porque é o registro que o personal vem conferir. As
 * anotações privadas e a última reavaliação ficam na coluna da direita, abaixo
 * do programa: são o trabalho do personal sobre o aluno, e o programa é o
 * primeiro deles.
 *
 * Colunas pela largura do conteúdo, não da janela (container query, como o
 * dashboard): com a navegação aberta ou recolhida a largura útil muda 184px.
 * Abaixo de três colunas o programa sobe para o lado da identidade e a
 * atividade vai embaixo dele; numa coluna só, tudo empilha.
 */
export function FichaDoAluno({
  aluno,
  programa,
  semana,
  treinos,
  sessoes,
  posts,
  treinosDasSessoes,
  exercicios,
  reavaliacoes,
  observacoes,
  resumo,
  curtir,
  responder,
  ehVoce = false,
  agora = new Date(),
}: FichaDoAlunoProps) {
  /*
   * O peso de onde a barra da meta parte: a reavaliação mais **antiga** que
   * trouxe peso. `reavaliacoes` vem da mais recente para a mais antiga, então
   * é o último da lista que serve — e é de propósito que não há consulta nova
   * para isto: o dado já está na tela.
   */
  const pesoInicial = [...reavaliacoes].reverse().find((r) => r.peso !== null)?.peso ?? null;

  const { itens, sessoesDeFora } = montarAtividade(sessoes, posts);
  const autor = { id: aluno.id, nome: aluno.name, iniciais: iniciaisDe(aluno.name) };
  const nome = primeiroNome(aluno.name);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Perfil do aluno"
        voltar={{ href: "/painel/alunos", rotulo: "Voltar para alunos" }}
        acoes={
          /*
            A ação primária desta tela é agendar sessão (doc 06 e o protótipo).
            A agenda abre com o aluno já escolhido: ela lê `?aluno=` desde 18/09.
          */
          <Link
            href={`/painel/agenda?aluno=${aluno.id}`}
            className="inline-flex min-h-9 items-center gap-2 rounded-input bg-brand px-3.5 text-[13px] font-semibold text-white shadow-botao transition hover:bg-brand-hover"
          >
            <CalendarPlus size={15} aria-hidden />
            Agendar sessão
          </Link>
        }
      />

      <div className="@container">
        <div className="grid items-start gap-4 @min-[680px]:grid-cols-[220px_minmax(0,1fr)] @min-[680px]:grid-rows-[auto_1fr] @min-[1040px]:grid-cols-[minmax(230px,26%)_minmax(0,1fr)_minmax(300px,37%)]">
          {/* ------------------------------------------- quem é o aluno --- */}
          <div className="flex min-w-0 flex-col gap-4 @min-[680px]:row-span-2">
            <IdentidadeDoAluno
              aluno={aluno}
              resumo={resumo}
              pesoInicial={pesoInicial}
              ehVoce={ehVoce}
            />
          </div>

          {/* -------------------------------------------------- programa --- */}
          <div className="flex min-w-0 flex-col gap-4 @min-[680px]:col-start-2 @min-[680px]:row-start-1 @min-[1040px]:col-start-3 @min-[1040px]:row-span-2">
            <ProgramaAtual
              programa={programa}
              semana={semana}
              treinos={treinos}
              exercicios={exercicios}
              alunoId={aluno.id}
            />
            <Reavaliacoes reavaliacoes={reavaliacoes} alunoId={aluno.id} />
            <ObservacoesDoAluno alunoId={aluno.id} observacoes={observacoes} nome={nome} />
          </div>

          {/* -------------------------------------------------- atividade --- */}
          <section
            aria-label={`Atividade de ${aluno.name}`}
            className="flex min-w-0 flex-col gap-3.5 @min-[680px]:col-start-2 @min-[680px]:row-start-2 @min-[1040px]:row-start-1 @min-[1040px]:row-span-2"
          >
            <div className="rounded-[12px] bg-gradient-to-br from-dark-bg to-dark-elev px-5 py-[18px] text-dark-text">
              <p className="text-[15px] font-extrabold tracking-[-0.01em]">Reps Club</p>
              <p className="mt-0.5 text-[12.5px] font-medium text-dark-text-2">
                Atividade de {aluno.name}
                {sessoes.length
                  ? ` · ${sessoes.length >= LIMITE_DO_HISTORICO ? `${LIMITE_DO_HISTORICO}+` : sessoes.length} ${sessoes.length === 1 ? "treino" : "treinos"}`
                  : ""}
              </p>
            </div>

            {itens.length === 0 ? (
              <div className="rounded-[12px] border border-border bg-surface px-5 py-11 text-center">
                <p className="text-[14px] font-semibold text-ink">{nome} ainda não treinou</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-4">
                  Cada treino concluído aparece aqui com carga e repetições — e a foto, quando
                  houver publicação.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {itens.map((item) => (
                  <li key={item.chave}>
                    {item.tipo === "post" ? (
                      <CartaoDeAtividade
                        rotulo={`Post de ${aluno.name}, ${item.post.rotuloDoDia}`}
                        autor={autor}
                        rotuloDoDia={item.post.rotuloDoDia}
                        visibilidade={item.post.visibilidade}
                        fotoUrl={item.post.fotoUrl}
                        legenda={item.post.legenda}
                        treino={item.post.treino}
                        rotuloDosComentarios
                        conversa={{
                          curtir: curtir(item.post),
                          comentarios: item.post.comentarios,
                          responder: responder(item.post),
                        }}
                      />
                    ) : (
                      <CartaoDeAtividade
                        rotulo={`Treino de ${aluno.name}, ${rotuloDoDia(item.sessao.finished_at, agora)}`}
                        autor={autor}
                        rotuloDoDia={rotuloDoDia(item.sessao.finished_at, agora)}
                        visibilidade={item.post?.visibilidade ?? null}
                        fotoUrl={item.post?.fotoUrl ?? null}
                        legenda={item.post?.legenda ?? null}
                        treino={
                          item.post?.treino ??
                          treinosDasSessoes[item.sessao.id] ??
                          (item.sessao.treino
                            ? {
                                rotulo: item.sessao.treino.label,
                                nome: item.sessao.treino.name,
                                exercicios: [],
                              }
                            : null)
                        }
                        rodape={<RodapeDaSessao sessao={item.sessao} alunoId={aluno.id} />}
                        rotuloDosComentarios
                        conversa={
                          item.post
                            ? {
                                curtir: curtir(item.post),
                                comentarios: item.post.comentarios,
                                responder: responder(item.post),
                              }
                            : null
                        }
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {sessoesDeFora.length ? (
              <SessoesAnteriores sessoes={sessoesDeFora} alunoId={aluno.id} agora={agora} />
            ) : null}

            {/* Corte silencioso faria o personal achar que o aluno treinou menos. */}
            {sessoes.length >= LIMITE_DO_HISTORICO ? (
              <p className="text-[12px] text-ink-5">
                Mostrando os {LIMITE_DO_HISTORICO} treinos mais recentes.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

/**
 * O que o cartão da sessão acrescenta ao treino: quanto durou, quantas séries
 * da prescrição, o volume, a observação do aluno e o caminho para cada série.
 * É a informação que o histórico antigo mostrava numa linha, e que o cartão
 * do protótipo não tem.
 */
function RodapeDaSessao({ sessao, alunoId }: { sessao: SessaoDoHistorico; alunoId: string }) {
  return (
    <div className="space-y-2">
      {sessao.notes ? (
        <p className="rounded-[10px] bg-canvas px-3 py-2 text-[12.5px] leading-relaxed text-ink-2">
          <span className="font-semibold text-ink">Observação: </span>
          {sessao.notes}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="flex flex-wrap gap-x-3 text-[12.5px] text-ink-4 tabular-nums">
          <span>{duracaoCurta(sessao.duration_seconds)}</span>
          <span>
            {sessao.series_prescritas > 0
              ? `${sessao.series_feitas} de ${sessao.series_prescritas} séries`
              : `${sessao.series_feitas} séries`}
          </span>
          <span>{formatarNumero(sessao.volume_kg)} kg</span>
        </p>
        <Link
          href={`/painel/alunos/${alunoId}/sessoes/${sessao.id}`}
          className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-brand transition hover:text-brand-hover"
        >
          Série a série
          <ChevronRight size={13} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function SessoesAnteriores({
  sessoes,
  alunoId,
  agora,
}: {
  sessoes: SessaoDoHistorico[];
  alunoId: string;
  agora: Date;
}) {
  return (
    <section className="rounded-[12px] border border-border bg-surface">
      <h2 className="border-b border-border-soft px-[18px] py-3.5 text-[14px] font-medium text-ink">
        Treinos anteriores
      </h2>
      <ul className="divide-y divide-border-soft">
        {sessoes.map((sessao) => (
          <li key={sessao.id}>
            <Link
              href={`/painel/alunos/${alunoId}/sessoes/${sessao.id}`}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-[18px] py-2.5 transition hover:bg-canvas"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">
                  {sessao.treino
                    ? `Treino ${sessao.treino.label} · ${sessao.treino.name}`
                    : "Treino removido"}
                </span>
                <span className="block text-[12px] text-ink-4 first-letter:uppercase">
                  {rotuloDoDia(sessao.finished_at, agora)}
                </span>
              </span>
              <span className="shrink-0 text-[12px] text-ink-4 tabular-nums">
                {sessao.series_feitas} séries · {formatarNumero(sessao.volume_kg)} kg
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * "Medidas e reavaliações, com comparação" (doc 06 §4).
 *
 * A ficha mostra **a última**, comparada com a anterior. O histórico inteiro
 * fica em `/painel/reavaliacoes/<aluno>`: são N quadros iguais, e empilhá-los
 * aqui empurraria o resto da coluna para fora da tela.
 */
function Reavaliacoes({
  reavaliacoes,
  alunoId,
}: {
  reavaliacoes: Reavaliacao[];
  alunoId: string;
}) {
  const aberta = reavaliacoes.find((r) => r.enviadaEm === null) ?? null;
  const enviadas = reavaliacoes.filter((r) => r.enviadaEm !== null);
  const [ultima, penultima] = enviadas;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow text-ink-4">Reavaliações</h2>
        {enviadas.length > 0 && (
          <Link
            href={`/painel/reavaliacoes/${alunoId}`}
            className="text-[12.5px] font-semibold text-brand transition hover:underline"
          >
            {enviadas.length > 1 ? `Ver as ${enviadas.length}` : "Abrir"}
            {ultima?.temFoto ? " · com fotos" : ""}
          </Link>
        )}
      </div>

      {aberta && (
        <Card className="flex flex-wrap items-center gap-2.5">
          <Badge tone="atencao">Pendente</Badge>
          <p className="text-[13px] text-ink-3">
            Liberada {aberta.rotuloDaLiberacao} · esperando a resposta do aluno.
          </p>
        </Card>
      )}

      {ultima ? (
        <div className="space-y-2.5">
          <p className="text-[12.5px] text-ink-4">
            Respondida {ultima.rotuloDoEnvio}
            {penultima ? ` · comparada com ${penultima.rotuloDoEnvio}` : ""}
          </p>
          <Comparacao
            atual={ultima}
            anterior={penultima ?? null}
            linhas={comparar(ultima, penultima ?? null)}
          />
        </div>
      ) : (
        !aberta && (
          <Card>
            <p className="text-[13px] text-ink-4">
              Nenhuma reavaliação ainda. Libere uma na{" "}
              <Link href="/painel/agenda" className="font-semibold text-brand hover:underline">
                Agenda
              </Link>
              .
            </p>
          </Card>
        )
      )}
    </section>
  );
}
