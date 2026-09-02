"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  chaveDaSerie,
  indexarSeries,
  mesclarSeries,
  type SerieDaExecucao,
} from "@/lib/domain/execucao";

import { registrarSeries } from "../actions";

/**
 * A fila de séries ainda não gravadas no servidor.
 *
 * Este arquivo é a razão do checkpoint técnico do card: é o que impede que uma
 * série que o aluno levantou se perca. O contrato é:
 *
 * 1. Confirmar uma série é **local e imediato** — a tela nunca espera a rede.
 * 2. A série entra na fila, que é gravada no `localStorage` **antes** de
 *    qualquer tentativa de envio. Fechar o app, recarregar a página ou o
 *    navegador ser morto pelo sistema não tira a série da fila.
 * 3. O envio é assíncrono, em lote, e reenviado sozinho: por tempo (com
 *    espera crescente), ao voltar a ter internet e ao a aba voltar a ficar
 *    visível.
 * 4. O servidor grava por `upsert` na tupla `(sessão, exercício, número da
 *    série)`, então reenviar a mesma série é sobrescrever, nunca duplicar.
 *
 * **Limite declarado e aceito pelo PM:** a fila mora no aparelho. Sem service
 * worker (Fase 4), um aluno que treine offline e limpe os dados do navegador
 * antes de recuperar sinal perde o que estava na fila. Por isso o contador de
 * pendentes é visível na tela o tempo todo — o limite só é aceitável enquanto
 * ele não for silencioso.
 */

const CHAVE = "repsclub.execucao.fila.v1";

/**
 * A ordem (`seq`) existe para o caso da correção durante um envio: se o aluno
 * corrige a série enquanto o valor antigo está viajando, o `seq` novo é maior
 * e a resposta do envio antigo não apaga a correção da fila.
 */
type ItemDaFila = { seq: number; serie: SerieDaExecucao };
type Fila = Record<string, ItemDaFila>;

type FilaGravada = { sessionId: string; itens: ItemDaFila[] };

export type EstadoDaFila = {
  /** A visão que a tela usa: o que o servidor tem, coberto pelo que a fila tem. */
  series: Map<string, SerieDaExecucao>;
  pendentes: number;
  enviando: boolean;
  /** Erro que não adianta tentar de novo. A tela mostra e para de prometer. */
  erroPermanente: string | null;
  /** Confirma (ou corrige) séries: local na hora, servidor depois. */
  registrar: (series: SerieDaExecucao[]) => void;
  /** Tenta esvaziar a fila agora. `true` se o servidor tem tudo. */
  esvaziar: () => Promise<boolean>;
  /** Apaga a fila persistida. Só depois que o treino fecha. */
  descartar: () => void;
};

