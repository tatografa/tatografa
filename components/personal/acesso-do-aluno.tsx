"use client";

import { Pause, Play } from "lucide-react";
import { useActionState, useState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog } from "@/components/ui";
import { preencher } from "@/lib/i18n/texto";
import {
  mudarAcessoDoAluno,
  type EstadoDoAcesso,
} from "@/app/(personal)/painel/alunos/[id]/actions";

const INICIAL: EstadoDoAcesso = {};

/**
 * Pausar ou reativar o acesso do aluno ao app — a porta que faltava para a
 * regra de 26/09, que até 01/10 só se mudava pelo banco.
 *
 * Pausar passa por confirmação porque muda o que outra pessoa vê no celular
 * dela, e a frase diz o que acontece **e o que não acontece**: o medo de quem
 * pausa é apagar o histórico, e não apaga. Reativar não pergunta — devolver o
 * acesso não tira nada de ninguém.
 */
export function AcessoDoAluno({
  alunoId,
  primeiroNome,
  pausado,
}: {
  alunoId: string;
  primeiroNome: string;
  pausado: boolean;
}) {
  const [estado, acao, enviando] = useActionState(mudarAcessoDoAluno, INICIAL);
  const [confirmando, setConfirmando] = useState(false);
  const { t } = usePainel();
  const a = t.ficha.acesso;

  // Fecha a confirmação quando a ação responde, e não no clique: fechar no
  // clique desmontaria o formulário no meio do envio. Ajuste durante a
  // renderização, o padrão do projeto desde o onboarding.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    setConfirmando(false);
  }

  return (
    <div className="space-y-2 border-t border-border-soft pt-[18px]">
      {pausado ? (
        <>
          <p className="text-[12.5px] leading-relaxed text-ink-4">
            {preencher(a.pausado, { nome: primeiroNome })}
          </p>
          <form action={acao}>
            <input type="hidden" name="alunoId" value={alunoId} />
            <input type="hidden" name="status" value="ativo" />
            <Button type="submit" size="sm" block disabled={enviando}>
              <Play size={14} aria-hidden />
              {enviando ? a.reativando : a.reativar}
            </Button>
          </form>
        </>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          block
          onClick={() => setConfirmando(true)}
        >
          <Pause size={14} aria-hidden />
          {a.pausar}
        </Button>
      )}

      {estado.erro ? (
        <p role="alert" className="text-[12.5px] font-semibold text-danger">
          {estado.erro}
        </p>
      ) : null}

      <Dialog
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo={preencher(a.confirmarTitulo, { nome: primeiroNome })}
        descricao={preencher(a.confirmarTexto, { nome: primeiroNome })}
      >
        <form action={acao} className="flex gap-2.5">
          <input type="hidden" name="alunoId" value={alunoId} />
          <input type="hidden" name="status" value="inativo" />
          <Button
            type="button"
            variant="secondary"
            block
            disabled={enviando}
            onClick={() => setConfirmando(false)}
          >
            {t.comum.cancelar}
          </Button>
          <Button type="submit" block disabled={enviando}>
            {enviando ? a.pausando : a.confirmar}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
