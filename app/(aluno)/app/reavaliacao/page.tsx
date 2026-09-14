import type { Metadata } from "next";
import { CheckCircle2, Ruler } from "lucide-react";

import { LinkDeVoltar } from "@/components/aluno/link-de-voltar";
import { Comparacao } from "@/components/reavaliacao/comparacao";
import { Card } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";
import { SLOTS } from "@/lib/domain/reavaliacao";
import { comparar, lerReavaliacoesDoAluno } from "@/lib/queries/reavaliacao";

import { BotaoApagarFotos } from "./botao-apagar-fotos";
import { Formulario } from "./formulario";

export const metadata: Metadata = { title: "Reavaliação" };

/**
 * A reavaliação do aluno (doc 05 §12).
 *
 * Três estados numa rota só, porque é uma coisa só do ponto de vista de quem
 * abre: **responder** quando o personal liberou, **acompanhar** quando não há
 * nada aberto, e o aviso de envio logo depois de mandar. Rotas separadas
 * ("/reavaliacao/nova", "/reavaliacao/historico") obrigariam o aluno a saber em
 * qual dos estados ele está antes de escolher o link.
 *
 * O `?enviada=1` vem do redirect da própria ação. É afirmação de URL e não
 * decide nada: o que a tela mostra é a reavaliação que o banco devolveu — a
 * flag só acrescenta a confirmação.
 */
export default async function ReavaliacaoDoAluno({
  searchParams,
}: PageProps<"/app/reavaliacao">) {
  const [{ enviada }, { student, personal }] = await Promise.all([
    searchParams,
    requireStudent(),
  ]);

  const { aberta, enviadas } = await lerReavaliacoesDoAluno(student.id, {
    comFotos: true,
  });

  const ultima = enviadas[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <LinkDeVoltar href="/app/perfil">← Perfil</LinkDeVoltar>
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          Reavaliação
        </h1>
      </div>

      {enviada === "1" && !aberta && (
        <Card className="flex items-start gap-2.5 border-success/30 bg-success-soft">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p className="text-[13px] leading-[1.5] text-success-dark">
            Reavaliação enviada. {primeiroNome(personal.name)} já consegue ver.
          </p>
        </Card>
      )}

      {aberta ? (
        <>
          <p className="text-[13px] leading-[1.55] text-ink-3">
            {primeiroNome(personal.name)} liberou uma reavaliação{" "}
            {aberta.rotuloDaLiberacao.toLowerCase()}. Meça com calma — o que você
            preencher aqui vira a comparação do próximo ciclo.
          </p>
          <Formulario reavaliacao={aberta} anterior={ultima} />
        </>
      ) : (
        <Card size="lg" className="space-y-2 text-center">
          <Ruler size={20} className="mx-auto text-ink-4" aria-hidden />
          <p className="text-[14px] font-bold text-ink">Nada para preencher agora</p>
          <p className="mx-auto max-w-xs text-[12.5px] leading-[1.5] text-ink-4">
            {primeiroNome(personal.name)} avisa por aqui quando for hora da
            próxima. O formulário aparece nesta tela.
          </p>
        </Card>
      )}

      {enviadas.length > 0 && (
        <section className="space-y-4 border-t border-border-soft pt-5">
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
            Suas reavaliações
          </h2>

          {enviadas.map((r, i) => {
            // A lista vem da mais recente para a mais antiga, então a anterior
            // no tempo é a **próxima** da lista.
            const anterior = enviadas[i + 1] ?? null;
            return (
              <section key={r.id} className="space-y-2.5">
                <h3 className="text-[13px] font-bold text-ink-2">
                  {r.rotuloDoEnvio}
                  {anterior && (
                    <span className="ml-1.5 font-medium text-ink-4">
                      vs. {anterior.rotuloDoEnvio}
                    </span>
                  )}
                </h3>
                <Comparacao
                  atual={r}
                  anterior={anterior}
                  linhas={comparar(r, anterior)}
                />
                {/*
                  O botão só aparece quando ainda há foto. É a única coisa que
                  muda numa reavaliação enviada (migration 0026): os números
                  ficam, porque são a comparação que o personal usa; a foto é do
                  corpo do aluno e sai quando ele quiser — a mesma promessa que
                  a política de privacidade já fazia sobre a foto do feed.
                */}
                {SLOTS.some((slot) => r.fotos[slot]) && (
                  <BotaoApagarFotos id={r.id} />
                )}
              </section>
            );
          })}
        </section>
      )}
    </div>
  );
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
