"use client";

import { useActionState, useState } from "react";

import { Button, EscolhaCards, Input } from "@/components/ui";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

import { criarAcesso, type EstadoOnboarding } from "./actions";

const INICIAL: EstadoOnboarding = {};

const OBJETIVOS = [
  { valor: "massa", rotulo: "Ganhar massa", icone: "💪" },
  { valor: "gordura", rotulo: "Perder gordura", icone: "🔥" },
  { valor: "condicionamento", rotulo: "Condicionamento", icone: "🏃" },
  { valor: "saude", rotulo: "Saúde", icone: "❤️" },
];

const NIVEIS = [
  { valor: "iniciante", rotulo: "Iniciante" },
  { valor: "intermediario", rotulo: "Intermediário" },
  { valor: "avancado", rotulo: "Avançado" },
];

export function FormularioOnboarding({
  token,
  nome,
  email,
  personal,
}: {
  token: string;
  nome: string;
  email: string;
  personal: string;
}) {
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

    if (senha.length < 8) {
      erros.senha = "A senha precisa de pelo menos 8 caracteres.";
    } else if (!/[a-zA-Z]/.test(senha)) {
      erros.senha = "A senha precisa de pelo menos uma letra.";
    } else if (!/[0-9]/.test(senha)) {
      erros.senha = "A senha precisa de pelo menos um número.";
    }

    if (!aceitouTermos) {
      erros.termos = "É preciso aceitar os termos para continuar.";
    }

    setErroLocal(erros);
    if (!erros.senha && !erros.termos) setEtapa(2);
  }

  const primeiroNome = nome.split(" ")[0];

  if (estado.sucesso === "confirme-email") {
    return (
      <Moldura>
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-13 items-center justify-center rounded-[15px] bg-brand-soft text-[22px] font-bold text-brand">
            ✓
          </div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
            Confirme seu e-mail
          </h1>
          <p className="text-[14px] font-medium leading-[1.6] text-ink-3">
            Enviamos um link para <strong className="text-ink">{email}</strong>.
            Abra o link e seus treinos estarão prontos.
          </p>
        </div>
      </Moldura>
    );
  }

  // A senha só some da tela ao trocar de etapa; os critérios abaixo dela
  // seguem o doc 05 (bolinha verde quando atendido).
  const criterios = [
    { ok: senha.length >= 8, texto: "Pelo menos 8 caracteres" },
    { ok: /[a-zA-Z]/.test(senha), texto: "Uma letra" },
    { ok: /[0-9]/.test(senha), texto: "Um número" },
  ];

  return (
    <Moldura>
      <form action={acao} noValidate className="space-y-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="nome" value={nome} />

        <header className="space-y-3.5">
          <p className="eyebrow text-ink-5">Etapa {etapa} de 2</p>
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
              Quase lá, {primeiroNome}!
            </h1>
            <p className="text-[14px] leading-[1.5] text-ink-3">
              Defina sua senha para acessar os treinos da{" "}
              <strong className="font-bold text-ink">{personal}</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-[7px]">
            <span className="eyebrow text-ink-3">E-mail</span>
            <div className="flex items-center gap-2 rounded-input border-[1.5px] border-border-soft bg-canvas-sunken px-3.5 py-[13px]">
              <span className="flex-1 truncate text-[14px] font-medium text-ink-2">
                {email}
              </span>
              <span
                aria-label="E-mail confirmado pelo convite"
                className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-white"
              >
                ✓
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Input
              label="Senha"
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
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
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

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              name="termos"
              checked={aceitouTermos}
              onChange={(e) => {
                setAceitouTermos(e.target.checked);
                setErroLocal((atual) => ({ ...atual, termos: undefined }));
              }}
              className="mt-0.5 size-4 shrink-0 accent-brand"
            />
            <span className="text-[12.5px] leading-[1.5] text-ink-3">
              Aceito os termos de uso e a política de privacidade do Reps Club.
            </span>
          </label>
          {(erroLocal.termos ?? estado.errosPorCampo?.termos) && (
            <p className="text-[12.5px] font-semibold text-danger">
              {erroLocal.termos ?? estado.errosPorCampo?.termos}
            </p>
          )}

          <Button type="button" block size="lg" onClick={avancar}>
            Continuar
          </Button>
        </div>

        <div className={etapa === 2 ? "space-y-5" : "hidden"}>
          <div className="space-y-2">
            <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-ink">
              Conta pra gente
            </h1>
            <p className="text-[14px] leading-[1.5] text-ink-3">
              A <strong className="font-bold text-ink">{personal}</strong> usa
              esses dados para montar e ajustar seus treinos.
            </p>
          </div>

          <EscolhaCards
            label="Objetivo principal"
            name="objetivo"
            opcoes={OBJETIVOS}
            valor={objetivo}
            aoMudar={setObjetivo}
            error={estado.errosPorCampo?.objetivo}
          />

          <Input
            label="Data de nascimento"
            name="nascimento"
            type="date"
            error={estado.errosPorCampo?.nascimento}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Peso atual (kg)"
              name="peso"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="78,5"
              error={estado.errosPorCampo?.peso}
            />
            <Input
              label="Altura (cm)"
              name="altura"
              type="number"
              inputMode="numeric"
              placeholder="180"
              error={estado.errosPorCampo?.altura}
            />
          </div>

          <EscolhaCards
            label="Nível de experiência"
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
              {enviando ? "Criando…" : "Concluir e entrar"}
            </Button>
            <button
              type="button"
              onClick={() => setEtapa(1)}
              className="w-full text-center text-[12.5px] font-semibold text-ink-4 transition hover:text-ink-2"
            >
              Voltar
            </button>
          </div>
        </div>
      </form>
    </Moldura>
  );
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas px-7 pt-[18px] pb-10">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-8 text-ink">
          <Logo size={26} />
        </div>
        {children}
      </div>
    </div>
  );
}
