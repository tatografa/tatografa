import Link from "next/link";
import { Ruler } from "lucide-react";

import { Badge, Card } from "@/components/ui";
import { formatarMedida } from "@/lib/domain/reavaliacao";
import type { AlunoDaLista } from "@/lib/queries/alunos";
import type { ReavaliacaoNaCarteira } from "@/lib/queries/reavaliacao";

import { BotaoCancelar, NovaReavaliacao } from "./acoes";

/**
 * A tela de reavaliações do personal (doc 06 §9).
 *
 * Sem acesso a banco, pelo mesmo motivo das outras: abre no navegador com props
 * fixas, que é o único jeito de conferir interface neste ambiente.
 *
 * **Pendentes no topo, e é o cabeçalho que as conta.** A pergunta que traz o
 * personal aqui é "de quem eu ainda estou esperando" — a lista das respondidas
 * ele consulta quando vai conversar com o aluno, não quando abre a página.
 */
export function TelaReavaliacoes({
  reavaliacoes,
  alunos,
}: {
  reavaliacoes: ReavaliacaoNaCarteira[];
  alunos: AlunoDaLista[];
}) {
  const pendentes = reavaliacoes.filter((r) => r.pendente);
  const respondidas = reavaliacoes.filter((r) => !r.pendente);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Reavaliações</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {pendentes.length === 0
              ? "Nenhuma esperando resposta"
              : `${pendentes.length} esperando resposta`}
          </h1>
        </div>
        <NovaReavaliacao alunos={alunos} />
      </header>

      {reavaliacoes.length === 0 ? (
        <Vazio temAluno={alunos.length > 0} />
      ) : (
        <div className="space-y-8">
          {pendentes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                Esperando resposta
              </h2>
              <ul className="space-y-2">
                {pendentes.map((r) => (
                  <li key={r.id}>
                    <Card className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge tone="atencao">Pendente</Badge>
                          <p className="truncate text-[15px] font-bold text-ink">
                            {r.aluno.nome}
                          </p>
                        </div>
                        <p className="text-[12.5px] text-ink-4">
                          Liberada {r.rotuloDaLiberacao}
                        </p>
                      </div>
                      <BotaoCancelar id={r.id} aluno={r.aluno.nome} />
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {respondidas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                Respondidas
              </h2>
              <ul className="space-y-2">
                {respondidas.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/painel/reavaliacoes/${r.aluno.id}`}
                      className="block rounded-card transition hover:bg-canvas-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <Card className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-[15px] font-bold text-ink">
                            {r.aluno.nome}
                          </p>
                          <p className="text-[12.5px] text-ink-4">
                            Respondida {r.rotuloDoEnvio} · {resumo(r)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[12.5px] font-semibold text-brand">
                          Ver comparação
                        </span>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A linha de resumo. Diz o que o aluno mandou sem abrir — peso, percentual e
 * quantas regiões ele mediu. "3 medidas" é o que separa uma resposta completa
 * de um formulário enviado às pressas.
 */
function resumo(r: ReavaliacaoNaCarteira): string {
  const partes: string[] = [];
  if (r.peso !== null) partes.push(`${formatarMedida(r.peso)} kg`);
  if (r.gordura !== null) partes.push(`${formatarMedida(r.gordura)}% de gordura`);

  const medidas = Object.keys(r.medidas).length;
  if (medidas > 0) partes.push(`${medidas} medida${medidas > 1 ? "s" : ""}`);

  const fotos = Object.values(r.fotos).filter(Boolean).length;
  if (fotos > 0) partes.push(`${fotos} foto${fotos > 1 ? "s" : ""}`);

  return partes.length ? partes.join(" · ") : "sem dados preenchidos";
}

function Vazio({ temAluno }: { temAluno: boolean }) {
  return (
    <Card size="lg" className="space-y-3 text-center">
      <Ruler size={22} className="mx-auto text-ink-4" aria-hidden />
      <p className="text-[15px] font-bold text-ink">Nenhuma reavaliação ainda</p>
      <p className="mx-auto max-w-md text-[13px] text-ink-4">
        {temAluno
          ? "Libere uma reavaliação e o aluno preenche as medidas e as fotos pelo app. Você recebe a comparação com a anterior."
          : "Convide um aluno primeiro. A reavaliação é liberada por aluno."}
      </p>
    </Card>
  );
}
