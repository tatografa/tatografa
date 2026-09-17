import { AvisoDeOffline } from "@/components/aluno/aviso-de-offline";
import { BarraDeVoltaAoPainel } from "@/components/aluno/barra-de-volta-ao-painel";
import { BottomNav } from "@/components/aluno/bottom-nav";
import { PortaoDeAceite } from "@/components/portao-de-aceite";

import { aceitarAtualizacao } from "./acoes-de-aceite";
import { requireStudent } from "@/lib/auth/session";
import {
  O_QUE_MUDOU,
  O_QUE_NAO_MUDA,
  VERSAO_DOS_DOCUMENTOS,
} from "@/lib/legal/documentos";
import { aceiteEstaEmDia } from "@/lib/queries/aceite";

/**
 * Moldura do app do aluno (celular, na academia).
 *
 * Aqui mora a autorização de verdade: `requireStudent()` confirma que existe
 * linha em `students` para o usuário logado. O proxy só evita render à toa.
 *
 * Largura máxima de 440px centralizada: o app é mobile-first, mas abrir no
 * desktop não pode esticar uma coluna de texto pela tela inteira.
 */
export default async function AlunoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { student, personal } = await requireStudent();

  // O personal que treina é aluno de si mesmo: a linha em `students` tem `id` e
  // `trainer_id` iguais (migration 0019). Comparar os dois é o jeito mais barato
  // de saber que existe painel do outro lado — nenhuma consulta a mais, porque
  // `requireStudent()` já traz os dois e é memoizada por requisição.
  const tambemEPersonal = student.id === personal.id;

  /*
   * O portão de re-aceite mora aqui, no layout, pelo mesmo motivo que a
   * autorização mora: é o único lugar por onde toda tela do aluno passa. Num
   * componente de página ele seria contornável por uma URL digitada.
   *
   * `/termos` e `/privacidade` ficam **fora** deste grupo de rotas, então
   * continuam abertos — ler o que se está aceitando não pode depender de
   * aceitar.
   */
  if (!(await aceiteEstaEmDia(student.id))) {
    return (
      <div className="min-h-dvh bg-canvas">
        <PortaoDeAceite
          versao={VERSAO_DOS_DOCUMENTOS}
          oQueMudou={O_QUE_MUDOU.aluno}
          oQueNaoMuda={O_QUE_NAO_MUDA.aluno}
          aoAceitar={aceitarAtualizacao}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <AvisoDeOffline />
      {/*
       * O padding de baixo reserva a altura da bottom nav (64px) mais a área
       * segura do aparelho: sem isso o último card fica embaixo da barra em
       * iPhone com faixa inferior.
       */}
      <div className="mx-auto min-h-dvh max-w-[440px] bg-canvas px-5 pt-4 pb-[calc(64px+env(safe-area-inset-bottom)+16px)]">
        {tambemEPersonal ? <BarraDeVoltaAoPainel /> : null}
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
