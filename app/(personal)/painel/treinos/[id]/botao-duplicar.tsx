"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

import { Button, Dialog } from "@/components/ui";
import { duplicarTreino } from "@/app/(personal)/painel/macrotreinos/actions";

/**
 * "Duplicar treino": copia este treino dentro do mesmo programa.
 *
 * É o caminho de "o B é parecido com o A": copiar e trocar dois exercícios, em
 * vez de montar os outros dez de novo. O doc 06 §5 pede isto junto com duplicar
 * macrotreino, e justifica os dois com "o personal reaproveita muito".
 *
 * A confirmação existe porque a cópia **aparece na hora para o aluno** quando o
 * programa está ativo: um treino a mais na lista dele, sem aviso. Não é
 * destrutivo, então o texto não assusta — mas o personal merece saber antes.
 */
export function BotaoDuplicarTreino({
  treinoId,
  programaId,
  label,
  nome,
}: {
  treinoId: string;
  programaId: string;
  label: string;
  nome: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        <Copy size={14} aria-hidden /> Duplicar treino
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={`Duplicar “${label} · ${nome}”?`}
        descricao="A cópia entra neste mesmo programa, com a próxima letra livre e os mesmos exercícios, séries e cargas. É por ela que você mexe depois — o treino original fica como está."
      >
        <form action={duplicarTreino} className="flex gap-2.5">
          <input type="hidden" name="treinoId" value={treinoId} />
          <input type="hidden" name="programaId" value={programaId} />
          <Button
            type="button"
            variant="secondary"
            block
            onClick={() => setAberto(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" block>
            Duplicar
          </Button>
        </form>
      </Dialog>
    </>
  );
}
