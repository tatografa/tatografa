import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * A faixa que aparece no topo do app do aluno **só para o personal treinando
 * como aluno de si mesmo**.
 *
 * Duas razões para ela existir. A primeira é a saída: o app do aluno é fechado
 * de propósito — quem está logado como aluno e abre uma tela de entrada é
 * devolvido para `/app` pelo proxy —, e sem esta faixa o caminho de volta ao
 * painel seria digitar a URL na mão.
 *
 * A segunda é dizer onde ele está. As duas interfaces dividem a marca e a
 * tipografia; num celular, sem esta frase, "por que meu painel sumiu" é uma
 * pergunta honesta.
 */
export function BarraDeVoltaAoPainel() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-card border border-brand-soft bg-brand-soft px-3.5 py-2.5">
      <p className="text-[12.5px] font-semibold text-brand">
        Você está treinando como aluno
      </p>
      <Link
        href="/painel"
        className="flex items-center gap-1 text-[12.5px] font-bold text-brand underline underline-offset-2 transition hover:text-brand-hover"
      >
        <ArrowLeft size={13} aria-hidden />
        Voltar ao painel
      </Link>
    </div>
  );
}
