"use client";

import { Globe, KeyRound, LogOut, Pencil, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";

import { BotaoSair } from "@/components/botao-sair";
import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Input } from "@/components/ui";
import { iniciaisDe } from "@/lib/domain/nome";
import { dicaDaSenha } from "@/lib/domain/senha";
import { formatarTelefone } from "@/lib/domain/telefone";

import { salvarPerfil, trocarSenha, type EstadoDaSenha, type EstadoDoPerfil } from "./actions";
import { AjusteDeAlerta } from "./ajuste-de-alerta";

/**
 * Configurações no layout do protótipo (28/09): o cartão do perfil em cima, com
 * o "Editar" no cabeçalho da página, e embaixo dois cartões lado a lado.
 *
 * **O que o protótipo tem e não entrou.** *"Plano e assinatura"* (plano, cartão,
 * faturas): não há cobrança no modelo de dados (18/09), e o lugar ficou com o
 * **alerta de inatividade**, que é a configuração que muda o que o painel
 * mostra. *"Nome da consultoria"*: seria uma coluna nova que nenhuma outra tela
 * lê — um campo que se preenche e não aparece em lugar nenhum. *2FA*: o
 * Supabase tem, mas ligar é um fluxo inteiro (cadastro do fator, desafio no
 * login, recuperação), não um interruptor; um interruptor que não protege nada
 * é pior que nenhum. *"Sua conta está protegida por criptografia de ponta a
 * ponta"*: não é verdade — o banco lê os dados, é assim que o personal vê o
 * treino do aluno —, e uma tela de segurança é o último lugar para uma frase
 * falsa. *"Última alteração há 3 meses"*: o Supabase não guarda quando a senha
 * mudou.
 *
 * Componente cliente inteiro porque o botão "Editar" do cabeçalho abre o
 * cartão do perfil — o estado é um só, e o cabeçalho é daqui.
 */
export function TelaDeConfiguracoes({
  idioma,
  nome,
  email,
  telefone,
  diasParaAlerta,
}: {
  /** O seletor de idioma, montado no servidor pela página. */
  idioma: React.ReactNode;
  nome: string;
  email: string;
  telefone: string | null;
  diasParaAlerta: number;
}) {
  const [editando, setEditando] = useState(false);
  const c = usePainel().t.configuracoes;

  return (
    <>
      <CabecalhoDaPagina
        titulo={c.titulo}
        subtitulo={c.subtitulo}
        acoes={
          editando ? null : (
            <Button size="sm" onClick={() => setEditando(true)}>
              <Pencil size={14} aria-hidden />
              {c.editarPerfil}
            </Button>
          )
        }
      />

      <div className="@container space-y-4">
        <Perfil
          nome={nome}
          email={email}
          telefone={telefone}
          editando={editando}
          aoFechar={() => setEditando(false)}
        />

        <div className="grid items-start gap-4 @min-[820px]:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Cartao titulo={c.alerta.titulo}>
              <div className="p-5">
                <AjusteDeAlerta dias={diasParaAlerta} />
              </div>
            </Cartao>
            {/* A opção só existe depois que o painel inteiro foi traduzido
                (etapa 3, 05/10): seletor que troca a sigla e deixa a tela em
                português é controle mentindo. */}
            <Cartao
              titulo={c.idioma.titulo}
              lateral={<Globe size={17} aria-hidden className="text-ink-4" />}
            >
              <div className="px-5 pt-3 pb-4">
                <p className="mb-1 text-[12.5px] leading-relaxed text-ink-4">{c.idioma.apoio}</p>
                {idioma}
              </div>
            </Cartao>
          </div>
          <Seguranca />
        </div>
      </div>
    </>
  );
}

function Cartao({
  titulo,
  lateral,
  children,
}: {
  titulo: string;
  lateral?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[12px] border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border-soft px-5 py-4">
        <h2 className="text-[14px] font-medium text-ink">{titulo}</h2>
        {lateral}
      </header>
      {children}
    </section>
  );
}

const PERFIL_INICIAL: EstadoDoPerfil = {};

