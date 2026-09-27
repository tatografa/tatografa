"use client";

import { CalendarDays, ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { PERIODOS, type PeriodoDoSocial } from "@/lib/domain/feed";

/**
 * Os dois filtros do protótipo, "Todos os alunos" e "Todo o período".
 *
 * `<select>` nativo com a roupa do protótipo, e não uma lista desenhada à mão:
 * a nativa já traz teclado, busca por letra e leitor de tela. A escolha vai
 * para a URL, então recarregar ou voltar mostra o mesmo recorte.
 */
export function FiltrosDoFeed({
  alunos,
  alunoId,
  periodo,
}: {
  alunos: { id: string; nome: string }[];
  alunoId: string | null;
  periodo: PeriodoDoSocial;
}) {
  const router = useRouter();

  function ir(aluno: string | null, per: PeriodoDoSocial) {
    const busca = new URLSearchParams();
    if (aluno) busca.set("aluno", aluno);
    if (per !== "tudo") busca.set("periodo", per);
    const texto = busca.toString();
    router.push(texto ? `/painel/social?${texto}` : "/painel/social");
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Filtro Icone={User}>
        <select
          aria-label="Filtrar por aluno"
          value={alunoId ?? ""}
          onChange={(e) => ir(e.target.value || null, periodo)}
          className={SELECT}
        >
          <option value="">Todos os alunos</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </Filtro>
      <Filtro Icone={CalendarDays}>
        <select
          aria-label="Filtrar por período"
          value={periodo}
          onChange={(e) => ir(alunoId, e.target.value as PeriodoDoSocial)}
          className={SELECT}
        >
          {PERIODOS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </Filtro>
    </div>
  );
}

const SELECT =
  "h-10 w-full appearance-none rounded-[10px] border border-border bg-surface pr-8 pl-9 text-[13px] font-medium text-ink transition " +
  "hover:border-border-strong focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/15";

function Filtro({
  Icone,
  children,
}: {
  Icone: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <Icone size={14} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-4" />
      {children}
      <ChevronDown size={13} aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-5" />
    </div>
  );
}
