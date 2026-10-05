"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * "Voltar" para a landing nas telas de entrada (pedido do Otávio, 05/10). O
 * logo da moldura já levava à página inicial, mas logo não se lê como botão
 * de voltar — e no celular ele fica no topo escuro, longe do formulário.
 *
 * O aluno volta para a versão dele (`/?para=alunos`), de onde veio o botão de
 * entrar; o resto, para a do personal. Não aparece em "Criar nova senha": quem
 * chega ali veio de um link do e-mail, já com a sessão aberta para trocar a
 * senha, e "voltar para a landing" no meio disso é sair sem terminar.
 */
export function VoltarAoInicio({ rotulo }: { rotulo: string }) {
  const caminho = usePathname();
  if (caminho.startsWith("/recuperar/nova-senha")) return null;

  return (
    <Link
      href={caminho === "/acesso" ? "/?para=alunos" : "/"}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 transition hover:text-ink"
    >
      <ArrowLeft size={15} aria-hidden />
      {rotulo}
    </Link>
  );
}
