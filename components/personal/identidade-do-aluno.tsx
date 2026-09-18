import { Flame, MessageCircle, Zap } from "lucide-react";

import { Badge } from "@/components/ui";
import { diaLocal } from "@/lib/domain/fuso";
import { formatarNumero } from "@/lib/domain/historico";
import { iniciaisDe } from "@/lib/domain/nome";
import { idadeEmAnos, metaDePeso } from "@/lib/domain/perfil";
import { formatarMedida } from "@/lib/domain/reavaliacao";
import { formatarTelefone, linkDoWhatsApp } from "@/lib/domain/telefone";
import type { AlunoDaFicha, ResumoDoAluno } from "@/lib/queries/alunos";
import { NIVEL, OBJETIVO, PERFIL_BIOLOGICO, STATUS_DO_ALUNO } from "@/lib/rotulos";

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
}: {
  aluno: AlunoDaFicha;
  resumo: ResumoDoAluno;
  /**
   * O peso da reavaliação mais antiga do aluno. É de onde a barra da meta
   * parte — e não do peso de hoje, que faria a barra nascer cheia. Nulo quando
   * ele nunca respondeu uma reavaliação: aí o cadastro é o que existe.
   */
  pesoInicial: number | null;
}) {
  const idade = idadeEmAnos(aluno.birth_date, diaLocal(new Date()));
  const whatsapp = linkDoWhatsApp(aluno.phone);

  const meta = metaDePeso(
    pesoInicial ?? numeroOuNulo(aluno.weight_kg),
    numeroOuNulo(aluno.weight_kg),
    numeroOuNulo(aluno.weight_goal_kg),
  );

  const linhas: { rotulo: string; valor: string }[] = [
    { rotulo: "E-mail", valor: aluno.email },
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
    <aside className="space-y-4 rounded-card border border-border bg-surface p-5">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span
          aria-hidden
          className="flex size-[68px] items-center justify-center rounded-full bg-canvas-sunken text-[22px] font-extrabold text-ink-2"
        >
          {iniciaisDe(aluno.name)}
        </span>
        <h1 className="text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
          {aluno.name}
        </h1>
        <Badge tone={aluno.status === "ativo" ? "sucesso" : "neutro"}>
          {STATUS_DO_ALUNO[aluno.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Numero
          Icone={Zap}
          valor={formatarNumero(resumo.sessoesTotais)}
          rotulo={resumo.sessoesTotais === 1 ? "sessão total" : "sessões totais"}
        />
        <Numero
          Icone={Flame}
          valor={String(resumo.diasSeguidos)}
          rotulo={resumo.diasSeguidos === 1 ? "dia seguido" : "dias seguidos"}
        />
      </div>

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

      <dl className="divide-y divide-border-soft border-t border-border-soft">
        {linhas.map((linha) => (
          <div key={linha.rotulo} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="shrink-0 text-[12.5px] text-ink-4">{linha.rotulo}</dt>
            <dd className="min-w-0 truncate text-right text-[12.5px] font-semibold text-ink">
              {linha.valor}
            </dd>
          </div>
        ))}
      </dl>

      {meta ? <BarraDaMeta meta={meta} /> : null}
    </aside>
  );
}

function Numero({
  Icone,
  valor,
  rotulo,
}: {
  Icone: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  valor: string;
  rotulo: string;
}) {
  return (
    <div className="space-y-0.5 rounded-card bg-canvas-sunken px-3 py-3 text-center">
      <Icone size={15} aria-hidden />
      <p className="text-[19px] font-extrabold leading-none tracking-[-0.02em] text-ink tabular-nums">
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
    <section className="space-y-2 border-t border-border-soft pt-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="eyebrow text-ink-4">Meta de peso</h2>
        <p className="text-[11.5px] text-ink-4">
          {chegou
            ? "Meta alcançada"
            : `Faltam ${formatarMedida(meta.faltam)} kg · ${Math.round(meta.progresso * 100)}% do caminho`}
        </p>
      </div>

      <div
        role="img"
        aria-label={`De ${formatarMedida(meta.inicial)} para ${formatarMedida(meta.meta)} quilos. Hoje ${formatarMedida(meta.atual)}: ${Math.round(meta.progresso * 100)}% do caminho.`}
        className="h-2 overflow-hidden rounded-full bg-canvas-sunken"
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${meta.progresso * 100}%` }}
        />
      </div>

      <div className="flex justify-between font-mono text-[10.5px] text-ink-5 tabular-nums">
        <span>{formatarMedida(meta.inicial)} kg · inicial</span>
        <span className="font-bold text-ink">{formatarMedida(meta.atual)} kg · atual</span>
        <span>{formatarMedida(meta.meta)} kg · meta</span>
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
