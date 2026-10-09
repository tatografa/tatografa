"use client";

import { MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Dialog, Input } from "@/components/ui";
import { confereNome, primeiroNome } from "@/lib/domain/nome";
import { preencher } from "@/lib/i18n/texto";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  excluirAluno,
  mudarAcessoDoAluno,
  type EstadoDaExclusaoDoAluno,
  type EstadoDoAcesso,
} from "@/app/(personal)/painel/alunos/[id]/actions";

const ACESSO: EstadoDoAcesso = {};
const EXCLUSAO: EstadoDaExclusaoDoAluno = {};

/** Largura do menu; o canto direito dele se alinha ao do botão. */
const LARGURA_DO_MENU = 216;

/**
 * O ⋮ no fim da linha da carteira: inativar ou reativar o acesso e excluir o
 * aluno (pedido do Otávio, 09/10).
 *
 * **Inativar é a mesma ação de "Pausar acesso" da ficha** (`mudarAcessoDoAluno`),
 * com a mesma confirmação que diz o que **não** acontece; reativar não pergunta,
 * como lá. Na carteira a palavra é "inativar" porque a coluna ao lado diz
 * "Inativo".
 *
 * **Excluir pede o primeiro nome digitado.** É a única ação do painel que não
 * se desfaz e leva o histórico de outra pessoa, e o menu fica a um clique da
 * linha vizinha: a trava é contra excluir o aluno errado. O diálogo também
 * aponta a alternativa que não apaga nada.
 *
 * **O menu vai para o `<body>` por portal**, com posição fixa medida no clique.
 * Dentro da tabela ele seria cortado pela rolagem horizontal dela — a última
 * linha abriria o menu para dentro de uma caixa sem altura —, e o `@container`
 * da página faz de si mesmo o referencial de `position: fixed`.
 */
