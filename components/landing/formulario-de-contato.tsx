"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { enviarContato } from "@/app/(marketing)/actions";
import { Button, Dialog, Input } from "@/components/ui";
import {
  OBJETIVOS_DO_CONTATO,
  type EstadoDoContato,
} from "@/lib/domain/contato";

const INICIAL: EstadoDoContato = {};

/**
 * "Entrar em contato", da versão para alunos da landing (protótipo
 * `Landing Page.dc.html`): nome, e-mail, WhatsApp, se já tem personal e o que
 * quer. O personal não tem formulário — tem "Entrar na lista", só com o
 * e-mail (02/10).
 *
 * Cada botão monta o seu formulário, e não há um diálogo só para a página:
 * o herói e o fechamento têm o mesmo botão, e um estado compartilhado entre
 * dois pontos da página precisaria de um componente cliente em volta dela
 * inteira — a landing inteira viraria JavaScript por causa de um diálogo.
 */
export function ChamadaDeContato({ rotulo }: { rotulo: string }) {
  const [aberto, setAberto] = useState(false);
  // A `key` muda a cada abertura: o formulário volta limpo, sem o "recebemos"
  // da vez anterior, e sem precisar zerar estado em efeito.
  const [vez, setVez] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setVez((v) => v + 1);
          setAberto(true);
        }}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-[14.5px] font-bold text-white shadow-cta transition hover:-translate-y-px hover:bg-brand-hover"
      >
        {rotulo}
      </button>

      <Dialog
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Entrar em contato"
        descricao="Deixe seus dados e nosso time retorna pelo WhatsApp."
        // `text-left`: o diálogo mora dentro do herói, que é centralizado.
        className="max-w-[480px] text-left"
      >
        <Formulario key={vez} aoFechar={() => setAberto(false)} />
      </Dialog>
    </>
  );
}

function Formulario({ aoFechar }: { aoFechar: () => void }) {
  const [estado, acao, enviando] = useActionState(enviarContato, INICIAL);
  const erros = estado.errosPorCampo ?? {};
  const campos = estado.campos;

  // O formulário é montado de novo a cada resposta, com os valores devolvidos
  // como padrão. Só `defaultValue` não basta: o React limpa o formulário depois
  // do envio, e o rádio e as caixas voltariam desmarcados.
  const [tentativa, setTentativa] = useState(0);
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    setTentativa((t) => t + 1);
  }

  if (estado.enviado) {
    return (
      <div role="status" className="space-y-4 py-2 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Check size={22} aria-hidden />
        </span>
        <div className="space-y-1.5">
          <p className="text-[17px] font-extrabold text-ink">
            Recebemos seu contato.
          </p>
          <p className="text-[13.5px] text-ink-3">
            Nossa equipe retorna pelo WhatsApp.
          </p>
        </div>
        <Button variant="secondary" onClick={aoFechar}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <form key={tentativa} action={acao} noValidate className="space-y-3.5">
      {/* Armadilha para robô: fora da tela, fora do teclado e do leitor de tela. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Site
          <input type="text" name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Input
        label="Nome"
        name="nome"
        autoComplete="name"
        placeholder="Seu nome"
        defaultValue={campos?.nome}
        error={erros.nome}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@email.com"
        defaultValue={campos?.email}
        error={erros.email}
      />
      <Input
        label="WhatsApp"
        name="telefone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(11) 90000-0000"
        defaultValue={campos?.telefone}
        error={erros.telefone}
      />

      <fieldset className="space-y-[7px]">
        <legend className="eyebrow mb-[7px] text-ink-3">
          Já tem personal ou consultoria?
        </legend>
        {/* Rádio de verdade, desenhado como pílula: as setas do teclado e
            o leitor de tela já sabem o que fazer com ele. */}
        <div className="flex gap-2.5">
          {(["sim", "nao"] as const).map((valor) => (
            <label
              key={valor}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border bg-surface text-[13.5px] font-semibold text-ink-2 transition hover:border-border-strong has-checked:border-brand has-checked:bg-brand has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"
            >
              <input
                type="radio"
                name="temPersonal"
                value={valor}
                defaultChecked={campos?.temPersonal === valor}
                aria-describedby={
                  erros.temPersonal ? "erro-tem-personal" : undefined
                }
                className="sr-only"
              />
              {valor === "sim" ? "Sim" : "Não"}
            </label>
          ))}
        </div>
        {erros.temPersonal ? (
          <p
            id="erro-tem-personal"
            className="text-[12.5px] font-semibold text-danger"
          >
            {erros.temPersonal}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="eyebrow mb-[7px] text-ink-3">
          Qual é o seu objetivo?
        </legend>
        {OBJETIVOS_DO_CONTATO.map((o) => (
          <label
            key={o.valor}
            className="flex min-h-9 items-center gap-2.5 text-[13.5px] text-ink-2"
          >
            <input
              type="checkbox"
              name="objetivos"
              value={o.valor}
              defaultChecked={campos?.objetivos.includes(o.valor)}
              className="size-4 accent-brand"
            />
            {o.rotulo}
          </label>
        ))}
        {erros.objetivos ? (
          <p className="text-[12.5px] font-semibold text-danger">
            {erros.objetivos}
          </p>
        ) : null}
      </fieldset>

      {estado.erro ? (
        <p
          role="alert"
          className="rounded-[10px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {estado.erro}
        </p>
      ) : null}

      <p className="text-[12px] leading-relaxed text-ink-4">
        Usamos esses dados só para responder você. Veja a{" "}
        <Link
          href="/privacidade#contato-pelo-site"
          className="font-semibold text-ink-2 underline"
        >
          política de privacidade
        </Link>
        .
      </p>

      <div className="flex gap-2.5 pt-1">
        <Button type="button" variant="secondary" block onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" block disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
