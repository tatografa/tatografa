import { Carregando, Esqueleto } from "@/components/esqueleto";
import { textosDoApp } from "@/lib/i18n/app/servidor";

/**
 * A tela mais lenta do app do aluno: `progressoDoAluno` varre o histórico
 * inteiro, paginado, para agrupar por exercício. Sem esqueleto, a aba Progresso
 * fica em branco por um tempo perceptível e parece que não respondeu ao toque.
 */
export default async function CarregandoProgresso() {
  const { t } = await textosDoApp();
  return (
    <Carregando rotulo={t.comum.carregando.progresso}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Esqueleto className="h-[26px] w-36" />
          <Esqueleto className="h-[15px] w-48" />
        </div>

        <Esqueleto className="h-12 w-full rounded-input" />

        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="h-[68px] w-full rounded-card" />
          ))}
        </div>
      </div>
    </Carregando>
  );
}
