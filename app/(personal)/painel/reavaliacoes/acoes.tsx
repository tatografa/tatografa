"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog, Select } from "@/components/ui";
import { preencher } from "@/lib/i18n/texto";
import type { AlunoDaLista } from "@/lib/queries/alunos";

import {
  cancelarReavaliacao,
  liberarReavaliacao,
  type EstadoDaLiberacao,
  type EstadoDoCancelamento,
} from "./actions";

const LIBERACAO: EstadoDaLiberacao = {};
const CANCELAMENTO: EstadoDoCancelamento = {};

/**
 * "Nova reavaliação": escolhe o aluno e libera.
 *
 * Um `<select>` e um botão — não há mais nada a perguntar, porque tudo o que a
 * reavaliação contém é o aluno que responde. Pedir "data limite" ou "o que
 * medir" aqui seria inventar campo que o banco não tem.
 */
export function NovaReavaliacao({
  alunos,
  variante = "primary",
}: {
  alunos: AlunoDaLista[];
  /** Na agenda o botão divide o cabeçalho com "Nova sessão", que é o primário. */
  variante?: "primary" | "secondary";
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(liberarReavaliacao, LIBERACAO);
  const { t } = usePainel();
  const lb = t.agenda.liberar;

  /*
   * Fecha sozinho quando deu certo — **ajustando o estado no render**, não num
   * efeito. `useActionState` não devolve nada para encadear no handler (a ação
   * roda no servidor), e `setState` dentro de `useEffect` dispara um render em
   * cascata; o lint do projeto recusa, com razão.
   *
   * A comparação é pela **identidade do objeto**, não pelo valor de `ok`.
   * Comparar o booleano parece equivalente e não é: `useActionState` devolve um
   * objeto novo a cada ação, mas `ok` continua `true` entre dois sucessos
   * seguidos — e aí a transição some, o bloco não roda e o diálogo fica aberto
   * na segunda liberação. Foi encontrado em campo e reproduzido no navegador.
   */
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.ok) setAberto(false);
  }

  if (alunos.length === 0) return null;

  return (
    <>
      <Button size="sm" variant={variante} onClick={() => setAberto(true)}>
        <Plus size={16} aria-hidden /> {lb.botao}
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={lb.botao}
        descricao={lb.descricao}
      >
        <form action={acao} noValidate className="space-y-4">
          <Select
            name="alunoId"
            label={t.agenda.nova.aluno}
            defaultValue=""
            error={estado.erro}
            required
          >
            <option value="" disabled>
              {t.agenda.nova.escolha}
            </option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAberto(false)}
              disabled={enviando}
            >
              {t.comum.cancelar}
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? lb.liberando : lb.liberar}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

/**
 * Cancela uma reavaliação que ninguém respondeu ainda.
 *
 * Confirma antes: o aluno pode já ter a tela aberta e estar com a fita na mão.
 */
export function BotaoCancelar({ id, aluno }: { id: string; aluno: string }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(cancelarReavaliacao, CANCELAMENTO);
  const { t } = usePainel();
  const lb = t.agenda.liberar;

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        {t.comum.cancelar}
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={lb.cancelarTitulo}
        descricao={preencher(lb.cancelarTexto, { nome: aluno })}
      >
        <form action={acao} noValidate className="space-y-4">
          <input type="hidden" name="id" value={id} />

          {estado.erro && (
            <p role="alert" className="text-[13px] text-danger">
              {estado.erro}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAberto(false)}
              disabled={enviando}
            >
              {t.comum.manter}
            </Button>
            <Button type="submit" variant="danger" disabled={enviando}>
              {enviando ? lb.cancelando : lb.cancelar}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
