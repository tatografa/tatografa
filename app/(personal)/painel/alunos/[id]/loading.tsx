import { Carregando, Esqueleto } from "@/components/esqueleto";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";

/**
 * O perfil lê sete coisas, e uma delas é o progresso inteiro do aluno. É a
 * tela mais lenta do painel. O esqueleto tem as mesmas três colunas da tela,
 * para ela não pular de forma quando chega.
 */
export default async function CarregandoFichaDoAluno() {
  const { t } = await textosDoPainel();
  return (
    <Carregando rotulo={t.comum.carregando.aluno}>
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <Esqueleto className="h-[22px] w-48" />
          <Esqueleto className="h-[14px] w-32" />
        </div>
        <div className="@container">
          <div className="grid gap-4 @min-[680px]:grid-cols-[220px_minmax(0,1fr)] @min-[1040px]:grid-cols-[minmax(230px,26%)_minmax(0,1fr)_minmax(300px,37%)]">
            <Esqueleto className="h-[520px] rounded-[12px]" />
            <div className="space-y-3.5">
              <Esqueleto className="h-[78px] rounded-[12px]" />
              <Esqueleto className="h-[420px] rounded-[12px]" />
            </div>
            <Esqueleto className="hidden h-[460px] rounded-[12px] @min-[1040px]:block" />
          </div>
        </div>
      </div>
    </Carregando>
  );
}
