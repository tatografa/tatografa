"use client";

import { Copy } from "lucide-react";
import { useActionState, useState } from "react";

import { Button, Dialog, Input, Select } from "@/components/ui";

import {
  arquivarPrograma,
  ativarPrograma,
  duplicarPrograma,
  type EstadoDaCopia,
} from "./actions";
import {
  textoDeArquivamento,
  textoDeAtivacao,
  textoDeDuplicacao,
} from "./textos";

const COPIA: EstadoDaCopia = {};

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

/**
 * "Duplicar": copia o programa inteiro para um aluno — o mesmo ou outro.
 *
 * É o "duplicar macrotreino" e o "atribuir a um ou vários alunos" do doc 06 §5,
 * que são a mesma operação. O programa de origem pode estar ativo ou arquivado:
 * um programa arquivado é justamente o modelo que o personal guardou para
 * reusar, e escondê-lo daqui tiraria o caso mais comum.
 *
 * **A cópia nasce arquivada, e o diálogo diz isso antes do clique.** Sem essa
 * frase o personal copia para a Carla e vai embora achando que ela já tem
 * treino — e descobre na semana seguinte que ela abriu o app vazia. É a mesma
 * escolha do texto de arquivamento: dizer a consequência, não o fato.
 */
export function BotaoDuplicar({
  programaId,
  nome,
  alunos,
  alunoAtual,
}: {
  programaId: string;
  nome: string;
  /** A carteira inteira: dá para copiar para o mesmo aluno ou para outro. */
  alunos: { id: string; name: string }[];
  /** Quem é o dono do programa de origem, para vir escolhido por padrão. */
  alunoAtual: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, acao, enviando] = useActionState(duplicarPrograma, COPIA);

  /*
   * Fecha no sucesso ajustando o estado no render, comparando a **identidade**
   * do objeto — não um booleano. Dois sucessos seguidos devolvem objetos
   * diferentes com o mesmo valor, e comparar o valor faria o diálogo ficar
   * aberto na segunda cópia. Foi o defeito de `NovaReavaliacao`, achado em campo.
   */
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (!estado.erro && !estado.errosPorCampo) setAberto(false);
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setAberto(true)}>
        <Copy size={14} aria-hidden /> Duplicar
      </Button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={`Duplicar “${nome}”`}
        descricao={textoDeDuplicacao(alunos.length)}
      >
        <form action={acao} noValidate className="space-y-4">
          <input type="hidden" name="programaId" value={programaId} />

          <Select
            name="alunoId"
            label="Para quem"
            defaultValue={alunoAtual}
            error={estado.errosPorCampo?.aluno}
            required
          >
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>

          <Input
            name="nome"
            label="Nome do programa novo"
            defaultValue={`${nome} (cópia)`.slice(0, 80)}
            maxLength={80}
            error={estado.errosPorCampo?.nome}
            required
          />

          {estado.erro && (
            <p className="text-[12.5px] font-semibold text-danger">{estado.erro}</p>
          )}

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
              {enviando ? "Copiando…" : "Duplicar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
