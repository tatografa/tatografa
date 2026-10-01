import { Flame, MessageCircle, Zap } from "lucide-react";

import { AcessoDoAluno } from "@/components/personal/acesso-do-aluno";
import { StatusDoAluno } from "@/components/personal/status-do-aluno";
import { diaLocal } from "@/lib/domain/fuso";
import { formatarNumero } from "@/lib/domain/historico";
import { iniciaisDe, primeiroNome } from "@/lib/domain/nome";
import { idadeEmAnos, metaDePeso } from "@/lib/domain/perfil";
import { formatarMedida } from "@/lib/domain/reavaliacao";
import { formatarTelefone, linkDoWhatsApp } from "@/lib/domain/telefone";
import type { AlunoDaFicha, ResumoDoAluno } from "@/lib/queries/alunos";
import { NIVEL, OBJETIVO, PERFIL_BIOLOGICO } from "@/lib/rotulos";

/**
 * A coluna de identidade da ficha do aluno (doc 06 §4).
 *
 * Reúne num cartão só o que era um parágrafo de dados separados por "·" no
 * cabeçalho: quem é, há quanto tempo treina, como falar com ele, e para onde
 * ele disse que quer ir. Densidade é bem-vinda aqui — o personal está sentado
 * no computador, e é esta a tela onde ele passa mais tempo depois do editor.
 *
 * **Nenhum campo desaparece quando está vazio.** "Não informado" ocupa a mesma
 * linha que o valor ocuparia: uma ficha que muda de altura conforme o aluno
 * preencheu ou não faz o personal procurar o telefone onde ele não está mais.
 * A exceção é o botão de WhatsApp, que sem número viraria link quebrado — é a
 * mesma regra do card do personal no app do aluno (15/09).
 */
export function IdentidadeDoAluno({
  aluno,
  resumo,
  pesoInicial,
  ehVoce,
}: {
  aluno: AlunoDaFicha;
  resumo: ResumoDoAluno;
  /**
   * O peso da reavaliação mais antiga do aluno. É de onde a barra da meta
   * parte — e não do peso de hoje, que faria a barra nascer cheia. Nulo quando
   * ele nunca respondeu uma reavaliação: aí o cadastro é o que existe.
   */
  pesoInicial: number | null;
  /** A linha do personal que treina a si mesmo: ele não pausa o próprio app. */
  ehVoce: boolean;
}) {
  const idade = idadeEmAnos(aluno.birth_date, diaLocal(new Date()));
  const whatsapp = linkDoWhatsApp(aluno.phone);

  const meta = metaDePeso(
    pesoInicial ?? numeroOuNulo(aluno.weight_kg),
    numeroOuNulo(aluno.weight_kg),
    numeroOuNulo(aluno.weight_goal_kg),
  );

  // O e-mail quebra depois do "@", e não no meio do domínio: numa coluna de
  // 230px ele não cabe numa linha, e "email.co / m" parece outro endereço.
  const [usuario, dominio] = aluno.email.split("@");
  const linhas: { rotulo: string; valor: React.ReactNode }[] = [
    {
      rotulo: "E-mail",
      valor: dominio ? (
        <>
          {usuario}@<wbr />
          {dominio}
        </>
      ) : (
        aluno.email
      ),
    },
    { rotulo: "Telefone", valor: aluno.phone ? formatarTelefone(aluno.phone) : "Não informado" },
    {
      rotulo: "Cidade/UF",
      valor: aluno.city ? [aluno.city, aluno.state].filter(Boolean).join(", ") : "Não informado",
    },
    { rotulo: "Idade", valor: idade === null ? "Não informado" : `${idade} anos` },
    { rotulo: "Altura", valor: aluno.height_cm === null ? "Não informado" : `${aluno.height_cm} cm` },
    {
      rotulo: "Peso atual",
      valor: aluno.weight_kg === null ? "Não informado" : `${formatarMedida(aluno.weight_kg)} kg`,
    },
    {
      rotulo: "Perfil biológico",
      valor: aluno.biological_profile
        ? PERFIL_BIOLOGICO[aluno.biological_profile]
        : "Não informado",
    },
    { rotulo: "Objetivo", valor: aluno.goal ? OBJETIVO[aluno.goal] : "Não informado" },
    { rotulo: "Nível", valor: aluno.experience_level ? NIVEL[aluno.experience_level] : "Não informado" },
    { rotulo: "Aluno desde", valor: mesEAno(aluno.created_at) },
  ];

  return (
    <>
      <section
        aria-label={`Dados de ${aluno.name}`}
        className="space-y-4 rounded-[12px] border border-border bg-surface p-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden
            className="flex size-[72px] items-center justify-center rounded-full bg-brand-soft text-[24px] font-bold text-brand"
          >
            {iniciaisDe(aluno.name)}
          </span>
          <h1 className="text-[18px] leading-tight font-bold tracking-[-0.01em] text-ink">
            {aluno.name}
          </h1>
          <StatusDoAluno status={aluno.status} />
        </div>

        {/* Um bloco com os dois números empilhados, como no protótipo: numa
            coluna de 250px, lado a lado cada um teria 100px para "sessões
            totais". */}
        <div className="divide-y divide-border-soft rounded-[10px] bg-canvas">
          <Numero
            Icone={Zap}
            valor={formatarNumero(resumo.sessoesTotais)}
            rotulo={resumo.sessoesTotais === 1 ? "Sessão total" : "Sessões totais"}
          />
          <Numero
            Icone={Flame}
            valor={`${resumo.diasSeguidos} ${resumo.diasSeguidos === 1 ? "dia" : "dias"}`}
            rotulo="Dias seguidos"
          />
        </div>

        {/* O valor quebra linha em vez de truncar: e-mail comprido numa coluna
            estreita é o dado que o personal veio copiar. */}
        <dl className="flex flex-col gap-[11px] border-t border-border-soft pt-[18px] text-left">
          {linhas.map((linha) => (
            <div key={linha.rotulo} className="flex items-baseline justify-between gap-2.5">
              <dt className="shrink-0 text-[12.5px] text-ink-4">{linha.rotulo}</dt>
              <dd className="min-w-0 text-right text-[13px] font-medium break-words text-ink-2">
                {linha.valor}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          O WhatsApp fecha a volta: o aluno já tinha o botão do personal desde
          15/09, e o personal não tinha o do aluno. Sem número o botão some — o
          resto do cartão continua, porque ele diz quem é o aluno, e sumir por
          falta de telefone faria a ficha mudar de forma por um dado opcional.
        */}
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-input border-[1.5px] border-border bg-surface text-[13px] font-bold text-ink transition hover:border-border-strong hover:bg-canvas-sunken"
          >
            <MessageCircle size={15} aria-hidden />
            Falar no WhatsApp
          </a>
        ) : null}

        {/* Convidado ainda não tem conta para pausar; o próprio personal não se
            pausa (trancaria o app em que ele treina). */}
        {!ehVoce && aluno.status !== "convidado" ? (
          <AcessoDoAluno
            alunoId={aluno.id}
            primeiroNome={primeiroNome(aluno.name)}
            pausado={aluno.status === "inativo"}
          />
        ) : null}
      </section>

      {meta ? <BarraDaMeta meta={meta} /> : null}
    </>
  );
}

