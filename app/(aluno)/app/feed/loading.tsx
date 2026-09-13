import { Carregando, Esqueleto } from "@/components/esqueleto";

/**
 * A primeira abertura do feed busca posts, contagens e uma URL assinada por
 * foto. Sem esqueleto a aba fica em branco enquanto isso, e num celular na
 * academia isso se lê como "não abriu".
 *
 * A troca de aba **não** passa por aqui: ela é uma transição do cliente, e o
 * esqueleto de dentro da `TelaFeed` preserva o cabeçalho e as abas na tela.
 */
export default function CarregandoFeed() {
  return (
    <Carregando rotulo="Carregando o feed">
      <div className="space-y-4">
        <div className="space-y-3">
          <Esqueleto className="h-[26px] w-24" />
          <Esqueleto className="h-[50px] w-full rounded-[11px]" />
        </div>
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Esqueleto key={i} className="h-[300px] w-full rounded-card-lg" />
          ))}
        </div>
      </div>
    </Carregando>
  );
}
