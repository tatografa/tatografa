"use client";

import { Pause, Play } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Dialog } from "@/components/ui";
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
            O acesso de {primeiroNome} ao app está pausado. O histórico e o perfil continuam
            abertos para a pessoa.
          </p>
          <form action={acao}>
            <input type="hidden" name="alunoId" value={alunoId} />
            <input type="hidden" name="status" value="ativo" />
            <Button type="submit" size="sm" block disabled={enviando}>
              <Play size={14} aria-hidden />
              {enviando ? "Reativando…" : "Reativar acesso"}
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
          Pausar acesso ao app
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
        titulo={`Pausar o acesso de ${primeiroNome}?`}
        descricao={`${primeiroNome} deixa de abrir treino, de ver o feed da turma, de publicar e de responder reavaliação. Nada é apagado: o histórico e o perfil continuam abertos, e os posts antigos continuam visíveis para os colegas. Você reativa quando quiser.`}
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
            Cancelar
          </Button>
          <Button type="submit" block disabled={enviando}>
            {enviando ? "Pausando…" : "Pausar acesso"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
