"use client";

import { useActionState, useState } from "react";

import { Button, EscolhaCards, Input } from "@/components/ui";
import { Logo } from "@/components/logo";
import { SeletorDeIdioma } from "@/components/seletor-de-idioma";
import { langDe, type Idioma } from "@/lib/domain/idioma";
import type { TextosDaAutenticacao } from "@/lib/i18n/autenticacao";
import {
  partesEmVolta,
  preencher,
  type TextosDoConvite,
} from "@/lib/i18n/convite";
import { VERSAO_DOS_DOCUMENTOS } from "@/lib/legal/documentos";
import { cn } from "@/lib/utils";

import { criarAcesso, type EstadoOnboarding } from "./actions";
import { erroDaSenha, regrasDaSenha } from "@/lib/domain/senha";
import { AceiteDosTermos } from "@/components/aceite-dos-termos";

const INICIAL: EstadoOnboarding = {};

/*
 * Os rótulos vêm do texto do convite, no idioma da tela. O painel lê estes
 * mesmos em inglês e espanhol (`lib/i18n/painel/rotulos.ts`); em português,
 * os dois são os de `lib/rotulos.ts`.
 */
const ICONES = { massa: "💪", gordura: "🔥", condicionamento: "🏃", saude: "❤️" } as const;

export function FormularioOnboarding({
  token,
  nome,
  email,
  personal,
  idioma,
  textos: t,
  aceite,
}: {
  token: string;
  nome: string;
  email: string;
  personal: string;
  idioma: Idioma;
  textos: TextosDoConvite;
  aceite: TextosDaAutenticacao["aceite"];
}) {
  const OBJETIVOS = (Object.keys(ICONES) as (keyof typeof ICONES)[]).map((valor) => ({
    valor,
    rotulo: t.objetivos[valor],
    icone: ICONES[valor],
  }));
  const NIVEIS = (["iniciante", "intermediario", "avancado"] as const).map((valor) => ({
    valor,
    rotulo: t.niveis[valor],
  }));
  const [estado, acao, enviando] = useActionState(criarAcesso, INICIAL);
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [senha, setSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [nivel, setNivel] = useState("");

  // Erro local da etapa 1, para não precisar de ida ao servidor só para
  // descobrir que a senha é curta.
  const [erroLocal, setErroLocal] = useState<{
    senha?: string;
    termos?: string;
  }>({});

  // Os dois passos ficam montados, então um erro em campo da etapa 1 vindo do
  // servidor renderiza dentro da div escondida: o aluno apertaria "Concluir" e
  // não veria nada acontecer. Voltar para a etapa é o que torna o erro visível.
  //
  // Ajuste durante a renderização, não em efeito: comparar com o resultado
  // anterior faz isso rodar uma vez por resposta do servidor, e o aluno segue
  // livre para navegar depois. Em efeito, seria um render em cascata.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.errosPorCampo?.senha || estado.errosPorCampo?.termos) {
      setEtapa(1);
    }
  }

  /**
   * Só deixa passar para a etapa 2 com a etapa 1 resolvida. As mesmas regras
   * rodam de novo no servidor — isto é conveniência, não segurança.
   */
  function avancar() {
    const erros: typeof erroLocal = {};

    // A mesma função que a Server Action usa: a etapa 1 não pode aceitar uma
    // senha que o servidor vai recusar na etapa 2, depois do aluno preencher
    // mais cinco campos.
    const erroDeSenha = erroDaSenha(senha, idioma);
    if (erroDeSenha) erros.senha = erroDeSenha;

    if (!aceitouTermos) {
      erros.termos = t.termosObrigatorios;
    }

    setErroLocal(erros);
    if (!erros.senha && !erros.termos) setEtapa(2);
  }

  const primeiroNome = nome.split(" ")[0];
  const [definaAntes, definaDepois] = partesEmVolta(t.defina, "personal");
  const [usaAntes, usaDepois] = partesEmVolta(t.usaEssesDados, "personal");

  if (estado.sucesso === "confirme-email") {
    return (
      <Moldura idioma={idioma} rotulo={t.idioma}>
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-13 items-center justify-center rounded-[15px] bg-brand-soft text-[22px] font-bold text-brand">
            ✓
          </div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
            {t.confirmeTitulo}
          </h1>
          <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
            {t.confirmeAntes} <strong className="text-ink">{email}</strong>
            {t.confirmeDepois}
          </p>
        </div>
      </Moldura>
    );
  }

  // A senha só some da tela ao trocar de etapa; os critérios abaixo dela
  // seguem o doc 05 (bolinha verde quando atendido).
  const criterios = regrasDaSenha(idioma).map((regra) => ({
    ok: regra.ok(senha),
    texto: regra.texto,
  }));

  return (
    <Moldura idioma={idioma} rotulo={t.idioma}>
      <form action={acao} noValidate className="space-y-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="nome" value={nome} />
        {/*
          A versão do texto vai junto com o aceite. O servidor não confia neste
          campo para saber qual é a vigente — ele lê a própria constante —, mas
          mandá-lo deixa registrado **qual texto estava na tela** de quem
          aceitou, que é a pergunta que importa se um dia alguém perguntar.
        */}
        <input
          type="hidden"
          name="termos_versao"
          value={VERSAO_DOS_DOCUMENTOS}
        />

        <header className="space-y-3.5">
          <p className="eyebrow text-ink-5">{preencher(t.etapa, { n: etapa })}</p>
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-1 flex-1 rounded-[2px] bg-brand" />
            <span
              className={cn(
                "h-1 flex-1 rounded-[2px] transition",
                etapa === 2 ? "bg-brand" : "bg-border",
              )}
            />
          </div>
        </header>

        {/* As duas etapas ficam montadas: a escondida mantém os valores no
            DOM, então um submit no fim envia tudo de uma vez. */}
        <div className={etapa === 1 ? "space-y-5" : "hidden"}>
          <div className="space-y-2">
            <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
              {preencher(t.quaseLa, { nome: primeiroNome })}
            </h1>
            <p className="text-[14px] leading-[1.5] text-ink-3">
              {definaAntes}
              <strong className="font-bold text-ink">{personal}</strong>
              {definaDepois}
            </p>
          </div>

          <div className="flex flex-col gap-[7px]">
            <span className="eyebrow text-ink-3">{t.email}</span>
            <div className="flex items-center gap-2 rounded-input border-[1.5px] border-border-soft bg-canvas-sunken px-3.5 py-[13px]">
              <span className="flex-1 truncate text-[14px] font-medium text-ink-2">
                {email}
              </span>
              <span
                aria-label={t.emailConfirmado}
                className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-white"
              >
                ✓
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Input
              label={t.senha}
              name="senha"
              type={mostrarSenha ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErroLocal((atual) => ({ ...atual, senha: undefined }));
              }}
              error={erroLocal.senha ?? estado.errosPorCampo?.senha}
              labelAction={
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="text-[12px] font-semibold text-brand transition hover:text-brand-hover"
                >
                  {mostrarSenha ? t.ocultar : t.mostrar}
                </button>
              }
            />

            <ul className="space-y-1.5">
              {criterios.map((c) => (
                <li key={c.texto} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "size-[7px] rounded-full transition",
                      c.ok ? "bg-success" : "bg-border-strong",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[12px] font-medium transition",
                      c.ok ? "text-ink-2" : "text-ink-5",
                    )}
                  >
                    {c.texto}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <AceiteDosTermos
            marcado={aceitouTermos}
            aoMarcar={(valor) => {
              setAceitouTermos(valor);
              setErroLocal((atual) => ({ ...atual, termos: undefined }));
            }}
            erro={erroLocal.termos ?? estado.errosPorCampo?.termos}
            textos={aceite}
          />

          <Button type="button" block size="lg" onClick={avancar}>
            {t.continuar}
          </Button>
        </div>

        <div className={etapa === 2 ? "space-y-5" : "hidden"}>
          <div className="space-y-2">
            <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
              {t.contaPraGente}
            </h1>
            <p className="text-[14px] leading-[1.5] text-ink-3">
              {usaAntes}
              <strong className="font-bold text-ink">{personal}</strong>
              {usaDepois}
            </p>
          </div>

          <EscolhaCards
            label={t.objetivo}
            name="objetivo"
            opcoes={OBJETIVOS}
            valor={objetivo}
            aoMudar={setObjetivo}
            error={estado.errosPorCampo?.objetivo}
          />

          {/*
            `defaultValue` vindo do estado da ação: o React **reseta** o
            formulário depois de uma Server Action, então tudo o que não é
            controlado volta vazio. Sem isto, uma falha que não é culpa do aluno
            — o limite de e-mail do Supabase, por exemplo — o obrigava a
            redigitar nascimento, peso e altura. Foi o que aconteceu no teste de
            campo. A senha fica de fora de propósito: ela não volta do servidor.
          */}
          <Input
            label={t.nascimento}
            name="nascimento"
            type="date"
            defaultValue={estado.campos?.nascimento}
            error={estado.errosPorCampo?.nascimento}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.peso}
              name="peso"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder={t.pesoPlaceholder}
              defaultValue={estado.campos?.peso}
              error={estado.errosPorCampo?.peso}
            />
            <Input
              label={t.altura}
              name="altura"
              type="number"
              inputMode="numeric"
              placeholder="180"
              defaultValue={estado.campos?.altura}
              error={estado.errosPorCampo?.altura}
            />
          </div>

          <EscolhaCards
            label={t.nivel}
            name="nivel"
            opcoes={NIVEIS}
            valor={nivel}
            aoMudar={setNivel}
            error={estado.errosPorCampo?.nivel}
            colunas={1}
          />

          {estado.erro && (
            <p
              role="alert"
              className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
            >
              {estado.erro}
            </p>
          )}

          <div className="space-y-2.5">
            <Button type="submit" block size="lg" disabled={enviando}>
              {enviando ? t.criando : t.concluir}
            </Button>
            <button
              type="button"
              onClick={() => setEtapa(1)}
              className="w-full text-center text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
            >
              {t.voltar}
            </button>
          </div>
        </div>
      </form>
    </Moldura>
  );
}

function Moldura({
  children,
  idioma,
  rotulo,
}: {
  children: React.ReactNode;
  idioma: Idioma;
  rotulo: string;
}) {
  return (
    <div lang={langDe(idioma)} className="min-h-dvh bg-canvas px-7 pt-[18px] pb-10">
      <div className="mx-auto w-full max-w-[440px]">
        <header className="mb-8 flex items-center justify-between gap-3 text-ink">
          <Logo size={26} />
          <SeletorDeIdioma idioma={idioma} rotulo={rotulo} />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
