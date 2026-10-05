import { AcessoPausado } from "@/components/aluno/acesso-pausado";
import { requireStudent } from "@/lib/auth/session";
import { estaNaTurma } from "@/lib/domain/turma";
import { textosDoApp } from "@/lib/i18n/app/servidor";

/**
 * O portão do aluno inativo (decisão do Otávio, 26/09): **sem acesso ao app
 * até voltar a pagar.**
 *
 * **Por que um route group e não um `if` em cada página.** A autorização de
 * verdade mora no layout — é o único lugar por onde toda tela do grupo passa,
 * e num componente de página ela seria contornável por uma URL digitada. Mas
 * o portão não pode ficar no layout **de cima**, porque nem tudo se fecha:
 * `/app/perfil` e `/app/historico` continuam abertos de propósito e são
 * irmãos destas rotas. `(ativo)` não muda nenhuma URL — é só uma cerca em
 * volta do que é produto.
 *
 * **O que fica de fora da cerca, e não por esquecimento.** A política de
 * privacidade publicada promete, em "Seus direitos", que "seu perfil e seu
 * histórico estão todos lá, o perfil é editável". Corrigir dado errado sobre
 * si e ver o que se levantou são direitos da LGPD, não itens de assinatura.
 * Trancá-los faria do texto publicado uma mentira — o defeito que este
 * projeto já cometeu três vezes na direção oposta.
 *
 * Quem garante mesmo é o RLS (migrations 0035 e 0036): esta tela é a
 * explicação, não a tranca. Um POST direto não passa por layout nenhum.
 */
export default async function LayoutDoAlunoAtivo({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { student, personal } = await requireStudent();

  if (!estaNaTurma(student.status)) {
    const { t } = await textosDoApp();
    return (
      <AcessoPausado
        personal={personal}
        t={t.comum.pausado}
        rotuloDoPersonal={t.comum.cardDoPersonal.seuPersonal}
      />
    );
  }

  return <>{children}</>;
}
