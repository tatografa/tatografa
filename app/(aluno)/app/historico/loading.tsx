import { Carregando, Esqueleto } from "@/components/esqueleto";
import { textosDoApp } from "@/lib/i18n/app/servidor";

export default async function CarregandoHistorico() {
  const { t } = await textosDoApp();
  return (
    <Carregando rotulo={t.comum.carregando.historico}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Esqueleto className="h-[13px] w-20" />
          <Esqueleto className="h-[24px] w-32" />
        </div>
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Esqueleto key={i} className="h-[82px] w-full rounded-card" />
          ))}
        </div>
      </div>
    </Carregando>
  );
}
