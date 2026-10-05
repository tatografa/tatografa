"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog } from "@/components/ui";
import { MAXIMO_DE_DIAS, volumeDaSemana } from "@/lib/domain/divisao";
import { primeiroNome } from "@/lib/domain/nome";
import { proximaLetraLivre } from "@/lib/domain/treino";
import type { TextosDoPainel } from "@/lib/i18n/painel";
import { forma, partesEmVolta, plural, preencher } from "@/lib/i18n/texto";
import type { DivisaoDeTreino as Divisao } from "@/lib/queries/divisao";
import { cn } from "@/lib/utils";

import {
  duplicarTreinoDaDivisao,
  excluirTreinoDaDivisao,
  salvarTreinoDaDivisao,
  type ResultadoDoTreino,
} from "./actions";
import { BuscaDeExercicios } from "./busca-de-exercicios";
import { CartaoDoTreino } from "./cartao-do-treino";
import { PainelLateral } from "./painel-lateral";
import {
  diaDoServidor,
  diaNovo,
  estaEmBranco,
  foiAlterado,
  itemNovo,
  paraSalvar,
  retrato,
  type DiaDoQuadro,
  type ItemDoQuadro,
} from "./quadro";

type ErrosDoCartao = Extract<ResultadoDoTreino, { ok: false }>;

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.4;

/**
 * A tela inteira da divisão de treino. Cliente, porque o quadro é edição ao
 * vivo de sete cartões — e sete formulários com `redirect` cada um fariam o
 * personal perder o que digitou no cartão ao lado a cada salvar.
 *
 * **Salvar é um botão só, no cabeçalho** ("Enviar para o aluno", como no
 * protótipo), e ele salva cartão por cartão. Não é uma transação: cada treino
 * é independente, e um cartão com erro não deve impedir os outros seis de
 * chegar ao aluno. O que falhou fica marcado no próprio cartão.
 */
