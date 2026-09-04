import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge, Button, Card, classesDeBotao } from "@/components/ui";
import { listarTreinosPorAluno } from "@/lib/queries/treinos";

export const metadata: Metadata = { title: "Treinos" };

export default async function TreinosPage() {
  const porAluno = await listarTreinosPorAluno();
  const total = porAluno.reduce((soma, linha) => soma + linha.treinos.length, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Treinos</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {total === 0 ? "Nenhum treino ainda" : `${total} treino${total > 1 ? "s" : ""}`}
          </h1>
        </div>
        {/* Treino novo nasce dentro de um programa, então o botão leva à tela
            que sabe de qual: um "Novo treino" solto voltaria a perguntar aluno
            e programa aqui, que é exatamente o que este card tirou do editor. */}
        {porAluno.length > 0 && (
          <Link href="/painel/macrotreinos" className={classesDeBotao()}>
            <Plus size={16} aria-hidden /> Novo treino
          </Link>
        )}
      </header>

      {porAluno.length === 0 ? (
        <SemAluno />
      ) : (
        <div className="space-y-8">
          {porAluno.map(({ aluno, macrotreino, treinos }) => (
            <section key={aluno.id} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                  {aluno.name}
                </h2>
                <p className="text-[12.5px] text-ink-4">
                  {macrotreino
                    ? `${macrotreino.name} · ${macrotreino.total_weeks} semanas`
                    : "Sem programa ativo"}
                </p>
              </div>

              {/* Só os treinos do programa ATIVO aparecem aqui (dívida do M1):
                  os do programa arquivado continuam salvos e se consultam pela
                  tela de macrotreinos. */}
              {!macrotreino ? (
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13.5px] text-ink-3">
                    {aluno.name.split(" ")[0]} está sem programa ativo — e sem treino
                    no app.
                  </p>
                  <Link
                    href={`/painel/macrotreinos/novo?aluno=${aluno.id}`}
                    className={classesDeBotao({ size: "sm", variant: "secondary" })}
                  >
                    Criar programa
                  </Link>
                </Card>
              ) : treinos.length === 0 ? (
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13.5px] text-ink-3">
                    {aluno.name.split(" ")[0]} ainda não tem treino montado.
                  </p>
                  <Link
                    href={`/painel/treinos/novo?programa=${macrotreino.id}`}
                    className={classesDeBotao({ size: "sm", variant: "secondary" })}
                  >
                    Montar treino
                  </Link>
                </Card>
              ) : (
                <ul className="space-y-2">
                  {treinos.map((treino) => (
                    <li key={treino.id}>
                      <Link
                        href={`/painel/treinos/${treino.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3.5 transition hover:border-border-strong"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Badge tone="brand">{treino.label}</Badge>
                          <div className="min-w-0">
                            <p className="truncate text-[14.5px] font-semibold text-ink">
                              {treino.name}
                            </p>
                            <p className="truncate text-[12.5px] text-ink-4">
                              {treino.total_exercicios} exercícios ·{" "}
                              {treino.total_series} séries · ~{treino.duracao_min} min
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SemAluno() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Convide um aluno primeiro
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Todo treino pertence a um aluno. Gere um convite no painel e volte aqui
          quando ele tiver entrado.
        </p>
      </div>
      <Link href="/painel">
        <Button>Convidar aluno</Button>
      </Link>
    </Card>
  );
}