export function useFilaDeSeries(
  sessionId: string,
  doServidor: SerieDaExecucao[],
  /**
   * `false` no servidor e no render de hidratação, `true` depois.
   *
   * Não basta testar `typeof window`: no render de hidratação a janela já
   * existe, e ler a fila ali faria o cliente desenhar séries que não estão no
   * HTML do servidor. Pior, o efeito de persistência rodaria com a fila ainda
   * vazia e **apagaria** o que estava guardado — exatamente o dado que este
   * arquivo existe para proteger.
   */
  usarArmazenamento: boolean,
): EstadoDaFila {
  // O que o servidor já confirmou. Começa com o que a página trouxe e cresce a
  // cada envio bem-sucedido — sem isso, a série sairia da fila ao ser gravada
  // e sumiria da tela, porque as props do servidor são do primeiro render.
  const [confirmadas, setConfirmadas] = useState<Map<string, SerieDaExecucao>>(
    () => indexarSeries(doServidor),
  );
  // A fila persistida entra pelo inicializador do estado, não por um efeito:
  // `setState` dentro de efeito causa render em cascata (e o lint do projeto
  // recusa). Quem garante que isto só roda no cliente é o `useMontado` da tela,
  // que remonta este componente depois da hidratação.
  const [gravadaAoAbrir] = useState(() =>
    usarArmazenamento ? ler(sessionId) : [],
  );
  const [fila, setFila] = useState<Fila>(() =>
    Object.fromEntries(gravadaAoAbrir.map((i) => [chave(i.serie), i])),
  );
  const [enviando, setEnviando] = useState(false);
  const [falhas, setFalhas] = useState(0);
  const [erroPermanente, setErroPermanente] = useState<string | null>(null);
  // Continua de onde a fila gravada parou: reiniciar em 0 faria o `seq` de uma
  // série nova empatar com o de uma antiga ainda na fila.
  const proximoSeq = useRef(
    gravadaAoAbrir.reduce((maior, i) => Math.max(maior, i.seq), 0) + 1,
  );

  useEffect(() => {
    if (!usarArmazenamento) return;
    gravar(sessionId, Object.values(fila));
  }, [fila, sessionId, usarArmazenamento]);

  const registrar = useCallback((series: SerieDaExecucao[]) => {
    if (!series.length) return;
    setFila((anterior) => {
      const novo = { ...anterior };
      for (const serie of series) {
        proximoSeq.current += 1;
        novo[chave(serie)] = { seq: proximoSeq.current, serie };
      }
      return novo;
    });
  }, []);

  // `enviar` lê a fila por ref para não ser recriada a cada confirmação — a
  // função é dependência do efeito de disparo, e recriá-la reiniciaria a espera
  // do reenvio a cada tecla.
  const filaRef = useRef<Fila>(fila);
  useEffect(() => {
    filaRef.current = fila;
  }, [fila]);

  const enviar = useCallback(async (): Promise<boolean> => {
    const foto = filaRef.current;
    const itens = Object.values(foto);
    if (!itens.length) return true;

    setEnviando(true);
    try {
      const resultado = await registrarSeries({
        sessionId,
        series: itens.map((i) => i.serie),
      });

      if (resultado.ok) {
        setConfirmadas((anterior) => {
          const novo = new Map(anterior);
          for (const item of itens) novo.set(chave(item.serie), item.serie);
          return novo;
        });
        // Só sai da fila o que foi enviado com este `seq`: uma correção feita
        // durante o envio tem `seq` maior e continua pendente.
        setFila((anterior) => {
          const novo = { ...anterior };
          for (const [k, item] of Object.entries(foto)) {
            if (novo[k]?.seq === item.seq) delete novo[k];
          }
          return novo;
        });
        setFalhas(0);
        return true;
      }

      if (resultado.permanente) setErroPermanente(resultado.erro);
      setFalhas((n) => n + 1);
      return false;
    } catch {
      // Rede caída chega aqui como exceção da Server Action. Nada sai da fila.
      setFalhas((n) => n + 1);
      return false;
    } finally {
      setEnviando(false);
    }
  }, [sessionId]);

  const pendentes = Object.keys(fila).length;

  // Disparo do envio: rápido no caso normal, com espera crescente depois de
  // falhar, até 15s. Sem o teto, uma academia sem sinal viraria uma sequência
  // infinita de tentativas imediatas gastando bateria.
  useEffect(() => {
    if (!pendentes || enviando || erroPermanente) return;
    const atraso = falhas === 0 ? 250 : Math.min(15_000, 1_000 * 2 ** falhas);
    const relogio = setTimeout(() => void enviar(), atraso);
    return () => clearTimeout(relogio);
  }, [pendentes, enviando, falhas, erroPermanente, enviar]);

  // Voltar a ter internet, ou voltar para a aba, são os dois momentos em que
  // vale tentar na hora em vez de esperar a próxima janela do backoff.
  useEffect(() => {
    const tentarAgora = () => setFalhas(0);
    window.addEventListener("online", tentarAgora);
    document.addEventListener("visibilitychange", tentarAgora);
    return () => {
      window.removeEventListener("online", tentarAgora);
      document.removeEventListener("visibilitychange", tentarAgora);
    };
  }, []);

  // Último aviso antes de fechar a aba com série ainda não enviada. Não é
  // proteção — o navegador pode ignorar —, é a chance de o aluno voltar e
  // esperar a barra zerar.
  useEffect(() => {
    if (!pendentes) return;
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [pendentes]);

  const descartar = useCallback(() => {
    setFila({});
    apagar();
  }, []);

  const series = useMemo(
    () =>
      mesclarSeries(
        [...confirmadas.values()],
        Object.values(fila).map((i) => i.serie),
      ),
    [confirmadas, fila],
  );

  return {
    series,
    pendentes,
    enviando,
    erroPermanente,
    registrar,
    esvaziar: enviar,
    descartar,
  };
}

function chave(serie: SerieDaExecucao): string {
  return chaveDaSerie(serie.workout_exercise_id, serie.set_number);
}

/**
 * Toda a leitura e escrita do armazenamento é defensiva: modo privado do
 * Safari e cota estourada fazem `localStorage` **lançar exceção**, e uma
 * exceção aqui derrubaria a tela de execução no meio do treino. Perder a
 * persistência é ruim; perder a tela é pior.
 */
function ler(sessionId: string): ItemDaFila[] {
  // O inicializador de estado também roda no servidor, onde não há janela.
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const gravada = JSON.parse(bruto) as FilaGravada;
    // Fila de outra sessão não serve para esta: as chaves são por sessão no
    // banco, e reaproveitar gravaria série de um treino em outro.
    if (gravada?.sessionId !== sessionId) return [];
    return Array.isArray(gravada.itens) ? gravada.itens : [];
  } catch {
    return [];
  }
}

function gravar(sessionId: string, itens: ItemDaFila[]): void {
  try {
    if (!itens.length) {
      window.localStorage.removeItem(CHAVE);
      return;
    }
    const gravada: FilaGravada = { sessionId, itens };
    window.localStorage.setItem(CHAVE, JSON.stringify(gravada));
  } catch {
    // Sem persistência a fila continua valendo em memória até a aba fechar.
  }
}

function apagar(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // Nada a fazer: a fila já foi esvaziada em memória.
  }
}
