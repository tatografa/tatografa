import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui";
import type { Idioma } from "@/lib/domain/idioma";
import {
  SLOTS,
  formatarVariacao,
  type Comparacao as Linha,
} from "@/lib/domain/reavaliacao";
import { TEXTOS_DO_APP } from "@/lib/i18n/app";
import { formatos } from "@/lib/i18n/formatos";
import { preencher } from "@/lib/i18n/texto";
import type { Reavaliacao } from "@/lib/queries/reavaliacao";

/**
 * Uma reavaliação respondida, comparada com a anterior (doc 05 §12, doc 06 §9).
 *
 * Mesma peça nos dois lados: o aluno vê a própria evolução, o personal vê a do
 * aluno, e o que muda é só quem chama. Duas versões do mesmo quadro divergiriam
 * na primeira mudança — e é o quadro que os dois usam para conversar.
 *
 * **A variação não é pintada de verde nem de vermelho.** Perder dois
 * centímetros de cintura é vitória para quem quer emagrecer e prejuízo para
 * quem quer crescer; só o personal sabe o que foi combinado. A tela mostra o
 * número; o parecer é dele.
 */
export function Comparacao({
  atual,
  anterior,
  linhas,
  idioma = "pt",
}: {
  atual: Reavaliacao;
  anterior: Reavaliacao | null;
  linhas: Linha[];
  /** O idioma de quem lê: o do aluno no app, o do personal no painel. */
  idioma?: Idioma;
}) {
  const r = TEXTOS_DO_APP[idioma].perfil.reavaliacao;
  const c = r.comparacao;
  const f = formatos(idioma);
  const rotuloDa = (l: Linha) =>
    !l.chave ? l.rotulo : l.chave === "peso" || l.chave === "gordura" ? r.medidas[l.chave] : r.regioes[l.chave];
  const valor = (n: number | null, unidade: string) =>
    n === null ? "—" : `${f.numero(n)} ${unidade}`;
  // O sinal tipográfico e o "0" de `formatarVariacao`, com o separador do idioma.
  const variacao = (n: number) => formatarVariacao(n).replace(/[\d.,]+/, f.numero(Math.abs(n)));
  const comDado = linhas.filter((l) => l.atual !== null || l.anterior !== null);
  const fotosAtuais = SLOTS.filter((s) => atual.fotos[s]);

  return (
    <div className="space-y-5">
      {comDado.length > 0 && (
        <Card size="lg" className="space-y-0 p-0">
          <table className="w-full">
            <caption className="sr-only">
              {anterior ? c.comparadas : c.desta}
            </caption>
            <thead>
              <tr className="border-b border-border-soft">
                <th scope="col" className="px-4.5 py-3 text-left eyebrow text-ink-4">
                  {c.medida}
                </th>
                {anterior && (
                  <th scope="col" className="px-2 py-3 text-right eyebrow text-ink-4">
                    {c.antes}
                  </th>
                )}
                <th scope="col" className="px-2 py-3 text-right eyebrow text-ink-4">
                  {c.agora}
                </th>
                {anterior && (
                  <th scope="col" className="px-4.5 py-3 text-right eyebrow text-ink-4">
                    {c.variacao}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {comDado.map((l) => (
                <tr key={l.rotulo} className="border-b border-border-soft last:border-0">
                  <th
                    scope="row"
                    className="px-4.5 py-3 text-left text-[13.5px] font-semibold text-ink"
                  >
                    {rotuloDa(l)}
                  </th>
                  {anterior && (
                    <td className="px-2 py-3 text-right font-mono text-[13px] text-ink-4">
                      {valor(l.anterior, l.unidade)}
                    </td>
                  )}
                  <td className="px-2 py-3 text-right font-mono text-[13.5px] font-bold text-ink">
                    {valor(l.atual, l.unidade)}
                  </td>
                  {anterior && (
                    <td className="px-4.5 py-3 text-right font-mono text-[13px] text-ink-2">
                      {l.variacao === null ? "—" : variacao(l.variacao)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {atual.observacao && (
        <Card size="lg" className="space-y-2">
          <p className="eyebrow text-ink-4">{c.observacao}</p>
          <p className="whitespace-pre-line text-[13.5px] leading-[1.6] text-ink-2">
            {atual.observacao}
          </p>
        </Card>
      )}

      {fotosAtuais.length > 0 && (
        <section className="space-y-3">
          <p className="eyebrow text-ink-4">{c.fotos}</p>
          <ul className="grid gap-4 sm:grid-cols-3">
            {fotosAtuais.map((slot) => (
              <li key={slot} className="space-y-2">
                <p className="text-[12.5px] font-semibold text-ink-2">
                  {r.slots[slot]}
                </p>
                {/*
                  Antes e depois lado a lado, e só quando existem os dois: uma
                  moldura vazia rotulada "antes" faria parecer que a foto sumiu.
                */}
                <div className="flex items-start gap-2">
                  {anterior?.fotos[slot] && (
                    <>
                      <Foto
                        src={anterior.fotos[slot]}
                        alt={preencher(c.naAnterior, { slot: r.slots[slot] })}
                        legenda={anterior.rotuloDoEnvio ?? c.antes}
                      />
                      <ArrowRight
                        size={14}
                        className="mt-10 shrink-0 text-ink-5"
                        aria-hidden
                      />
                    </>
                  )}
                  <Foto
                    src={atual.fotos[slot]}
                    alt={preencher(c.nesta, { slot: r.slots[slot] })}
                    legenda={atual.rotuloDoEnvio ?? c.agora}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Foto({
  src,
  alt,
  legenda,
}: {
  src: string | null;
  alt: string;
  legenda: string;
}) {
  if (!src) return null;
  return (
    <figure className="min-w-0 flex-1 space-y-1">
      {/*
        `<img>` e não `next/image`: a URL é assinada e expira em uma hora, então
        o otimizador do Next guardaria em cache um endereço que morre — e a foto
        do corpo do aluno não é para ficar em cache de CDN.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-card border border-border-soft bg-canvas-sunken object-cover"
      />
      <figcaption className="text-[11px] text-ink-5">{legenda}</figcaption>
    </figure>
  );
}