function Numero({
  Icone,
  valor,
  rotulo,
}: {
  Icone: React.ComponentType<{ size?: number; "aria-hidden"?: boolean; className?: string }>;
  valor: string;
  rotulo: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[3px] px-1.5 py-[11px] text-center">
      <Icone size={16} aria-hidden className="text-brand" />
      <p className="text-[18px] leading-[1.1] font-bold text-ink tabular-nums">
        {valor}
      </p>
      <p className="text-[11px] text-ink-4">{rotulo}</p>
    </div>
  );
}

/**
 * A barra da meta de peso.
 *
 * **Sem verde e sem vermelho**, pela mesma razão da variação da medida na
 * reavaliação: perder dois quilos é vitória para um objetivo e prejuízo para
 * outro, e só o personal sabe qual foi o combinado. A barra diz quanto do
 * caminho foi andado; o julgamento vai na conversa.
 */
function BarraDaMeta({
  meta,
}: {
  meta: NonNullable<ReturnType<typeof metaDePeso>>;
}) {
  const chegou = meta.faltam < 0.05;
  return (
    <section className="rounded-[12px] border border-border bg-surface px-6 py-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="text-[14px] font-medium text-ink">Meta de peso</h2>
        <p className="text-[12px] text-ink-4">
          {chegou
            ? "Meta alcançada"
            : `Faltam ${formatarMedida(meta.faltam)} kg · ${Math.round(meta.progresso * 100)}% do caminho`}
        </p>
      </div>

      {/* O traço no fim é a meta: a barra anda até ele. */}
      <div
        role="img"
        aria-label={`De ${formatarMedida(meta.inicial)} para ${formatarMedida(meta.meta)} quilos. Hoje ${formatarMedida(meta.atual)}: ${Math.round(meta.progresso * 100)}% do caminho.`}
        className="relative mb-2 h-2.5 rounded-[6px] bg-canvas-sunken"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-[6px] bg-brand"
          style={{ width: `${meta.progresso * 100}%` }}
        />
        <div aria-hidden className="absolute -top-[3px] right-0 h-4 w-[2.5px] rounded-[2px] bg-ink-3" />
      </div>

      {/* Valor em cima e rótulo embaixo, cada um na sua ponta: numa coluna de
          250px os três em linha quebram no meio de "70 kg · meta". */}
      <div className="flex justify-between gap-2 text-[13px] tabular-nums">
        <span className="font-medium text-ink-2">
          {formatarMedida(meta.inicial)} kg
          <span className="block text-[12px] font-normal text-ink-5">inicial</span>
        </span>
        <span className="text-center font-semibold text-brand">
          {formatarMedida(meta.atual)} kg
          <span className="block text-[12px] font-normal text-ink-5">atual</span>
        </span>
        <span className="text-right font-medium text-ink-2">
          {formatarMedida(meta.meta)} kg
          <span className="block text-[12px] font-normal text-ink-5">meta</span>
        </span>
      </div>
    </section>
  );
}

/** O Postgres devolve `numeric` como texto em alguns caminhos; aqui é número. */
function numeroOuNulo(valor: number | null): number | null {
  return valor === null ? null : Number(valor);
}

/**
 * "Mai/2024" — mês e ano bastam para "aluno desde".
 *
 * Montado a partir do dia no fuso do produto, e não por `Intl` com `month:
 * "short"`: o formato curto do pt-BR devolve "mai. de 2024", com ponto e com
 * "de", que numa lista de rótulos curtos destoa de todas as outras linhas.
 */
function mesEAno(iso: string): string {
  const dia = diaLocal(iso);
  const mes = MESES[Number(dia.slice(5, 7)) - 1] ?? "";
  return `${mes}/${dia.slice(0, 4)}`;
}

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
