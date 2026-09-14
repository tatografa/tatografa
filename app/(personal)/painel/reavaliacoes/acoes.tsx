"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Dialog, Select } from "@/components/ui";
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
export function NovaReavaliacao({ alunos }: { alunos: AlunoDaLista[] }) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(liberarReavaliacao, LIBERACAO);

  /*
   * Fecha sozinho quando deu certo — **ajustando o estado no render**, não num
   * efeito. `useActionState` não devolve nada para encadear no handler (a ação
   * roda no servidor), e `setState` dentro de `useEffect` dispara um render em
   * cascata; o lint do projeto recusa, com razão. O padrão aqui é o de "ajustar
   * estado quando a entrada muda": compara com o que já foi visto, e por isso
   * liberar duas vezes seguidas continua funcionando.
   */
  const [ultimoOk, setUltimoOk] = useState(false);
  if (Boolean(estado.ok) !== ultimoOk) {
    setUltimoOk(Boolean(estado.ok));
    if (estado.ok) setAberto(false);
  }

  if (alunos.length === 0) return null;

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <Plus size={16} aria-hidden /> Nova reavaliação
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Liberar reavaliação"
        descricao="O aluno preenche as medidas e as fotos pelo app dele."
      >
        <form action={acao} noValidate className="space-y-4">
          <Select
            name="alunoId"
            label="Aluno"
            defaultValue=""
            error={estado.erro}
            required
          >
            <option value="" disabled>
              Escolha um aluno
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
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Liberando…" : "Liberar"}
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

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        Cancelar
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Cancelar a reavaliação?"
        descricao={`${aluno} deixa de ver o formulário no app. Você pode liberar outra depois.`}
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
              Manter
            </Button>
            <Button type="submit" variant="danger" disabled={enviando}>
              {enviando ? "Cancelando…" : "Cancelar reavaliação"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
