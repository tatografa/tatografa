"use client";

/**
 * O checkbox de aceite dos documentos — o mesmo nos dois cadastros.
 *
 * Nasceu escrito à mão dentro do onboarding do aluno. Quando o personal passou
 * a aceitar também (decisão do Otávio, 17/09), copiar as quarenta linhas seria
 * a segunda cópia de um **texto com efeito jurídico**: o dia em que a frase
 * mudasse, um dos dois lados ficaria dizendo outra coisa, e a diferença só
 * apareceria numa auditoria.
 *
 * Os links abrem em aba nova: clicar num deles no meio do cadastro não pode
 * custar a senha já digitada. `stopPropagation` porque o link está dentro da
 * `<label>` — sem isso, tocar nele marcaria o checkbox de tabela.
 */
export function AceiteDosTermos({
  marcado,
  aoMarcar,
  erro,
}: {
  marcado: boolean;
  aoMarcar: (valor: boolean) => void;
  erro?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="termos"
          checked={marcado}
          onChange={(e) => aoMarcar(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-brand"
        />
        <span className="text-[12.5px] leading-[1.5] text-ink-3">
          Aceito os{" "}
          <LinkLegal href="/termos">termos de uso</LinkLegal> e a{" "}
          <LinkLegal href="/privacidade">política de privacidade</LinkLegal> do
          Reps Club.
        </span>
      </label>
      {erro && <p className="text-[12.5px] font-semibold text-danger">{erro}</p>}
    </div>
  );
}

function LinkLegal({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="font-semibold text-brand underline underline-offset-2 transition hover:text-brand-hover"
    >
      {children}
    </a>
  );
}