function Perfil({
  nome,
  email,
  telefone,
  editando,
  aoFechar,
}: {
  nome: string;
  email: string;
  telefone: string | null;
  editando: boolean;
  aoFechar: () => void;
}) {
  const [estado, acao, enviando] = useActionState(salvarPerfil, PERFIL_INICIAL);
  const { t } = usePainel();
  const p = t.configuracoes.perfil;

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto usa desde o onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) aoFechar();
  }

  return (
    <Cartao titulo={p.titulo}>
      <div className="flex flex-col gap-6 p-5 @min-[640px]:flex-row @min-[640px]:items-start">
        <span
          aria-hidden
          className="flex size-20 shrink-0 items-center justify-center rounded-full bg-brand text-[26px] font-bold text-white"
        >
          {iniciaisDe(nome)}
        </span>

        {editando ? (
          <form action={acao} noValidate className="min-w-0 flex-1 space-y-4">
            <div className="grid gap-4 @min-[640px]:grid-cols-2">
              <Input
                label={p.nome}
                name="nome"
                autoComplete="name"
                autoFocus
                defaultValue={estado.campos?.nome ?? nome}
                error={estado.errosPorCampo?.nome}
                hint={p.nomeApoio}
              />
              <Input
                label={p.whatsapp}
                name="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={p.whatsappExemplo}
                defaultValue={estado.campos?.telefone ?? formatarTelefone(telefone)}
                error={estado.errosPorCampo?.telefone}
                hint={p.whatsappApoio}
              />
            </div>
            <dl>
              <Campo rotulo={p.email} valor={email} apoio={p.emailNaoEdita} />
            </dl>

            {estado.erro ? (
              <p role="alert" className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger">
                {estado.erro}
              </p>
            ) : null}

            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" size="sm" onClick={aoFechar}>
                {t.comum.cancelar}
              </Button>
              <Button type="submit" size="sm" disabled={enviando}>
                {enviando ? t.comum.salvando : t.comum.salvar}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-5 @min-[640px]:grid-cols-2">
            <Campo rotulo={p.nome} valor={nome} apoio={p.nomeApoio} />
            <Campo rotulo={p.email} valor={email} apoio={p.emailLogin} />
            <Campo
              rotulo={p.whatsapp}
              valor={telefone ? formatarTelefone(telefone) : t.comum.naoInformado}
              apoio={telefone ? p.comWhatsapp : p.semWhatsapp}
            />
          </dl>
        )}
      </div>
    </Cartao>
  );
}

/** Um par rótulo/valor, sempre dentro de um `<dl>`. No formulário, o e-mail só se lê. */
function Campo({ rotulo, valor, apoio }: { rotulo: string; valor: string; apoio?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-ink-4">{rotulo}</dt>
      <dd className="mt-1 text-[14.5px] font-semibold break-words text-ink">{valor}</dd>
      {apoio ? <dd className="mt-0.5 text-[12px] text-ink-5">{apoio}</dd> : null}
    </div>
  );
}

const SENHA_INICIAL: EstadoDaSenha = {};

function Seguranca() {
  const [estado, acao, enviando] = useActionState(trocarSenha, SENHA_INICIAL);
  const [trocando, setTrocando] = useState(false);
  // A `key` do formulário muda a cada tentativa com erro: campos de senha não
  // voltam preenchidos (a ação não devolve senha nenhuma), então o React
  // precisa montar o formulário limpo de novo — sem isso, o que ficou
  // digitado e o erro ao lado discordariam.
  const [tentativa, setTentativa] = useState(0);
  const { idioma, t } = usePainel();
  const s = t.configuracoes.seguranca;

  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) setTrocando(false);
    else setTentativa((t) => t + 1);
  }

  return (
    <Cartao titulo={s.titulo} lateral={<ShieldCheck size={17} aria-hidden className="text-success" />}>
      <div className="space-y-4 p-5">
        <div className="rounded-[12px] border border-border-soft bg-canvas p-4">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <KeyRound size={15} aria-hidden />
            {s.senha}
          </p>
          {trocando ? (
            <form key={tentativa} action={acao} noValidate className="mt-3 space-y-3">
              <Input
                label={s.atual}
                name="atual"
                type="password"
                autoComplete="current-password"
                autoFocus
                error={estado.errosPorCampo?.atual}
              />
              <Input
                label={s.nova}
                name="nova"
                type="password"
                autoComplete="new-password"
                error={estado.errosPorCampo?.nova}
                hint={dicaDaSenha(idioma)}
              />
              <Input
                label={s.repita}
                name="confirmacao"
                type="password"
                autoComplete="new-password"
                error={estado.errosPorCampo?.confirmacao}
              />
              {estado.erro ? (
                <p role="alert" className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger">
                  {estado.erro}
                </p>
              ) : null}
              <div className="flex gap-2.5">
                <Button type="button" variant="secondary" size="sm" onClick={() => setTrocando(false)}>
                  {t.comum.cancelar}
                </Button>
                <Button type="submit" size="sm" disabled={enviando}>
                  {enviando ? s.trocando : s.trocar}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-4" role={estado.sucesso ? "status" : undefined}>
                {estado.sucesso ? s.trocada : s.pedimosAtual}
              </p>
              <Button size="sm" block className="mt-3" onClick={() => setTrocando(true)}>
                {s.trocar}
              </Button>
            </>
          )}
        </div>

        <div className="rounded-[12px] border border-border-soft bg-canvas p-4">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
            <LogOut size={15} aria-hidden />
            {s.sair}
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-4">{s.sairApoio}</p>
          <div className="mt-3">
            <BotaoSair block rotulo={s.sair} rotuloSaindo={t.comum.nav.saindo} />
          </div>
        </div>
      </div>
    </Cartao>
  );
}
