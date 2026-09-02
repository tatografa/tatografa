import type { Metadata } from "next";
import Link from "next/link";

import { ListaDeAlunos } from "@/components/personal/lista-de-alunos";
import { Button, Card } from "@/components/ui";
import { requireTrainer } from "@/lib/auth/session";
import { listarAlunos, listarConvitesPendentes } from "@/lib/queries/alunos";

import { cancelarConvite } from "./actions";
import { ConvidarAluno } from "./convidar-aluno";

export const metadata: Metadata = { title: "Painel" };

export default async function PainelPage() {
  const { trainer } = await requireTrainer();
  const [alunos, convites] = await Promise.all([
    listarAlunos(),
    listarConvitesPendentes(),
  ]);

  const primeiroNome = trainer.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Painel do personal</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            Olá, {primeiroNome}.
          </h1>
        </div>
        <ConvidarAluno />
      </header>

      {alunos.length === 0 && convites.length === 0 ? (
        <VazioSemAluno />
      ) : (
        <div className="space-y-8">
          {convites.length > 0 && (
            <section className="space-y-3">
              <h2 className="eyebrow text-ink-4">
                Convites pendentes · {convites.length}
              </h2>
              <ul className="space-y-2">
                {convites.map((convite) => (
                  <li
                    key={convite.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">
                        {convite.name}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-4">
                        {convite.email} · expira em{" "}
                        {diasAte(convite.expires_at)}
                      </p>
                    </div>
                    <form action={cancelarConvite}>
                      <input type="hidden" name="id" value={convite.id} />
                      <button
                        type="submit"
                        className="text-[12.5px] font-semibold text-ink-4 transition hover:text-danger"
                      >
                        Cancelar
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="eyebrow text-ink-4">Alunos · {alunos.length}</h2>

            <ListaDeAlunos alunos={alunos} />
          </section>
        </div>
      )}
    </div>
  );
}

function VazioSemAluno() {
  return (
    <Card size="lg" className="max-w-xl space-y-4">
      <div className="space-y-2">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
          Comece convidando um aluno
        </h2>
        <p className="text-[14px] leading-[1.6] text-ink-3">
          Você gera um link, manda pelo WhatsApp e o aluno cria a conta sozinho.
          Depois é só montar o treino e atribuir a ele.
        </p>
      </div>
      <Link href="/painel/treinos">
        <Button variant="secondary">Ver meus treinos</Button>
      </Link>
    </Card>
  );
}

/** "3 dias" / "hoje" — o suficiente para o personal saber se vai expirar. */
function diasAte(iso: string): string {
  const dias = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  if (dias <= 0) return "hoje";
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}