export function AcoesDoAluno({
  alunoId,
  nome,
  status,
}: {
  alunoId: string;
  nome: string;
  status: Enums<"student_status">;
}) {
  const { t } = usePainel();
  const a = t.alunos.acoes;
  const p = t.ficha.acesso;
  const primeiro = primeiroNome(nome);

  const [posicao, setPosicao] = useState<{ top: number; left: number } | null>(null);
  const [confirmando, setConfirmando] = useState<"inativar" | "excluir" | null>(null);
  const [digitado, setDigitado] = useState("");

  const botao = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const idDoMenu = useId();

  const [acesso, mudarAcesso, mudando] = useActionState(mudarAcessoDoAluno, ACESSO);
  const [exclusao, excluir, excluindo] = useActionState(excluirAluno, EXCLUSAO);

  // Fecha a confirmação quando a ação responde, não no clique: fechar no
  // clique desmontaria o formulário no meio do envio. Ajuste durante a
  // renderização, o padrão do projeto.
  const [ultimoAcesso, setUltimoAcesso] = useState(acesso);
  if (acesso !== ultimoAcesso) {
    setUltimoAcesso(acesso);
    if (!acesso.erro) setConfirmando(null);
  }

  const aberto = posicao !== null;
  const ativo = status === "ativo";

  function abrir() {
    const r = botao.current?.getBoundingClientRect();
    if (!r) return;
    const cabeAbaixo = r.bottom + 140 < window.innerHeight;
    setPosicao({
      top: cabeAbaixo ? r.bottom + 6 : r.top - 6 - 132,
      left: Math.max(8, r.right - LARGURA_DO_MENU),
    });
  }

  function fechar(devolverFoco = true) {
    setPosicao(null);
    if (devolverFoco) botao.current?.focus();
  }

  // Reativar não pergunta, e por isso não é um formulário dentro do menu: o
  // menu fecha no clique, e fechar desmontaria o formulário no meio do envio.
  function reativar() {
    fechar();
    const dados = new FormData();
    dados.set("alunoId", alunoId);
    dados.set("status", "ativo");
    startTransition(() => mudarAcesso(dados));
  }

  function escolher(acao: "inativar" | "excluir") {
    fechar(false);
    setDigitado("");
    setConfirmando(acao);
  }

  // Clique fora, rolagem e redimensionar fecham: o menu é fixo na tela, e com
  // a página rolando ele ficaria parado longe da linha a que pertence.
  useEffect(() => {
    if (!aberto) return;
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (!menu.current?.contains(alvo) && !botao.current?.contains(alvo)) setPosicao(null);
    };
    const sumir = () => setPosicao(null);
    document.addEventListener("mousedown", fora);
    window.addEventListener("scroll", sumir, true);
    window.addEventListener("resize", sumir);
    return () => {
      document.removeEventListener("mousedown", fora);
      window.removeEventListener("scroll", sumir, true);
      window.removeEventListener("resize", sumir);
    };
  }, [aberto]);

  function teclado(e: React.KeyboardEvent<HTMLDivElement>) {
    const itens = Array.from(
      menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [],
    );
    const atual = itens.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "Tab") {
      fechar(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const passo = e.key === "ArrowDown" ? 1 : -1;
      itens[(atual + passo + itens.length) % itens.length]?.focus();
    }
  }

  const nomeConfere = confereNome(digitado, nome);

  return (
    <>
      <button
        ref={botao}
        type="button"
        aria-label={preencher(a.abrir, { nome })}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? idDoMenu : undefined}
        onClick={() => (aberto ? fechar() : abrir())}
        className="relative z-10 flex size-8 items-center justify-center rounded-[8px] text-ink-4 transition hover:bg-canvas-sunken hover:text-ink"
      >
        <MoreVertical size={16} aria-hidden />
      </button>

      {acesso.erro ? (
        <p role="alert" className="relative z-10 mt-1 text-[11.5px] font-semibold text-danger">
          {acesso.erro}
        </p>
      ) : null}

      {posicao
        ? createPortal(
            <div
              ref={menu}
              id={idDoMenu}
              role="menu"
              aria-label={preencher(a.abrir, { nome })}
              onKeyDown={teclado}
              style={{ top: posicao.top, left: posicao.left, width: LARGURA_DO_MENU }}
              className="fixed z-50 rounded-[12px] border border-border bg-surface p-1.5 shadow-lg"
            >
              {ativo ? (
                <ItemDoMenu onClick={() => escolher("inativar")}>
                  <Pause size={15} aria-hidden />
                  {a.inativar}
                </ItemDoMenu>
              ) : (
                <ItemDoMenu onClick={reativar} disabled={mudando}>
                  <Play size={15} aria-hidden />
                  {a.reativar}
                </ItemDoMenu>
              )}
              <div role="separator" className="my-1 h-px bg-border-soft" />
              <ItemDoMenu perigo onClick={() => escolher("excluir")}>
                <Trash2 size={15} aria-hidden />
                {a.excluir}
              </ItemDoMenu>
            </div>,
            document.body,
          )
        : null}

      <Dialog
        aberto={confirmando === "inativar"}
        aoFechar={() => setConfirmando(null)}
        titulo={preencher(p.confirmarTitulo, { nome: primeiro })}
        descricao={preencher(p.confirmarTexto, { nome: primeiro })}
      >
        <form action={mudarAcesso} className="flex gap-2.5">
          <input type="hidden" name="alunoId" value={alunoId} />
          <input type="hidden" name="status" value="inativo" />
          <Button
            type="button"
            variant="secondary"
            block
            disabled={mudando}
            onClick={() => setConfirmando(null)}
          >
            {t.comum.cancelar}
          </Button>
          <Button type="submit" block disabled={mudando}>
            {mudando ? p.pausando : a.inativar}
          </Button>
        </form>
      </Dialog>

      <Dialog
        aberto={confirmando === "excluir"}
        aoFechar={() => setConfirmando(null)}
        titulo={preencher(a.excluirTitulo, { nome })}
        descricao={preencher(a.excluirTexto, { nome: primeiro })}
      >
        <form action={excluir} noValidate className="space-y-4">
          <input type="hidden" name="alunoId" value={alunoId} />
          {ativo ? (
            <p className="rounded-[10px] bg-canvas px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-3">
              {a.excluirAlternativa}
            </p>
          ) : null}
          <Input
            label={preencher(a.digite, { nome: primeiro })}
            name="confirmacao"
            autoComplete="off"
            autoFocus
            value={digitado}
            onChange={(e) => setDigitado(e.currentTarget.value)}
            error={exclusao.erro}
          />
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="secondary"
              block
              disabled={excluindo}
              onClick={() => setConfirmando(null)}
            >
              {t.comum.cancelar}
            </Button>
            <Button type="submit" variant="danger" block disabled={!nomeConfere || excluindo}>
              {excluindo ? a.excluindo : a.confirmarExclusao}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

function ItemDoMenu({
  perigo = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { perigo?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      {...props}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] font-medium transition focus-visible:outline-none disabled:opacity-60",
        perigo
          ? "text-danger hover:bg-danger-bg focus:bg-danger-bg"
          : "text-ink-2 hover:bg-canvas focus:bg-canvas",
        className,
      )}
    />
  );
}