export function DivisaoDeTreino({
  divisao,
  hoje,
  abrirNovo,
}: {
  divisao: Divisao;
  hoje: string;
  abrirNovo: boolean;
}) {
  const router = useRouter();
  const { t } = usePainel();
  const q = t.treinos.quadro;
  const aluno = divisao.aluno!;
  const programa = divisao.programa;

  const [dias, setDias] = useState<DiaDoQuadro[]>(() => divisao.treinos.map(diaDoServidor));
  const [erros, setErros] = useState<Record<string, ErrosDoCartao>>({});
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ tom: "ok" | "erro"; texto: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [buscaPara, setBuscaPara] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [remocao, setRemocao] = useState<{ dia: string; item: ItemDoQuadro } | null>(null);
  const [exclusao, setExclusao] = useState<{ dias: DiaDoQuadro[]; frequencia?: number } | null>(null);
  const [descarte, setDescarte] = useState<(() => void) | null>(null);

  const alterados = dias.filter(foiAlterado);
  const temAlteracao = alterados.length > 0;
  const volume = useMemo(
    () =>
      volumeDaSemana(
        dias.map((d) => d.itens.map((i) => ({ sets: Number(i.sets), reps: i.reps, grupo: i.grupo }))),
      ),
    [dias],
  );

  // Fechar a aba com cartão por salvar pergunta antes. É o aviso do navegador,
  // o único que ele deixa mostrar nessa hora.
  useEffect(() => {
    if (!temAlteracao) return;
    function antesDeSair(evento: BeforeUnloadEvent) {
      evento.preventDefault();
    }
    window.addEventListener("beforeunload", antesDeSair);
    return () => window.removeEventListener("beforeunload", antesDeSair);
  }, [temAlteracao]);

  function seguro(continuar: () => void) {
    if (!temAlteracao) continuar();
    else setDescarte(() => continuar);
  }

  function aoNavegar(href: string) {
    seguro(() => router.push(href));
  }

  function mudarDia(chave: string, atualizar: (dia: DiaDoQuadro) => DiaDoQuadro) {
    setDias((atuais) => atuais.map((d) => (d.chave === chave ? atualizar(d) : d)));
  }

  function adicionarDia() {
    setDias((atuais) => {
      if (atuais.length >= MAXIMO_DE_DIAS) return atuais;
      return [...atuais, diaNovo(proximaLetraLivre(atuais.map((d) => d.label)))];
    });
  }

  function mudarFrequencia(n: number) {
    if (n === dias.length) return;
    if (n > dias.length) {
      setDias((atuais) => {
        const novos = [...atuais];
        while (novos.length < n) novos.push(diaNovo(proximaLetraLivre(novos.map((d) => d.label))));
        return novos;
      });
      return;
    }
    // Diminuir tira os últimos. Cartão novo e vazio sai calado; o que tem
    // treino salvo ou conteúdo passa pela confirmação, que diz o que se perde.
    const sobrando = dias.slice(n);
    if (sobrando.every(estaEmBranco)) {
      setDias((atuais) => atuais.slice(0, n));
      return;
    }
    setExclusao({ dias: sobrando, frequencia: n });
  }

  function pedirRemocao(dia: DiaDoQuadro, item: ItemDoQuadro) {
    // Exercício que o aluno nunca fez sai direto; com histórico, confirma.
    if (item.seriesRegistradas === 0) {
      mudarDia(dia.chave, (d) => ({ ...d, itens: d.itens.filter((i) => i.chave !== item.chave) }));
      return;
    }
    setRemocao({ dia: dia.chave, item });
  }

  async function salvarTudo() {
    if (!programa) return;
    setSalvando(true);
    setAviso(null);
    const novosErros: Record<string, ErrosDoCartao> = {};
    let falhas = 0;

    // Um por vez, e não em paralelo: dois treinos novos ao mesmo tempo
    // disputariam a mesma "próxima posição" no programa.
    for (const dia of alterados) {
      let resultado: ResultadoDoTreino;
      try {
        resultado = await salvarTreinoDaDivisao(paraSalvar(programa.id, dia));
      } catch {
        resultado = { ok: false, erro: q.semConexao };
      }
      if (!resultado.ok) {
        novosErros[dia.chave] = resultado;
        falhas += 1;
        continue;
      }
      const { treinoId, label, idsDosExercicios } = resultado;
      // O cartão passa a carregar os ids que o banco deu às linhas novas: sem
      // isso, o próximo salvar as trataria como novas outra vez.
      mudarDia(dia.chave, (d) => {
        // Se o personal mexeu no cartão enquanto salvava, o retrato é o do
        // que foi enviado — e o cartão continua "Não salvo", que é a verdade.
        const enviado: DiaDoQuadro = {
          ...dia,
          id: treinoId,
          label,
          itens: dia.itens.map((item, i) => ({ ...item, id: idsDosExercicios[i] })),
        };
        const mesmoConteudo = retrato(d) === retrato(dia);
        return mesmoConteudo
          ? { ...enviado, salvo: retrato(enviado) }
          : {
              ...d,
              id: treinoId,
              itens: d.itens.map((item) => {
                const indice = dia.itens.findIndex((x) => x.chave === item.chave);
                return indice >= 0 ? { ...item, id: idsDosExercicios[indice] } : item;
              }),
              salvo: retrato(enviado),
            };
      });
    }

    setErros(novosErros);
    setSalvando(false);
    router.refresh();

    if (falhas === 0) {
      setAviso({
        tom: "ok",
        texto:
          programa.status === "ativo"
            ? preencher(q.salvosAtivo, { nome: primeiroNome(aluno.name) })
            : q.salvosArquivado,
      });
    } else {
      setAviso({
        tom: "erro",
        texto: plural(falhas, q.falhas),
      });
    }
  }

  async function confirmarExclusao() {
    if (!exclusao) return;
    const alvo = exclusao;
    setOcupado("exclusao");
    for (const dia of alvo.dias) {
      if (!dia.id) continue;
      const { ok, erro } = await excluirTreinoDaDivisao(dia.id);
      if (!ok) {
        setAviso({ tom: "erro", texto: erro ?? q.falhaExcluir });
        setOcupado(null);
        setExclusao(null);
        return;
      }
    }
    const chaves = new Set(alvo.dias.map((d) => d.chave));
    setDias((atuais) => atuais.filter((d) => !chaves.has(d.chave)));
    setOcupado(null);
    setExclusao(null);
    router.refresh();
  }

  async function duplicar(dia: DiaDoQuadro) {
    if (!programa || !dia.id) return;
    if (dias.length >= MAXIMO_DE_DIAS) {
      setAviso({ tom: "erro", texto: preencher(q.divisaoCheia, { n: MAXIMO_DE_DIAS }) });
      return;
    }
    setOcupado(dia.chave);
    const resultado = await duplicarTreinoDaDivisao(dia.id, programa.id);
    setOcupado(null);
    if (!resultado.ok) {
      setAviso({ tom: "erro", texto: resultado.erro });
      return;
    }
    setDias((atuais) => {
      const indice = atuais.findIndex((d) => d.chave === dia.chave);
      const novos = [...atuais];
      novos.splice(indice + 1, 0, diaDoServidor(resultado.treino));
      return novos;
    });
    router.refresh();
  }

  const noLimite = dias.length >= MAXIMO_DE_DIAS;
  const diaDaBusca = dias.find((d) => d.chave === buscaPara);

  return (
    <>
      <CabecalhoDaPagina
        titulo={t.treinos.titulo}
        subtitulo={preencher(t.treinos.subtituloDe, { nome: aluno.name })}
        acoes={
          programa ? (
            <>
              <span aria-live="polite" className="hidden text-[12.5px] text-ink-4 lg:inline">
                {salvando
                  ? t.comum.salvando
                  : temAlteracao
                    ? plural(alterados.length, q.alterados)
                    : q.tudoSalvo}
              </span>
              <Button size="sm" onClick={salvarTudo} disabled={!temAlteracao || salvando}>
                {salvando
                  ? t.comum.salvando
                  : programa.status === "ativo"
                    ? q.enviar
                    : q.rascunho}
              </Button>
            </>
          ) : undefined
        }
      />

      {aviso ? (
        <p
          role={aviso.tom === "erro" ? "alert" : "status"}
          className={cn(
            "mb-4 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold",
            aviso.tom === "ok"
              ? "border border-success/30 bg-success-soft text-success-dark"
              : "bg-danger-bg text-danger",
          )}
        >
          {aviso.texto}
        </p>
      ) : null}

      <div className="flex h-[calc(100dvh-172px)] min-h-[560px] gap-4">
        <PainelLateral
          alunos={divisao.alunos}
          aluno={aluno}
          programas={divisao.programas}
          programa={programa}
          dias={dias.map((d) => ({ chave: d.chave, label: d.label, nome: d.nome }))}
          volume={volume}
          hoje={hoje}
          abrirNovo={abrirNovo}
          aoNavegar={aoNavegar}
          seguro={seguro}
          aoRenomearDia={(chave, nome) => mudarDia(chave, (d) => ({ ...d, nome }))}
          aoFrequencia={mudarFrequencia}
          aoAdicionarDia={adicionarDia}
        />

        {/* ------------------------------------------------ o quadro --- */}
        <section
          aria-label={q.treinosDaDivisao}
          className="relative min-w-0 flex-1 overflow-hidden rounded-[12px] border border-border bg-surface"
        >
          {/* O pontilhado do protótipo, em `border`: fundo que diz "área de
              trabalho" sem competir com os cartões. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1.3px,transparent_1.3px)] [background-size:22px_22px]"
          />

          {programa ? (
            <>
              <button
                type="button"
                onClick={adicionarDia}
                disabled={noLimite}
                className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface px-[18px] py-2.5 text-[13px] font-semibold text-brand shadow-cartao transition hover:bg-brand-soft disabled:bg-canvas disabled:text-ink-5"
              >
                <Plus size={16} aria-hidden />
                {noLimite ? preencher(q.limite, { n: MAXIMO_DE_DIAS }) : q.novoTreino}
              </button>

              {programa.status !== "ativo" ? (
                <p className="absolute top-5 left-5 z-10 rounded-full bg-warning-bg px-3 py-1 text-[11.5px] font-semibold text-warning">
                  {q.arquivado}
                </p>
              ) : null}

              <div className="absolute inset-0 overflow-auto px-6 pt-[70px] pb-20">
                {dias.length ? (
                  // `zoom` e não `transform: scale`: o scale encolhe o desenho
                  // mas mantém a caixa do tamanho original, e a rolagem
                  // continuaria do tamanho de 100% com metade vazia.
                  <div className="flex w-max items-start gap-5" style={{ zoom }}>
                    {dias.map((dia) => (
                      <CartaoDoTreino
                        key={dia.chave}
                        dia={dia}
                        erros={erros[dia.chave]}
                        ocupado={ocupado === dia.chave || salvando}
                        aoMudar={(atualizar) => mudarDia(dia.chave, atualizar)}
                        aoAdicionarExercicio={() => setBuscaPara(dia.chave)}
                        aoPedirRemocao={(item) => pedirRemocao(dia, item)}
                        aoDuplicar={() => duplicar(dia)}
                        aoExcluir={() =>
                          estaEmBranco(dia)
                            ? setDias((atuais) => atuais.filter((d) => d.chave !== dia.chave))
                            : setExclusao({ dias: [dia] })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="relative mx-auto mt-10 max-w-sm rounded-[12px] border border-border bg-surface p-5 text-center shadow-cartao">
                    <p className="text-[14px] font-semibold text-ink">{q.nenhumTitulo}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                      <ComDestaque frase={q.nenhum} chave="novo" destaque={q.novoTreino} />
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-[8px] border border-border bg-surface p-[5px] shadow-cartao">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.1).toFixed(2)))}
                  disabled={zoom <= ZOOM_MIN}
                  aria-label={q.menosZoom}
                  className="flex size-[30px] items-center justify-center rounded-[8px] text-ink-3 transition hover:bg-canvas disabled:opacity-35"
                >
                  <Minus size={15} aria-hidden />
                </button>
                <span aria-live="polite" className="min-w-[38px] text-center text-[12px] font-medium text-ink-3 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.1).toFixed(2)))}
                  disabled={zoom >= ZOOM_MAX}
                  aria-label={q.maisZoom}
                  className="flex size-[30px] items-center justify-center rounded-[8px] text-ink-3 transition hover:bg-canvas disabled:opacity-35"
                >
                  <Plus size={15} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="border-l border-border py-1 pr-2.5 pl-[11px] text-[12px] font-medium text-ink-3 transition hover:text-ink"
                >
                  {q.redefinir}
                </button>
              </div>
            </>
          ) : (
            <div className="relative mx-auto mt-16 max-w-sm rounded-[12px] border border-border bg-surface p-5 text-center shadow-cartao">
              <p className="text-[14px] font-semibold text-ink">
                {preencher(q.semProgramaTitulo, { nome: primeiroNome(aluno.name) })}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                <ComDestaque
                  frase={q.semPrograma}
                  chave="novo"
                  destaque={t.treinos.macro.abas.novo}
                />
              </p>
            </div>
          )}
        </section>
      </div>

      <BuscaDeExercicios
        aberto={buscaPara !== null}
        aoFechar={() => setBuscaPara(null)}
        aoEscolher={(exercicio) => {
          if (!buscaPara) return;
          mudarDia(buscaPara, (d) => ({ ...d, itens: [...d.itens, itemNovo(exercicio)] }));
        }}
        titulo={
          diaDaBusca
            ? preencher(q.adicionarA, {
                nome: diaDaBusca.nome || preencher(t.comum.treino, { label: diaDaBusca.label }),
              })
            : undefined
        }
      />

      <Dialog
        aberto={remocao !== null}
        aoFechar={() => setRemocao(null)}
        titulo={q.remocaoTitulo}
        descricao={
          remocao
            ? preencher(forma(remocao.item.seriesRegistradas, q.remocao), {
                nome: remocao.item.nome,
                n: remocao.item.seriesRegistradas,
              })
            : undefined
        }
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" block onClick={() => setRemocao(null)}>
            {t.comum.manter}
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              if (remocao) {
                mudarDia(remocao.dia, (d) => ({
                  ...d,
                  itens: d.itens.filter((i) => i.chave !== remocao.item.chave),
                }));
              }
              setRemocao(null);
            }}
          >
            {q.removerMesmoAssim}
          </Button>
        </div>
      </Dialog>

      <Dialog
        aberto={exclusao !== null}
        aoFechar={() => setExclusao(null)}
        titulo={tituloDaExclusao(exclusao?.dias ?? [], t)}
        descricao={exclusao ? textoDaExclusao(exclusao.dias, q) : undefined}
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" block onClick={() => setExclusao(null)} disabled={ocupado === "exclusao"}>
            {t.comum.cancelar}
          </Button>
          <Button variant="danger" block onClick={confirmarExclusao} disabled={ocupado === "exclusao"}>
            {ocupado === "exclusao" ? q.excluindo : q.excluir}
          </Button>
        </div>
      </Dialog>

      <Dialog
        aberto={descarte !== null}
        aoFechar={() => setDescarte(null)}
        titulo={q.descarteTitulo}
        descricao={plural(alterados.length, q.descarte)}
      >
        <div className="flex gap-2.5">
          <Button variant="secondary" block onClick={() => setDescarte(null)}>
            {q.voltarESalvar}
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              const continuar = descarte;
              setDescarte(null);
              continuar?.();
            }}
          >
            {q.descartar}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

/**
 * Conta só o que tem conteúdo: ao passar de 5x para 3x com um cartão em branco
 * no fim, "Excluir 2 treinos?" contaria como treino um espaço que nunca foi.
 */
function tituloDaExclusao(dias: DiaDoQuadro[], t: TextosDoPainel): string {
  const q = t.treinos.quadro;
  const reais = dias.filter((d) => !estaEmBranco(d));
  if (reais.length > 1) return preencher(q.excluirVarios, { n: reais.length });
  const dia = reais[0] ?? dias[0];
  return dia
    ? preencher(q.excluirUm, { nome: dia.nome || preencher(t.comum.treino, { label: dia.label }) })
    : q.excluirTreino;
}

/** A frase com uma palavra em negrito no meio — o nome do botão que ela cita. */
function ComDestaque({ frase, chave, destaque }: { frase: string; chave: string; destaque: string }) {
  const [antes, depois] = partesEmVolta(frase, chave);
  return (
    <>
      {antes}
      <strong>{destaque}</strong>
      {depois}
    </>
  );
}

/**
 * A frase da exclusão diz o que some de verdade: um treino salvo leva a
 * prescrição e, por cascata, cada série que o aluno registrou nele. Um cartão
 * que nunca foi salvo só some da tela.
 */
function textoDaExclusao(dias: DiaDoQuadro[], q: TextosDoPainel["treinos"]["quadro"]): string {
  const salvos = dias.filter((d) => d.id);
  const series = salvos.reduce(
    (total, d) => total + d.itens.reduce((s, i) => s + i.seriesRegistradas, 0),
    0,
  );
  if (!salvos.length) return q.naoSalvos;
  // Concordância: "a prescrição some", "a prescrição e as séries somem" — por
  // isso são frases inteiras, e não um pedaço acrescentado.
  return series > 0 ? plural(series, q.prescricaoESeries) : q.prescricaoSome;
}
