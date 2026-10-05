import { Carregando, Esqueleto } from "@/components/esqueleto";
import { textosDoPainel } from "@/lib/i18n/painel/servidor";

export default async function CarregandoPainel() {
  const { t } = await textosDoPainel();
  return (
    <Carregando rotulo={t.comum.carregando.painel}>
      <div className="space-y-8">
        <div className="space-y-2">
          <Esqueleto className="h-[13px] w-32" />
          <Esqueleto className="h-[34px] w-52" />
        </div>

        {/* Os três indicadores do topo. */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-[86px] w-full rounded-card" />
          ))}
        </div>

        <div className="space-y-3">
          <Esqueleto className="h-[13px] w-24" />
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-[62px] w-full rounded-card" />
          ))}
        </div>
      </div>
    </Carregando>
  );
}
