import { STATUS_DO_ALUNO } from "@/lib/rotulos";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

/**
 * A pílula de status com o ponto, como no protótipo. Inativo fica em cinza, e
 * não no vermelho do protótipo: arquivar é uma decisão do personal, não um
 * problema — o vermelho desta tabela é do "último treino", que é o alerta.
 */
export function StatusDoAluno({ status }: { status: Enums<"student_status"> }) {
  const tom =
    status === "ativo"
      ? "bg-success-soft text-success"
      : status === "convidado"
        ? "bg-warning-bg text-warning"
        : "bg-badge-neutral text-ink-3";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12.5px] font-medium",
        tom,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_DO_ALUNO[status]}
    </span>
  );
}
