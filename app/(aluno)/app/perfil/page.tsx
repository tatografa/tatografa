import type { Metadata } from "next";

import { BotaoSair } from "@/components/botao-sair";
import { Card } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";

import { FormularioDePerfil } from "./formulario-de-perfil";

export const metadata: Metadata = { title: "Perfil" };

/**
 * Perfil do aluno: ver, **corrigir** e sair.
 *
 * Nasceu (M1) só com o **sair**, porque até o primeiro teste de campo o app do
 * aluno não tinha saída nenhuma: o proxy devolve todo usuário logado que abre
 * `/entrar`, `/cadastro` ou `/acesso` para a sua própria área, e quem entrava
 * como aluno ficava preso até limpar os cookies. Num produto usado em celular
 * emprestado na academia, isso não é detalhe.
 *
 * A **edição** entrou depois, e não por pedido de tela: a política de
 * privacidade publicada promete, em "Seus direitos", que o perfil é editável —
 * corrigir dado errado sobre si é direito da LGPD. A tela só de leitura fazia
 * dessa frase uma promessa vazia. O peso, além disso, muda com o tempo, e é
 * dele que o personal parte para montar o treino.
 */
export default async function PerfilDoAluno() {
  const { student, personal } = await requireStudent();

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-[18px] font-bold text-ink-2"
        >
          {student.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[21px] font-extrabold tracking-[-0.02em] text-ink">
            {student.name}
          </h1>
          <p className="truncate text-[13px] text-ink-4">
            Treina com {personal.name}
          </p>
        </div>
      </header>

      <Card>
        <FormularioDePerfil aluno={student} />
      </Card>

      <Card className="space-y-3">
        <p className="text-[13px] leading-[1.6] text-ink-3">
          Saindo, o treino e o histórico continuam guardados. Para voltar, use o
          e-mail e a senha que você criou.
        </p>
        <BotaoSair variant="danger" size="md" block />
      </Card>
    </div>
  );
}
