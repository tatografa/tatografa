import { BottomNav } from "@/components/aluno/bottom-nav";
import { requireStudent } from "@/lib/auth/session";

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
  await requireStudent();

  return (
    <div className="min-h-dvh bg-canvas">
      {/*
       * O padding de baixo reserva a altura da bottom nav (64px) mais a área
       * segura do aparelho: sem isso o último card fica embaixo da barra em
       * iPhone com faixa inferior.
       */}
      <div className="mx-auto min-h-dvh max-w-[440px] bg-canvas px-5 pt-4 pb-[calc(64px+env(safe-area-inset-bottom)+16px)]">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
