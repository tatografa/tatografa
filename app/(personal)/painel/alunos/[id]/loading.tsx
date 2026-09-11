import { Carregando, Esqueleto } from "@/components/esqueleto";

/**
 * A ficha lê quatro coisas, e uma delas é o progresso inteiro do aluno. É a
 * tela mais lenta do painel.
 */
export default function CarregandoFichaDoAluno() {
  return (
    <Carregando rotulo="Carregando a ficha do aluno">
      <div className="space-y-8">
        <div className="space-y-3">
          <Esqueleto className="h-[13px] w-16" />
          <Esqueleto className="h-[34px] w-60" />
          <Esqueleto className="h-[15px] w-72" />
        </div>

        <div className="space-y-3">
          <Esqueleto className="h-[13px] w-28" />
          <Esqueleto className="h-[120px] max-w-xl rounded-card-lg" />
        </div>

        <div className="space-y-3">
          <Esqueleto className="h-[13px] w-40" />
          <Esqueleto className="h-[320px] w-full rounded-card-lg" />
        </div>
      </div>
    </Carregando>
  );
}
