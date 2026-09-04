"use client";

import { useState } from "react";

import { Button, Dialog } from "@/components/ui";

import { arquivarPrograma, ativarPrograma } from "./actions";
import { textoDeArquivamento, textoDeAtivacao } from "./textos";

/**
 * Arquivar um programa ativo.
 *
 * A confirmação não é um "tem certeza?": o texto (em `textos.ts`) diz que o
 * aluno fica sem treino até o personal montar outro. Sem isso, o personal
 * clicaria num botão cuja consequência acontece inteira do outro lado.
 */
export function BotaoArquivar({
  id,
  nome,
  aluno,
}: {
  id: string;
  nome: string;
  aluno: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        Arquivar
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={`Arquivar “${nome}”?`}
        descricao={textoDeArquivamento(aluno)}
      >
        <form action={arquivarPrograma} className="flex gap-2.5">
          <input type="hidden" name="id" value={id} />
          <Button type="button" variant="secondary" block onClick={() => setAberto(false)}>
            Manter ativo
          </Button>
          <Button type="submit" variant="danger" block>
            Arquivar
          </Button>
        </form>
      </Dialog>
    </>
  );
}

/**
 * Reativar um programa arquivado.
 *
 * Só confirma quando o aluno já tem outro ativo: nesse caso a troca arquiva o
 * atual, e o que o aluno abre na academia muda. Sem programa ativo não há o que
 * confirmar — ativar só devolve treino a quem estava sem nenhum.
 */
export function BotaoAtivar({
  id,
  nome,
  aluno,
  ativoAtual,
}: {
  id: string;
  nome: string;
  aluno: string;
  /** Nome do programa que está ativo hoje, se houver. */
  ativoAtual: string | null;
}) {
  const [aberto, setAberto] = useState(false);

  if (!ativoAtual) {
    return (
      <form action={ativarPrograma}>
        <input type="hidden" name="id" value={id} />
        <Button size="sm" variant="secondary" type="submit">
          Ativar
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        Ativar
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={`Ativar “${nome}”?`}
        descricao={textoDeAtivacao(aluno, nome, ativoAtual)}
      >
        <form action={ativarPrograma} className="flex gap-2.5">
          <input type="hidden" name="id" value={id} />
          <Button type="button" variant="secondary" block onClick={() => setAberto(false)}>
            Cancelar
          </Button>
          <Button type="submit" block>
            Ativar
          </Button>
        </form>
      </Dialog>
    </>
  );
}
