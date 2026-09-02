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

const PREFIXO = "repsclub.execucao.fila.v1";

/**
 * Uma chave por sessão, e não uma chave global.
 *
 * Com chave única, entrar numa segunda sessão apagava a fila da primeira: o
 * efeito de persistência roda na montagem com a fila recém-inicializada
 * (vazia), e `removeItem` levava junto o que era da outra sessão. O caso real
 * é celular emprestado na academia — o aluno B começa a treinar e a fila do
 * aluno A vai embora.
 */
function chaveDoArmazenamento(sessionId: string): string {
  return `${PREFIXO}:${sessionId}`;
}

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
  /** Aviso sobre séries que o servidor recusou de vez. Não trava a conclusão. */
  aviso: string | null;
  /** Confirma (ou corrige) séries: local na hora, servidor depois. */
  registrar: (series: SerieDaExecucao[]) => void;
  /**
   * Tenta esvaziar a fila agora. Devolve **`true` só quando a fila ficou
   * vazia** — não "o lote que enviei foi aceito". A diferença é o que impede
   * de descartar uma série confirmada durante a conclusão.
   */
  esvaziar: () => Promise<boolean>;
  /** Apaga a fila persistida. Recusa se ainda houver série pendente. */
  descartar: () => boolean;
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
    usarArmazenamento ? lerFilaDeSessao(sessionId) : [],
  );
  const inicial = useMemo(
    () => Object.fromEntries(gravadaAoAbrir.map((i) => [chave(i.serie), i])),
    [gravadaAoAbrir],
  );

  /*
   * A fila tem duas caras: `filaRef` é a verdade, atualizada de forma síncrona,
   * e `fila` é o espelho para renderizar. Sem a ref, um `esvaziar()` que envia
   * em rodadas leria a fila de um render antigo entre um `await` e outro — e
   * concluiria "vazia" com série dentro.
   */
  const filaRef = useRef<Fila>(inicial);
  const [fila, setFilaEstado] = useState<Fila>(inicial);

  const [enviando, setEnviando] = useState(false);
  const [falhas, setFalhas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  // Continua de onde a fila gravada parou: reiniciar em 0 faria o `seq` de uma
  // série nova empatar com o de uma antiga ainda na fila.
  const proximoSeq = useRef(
    gravadaAoAbrir.reduce((maior, i) => Math.max(maior, i.seq), 0) + 1,
  );

  /** Único ponto de mudança da fila: ref e espelho andam sempre juntos. */
  const aplicar = useCallback((mudanca: (atual: Fila) => Fila) => {
    const novo = mudanca(filaRef.current);
    filaRef.current = novo;
    setFilaEstado(novo);
  }, []);

  useEffect(() => {
    if (!usarArmazenamento) return;
    gravar(sessionId, Object.values(fila));
  }, [fila, sessionId, usarArmazenamento]);

  const registrar = useCallback(
    (series: SerieDaExecucao[]) => {
      if (!series.length) return;
      aplicar((atual) => {
        const novo = { ...atual };
        for (const serie of series) {
          proximoSeq.current += 1;
          novo[chave(serie)] = { seq: proximoSeq.current, serie };
        }
        return novo;
      });
    },
    [aplicar],
  );

  /** Envia uma rodada. `true` se o lote foi aceito pelo servidor. */
  const enviarRodada = useCallback(async (): Promise<boolean> => {
    const foto = filaRef.current;
    const itens = Object.values(foto);
    if (!itens.length) return true;

    setEnviando(true);
    try {
      const resultado = await registrarSeries({
        sessionId,
        series: itens.map((i) => i.serie),
      });

      if (!resultado.ok) {
        if (resultado.permanente) {
          /*
           * Payload que o servidor nunca vai aceitar (a validação inteira
           * falhou). Manter na fila seria prometer um envio que não vem e
           * travar a conclusão do treino para sempre. Sai da fila com aviso —
           * a interface deste app não consegue produzir este caso.
           */
          aplicar((atual) => {
            const novo = { ...atual };
            for (const [k, item] of Object.entries(foto)) {
              if (novo[k]?.seq === item.seq) delete novo[k];
            }
            return novo;
          });
          setAviso(resultado.erro);
          return true;
        }
        setFalhas((n) => n + 1);
        return false;
      }

      // Séries que o servidor recusou uma a uma (o exercício saiu da
      // prescrição enquanto o aluno treinava). Elas saem da fila; as demais do
      // mesmo lote foram gravadas. Recusar o lote inteiro travaria séries
      // legítimas por causa de uma linha que não existe mais.
      const recusadas = new Set(resultado.recusadas ?? []);

      setConfirmadas((anterior) => {
        const novo = new Map(anterior);
        for (const item of itens) {
          const k = chave(item.serie);
          if (!recusadas.has(k)) novo.set(k, item.serie);
        }
        return novo;
      });

      // Só sai da fila o que foi enviado com este `seq`: uma correção feita
      // durante o envio tem `seq` maior e continua pendente.
      aplicar((atual) => {
        const novo = { ...atual };
        for (const [k, item] of Object.entries(foto)) {
          if (novo[k]?.seq === item.seq) delete novo[k];
        }
        return novo;
      });

      if (recusadas.size) {
        setAviso(
          recusadas.size === 1
            ? "1 série não pôde ser salva: o exercício saiu do treino."
            : `${recusadas.size} séries não puderam ser salvas: o exercício saiu do treino.`,
        );
      }
      setFalhas(0);
      return true;
    } catch {
      // Rede caída chega aqui como exceção da Server Action. Nada sai da fila.
      setFalhas((n) => n + 1);
      return false;
    } finally {
      setEnviando(false);
    }
  }, [aplicar, sessionId]);

  /**
   * Esvazia a fila de verdade: envia em rodadas enquanto houver item novo.
   *
   * Uma rodada só carrega o que existia quando ela começou. Se o aluno
   * confirmar uma série durante o envio (rede lenta e o dedo rápido), ela
   * entra depois e precisa de outra rodada. O teto de rodadas evita laço
   * infinito se algo continuar chegando.
   */
  const esvaziar = useCallback(async (): Promise<boolean> => {
    for (let rodada = 0; rodada < 4; rodada += 1) {
      if (!Object.keys(filaRef.current).length) return true;
      const aceitou = await enviarRodada();
      if (!aceitou) return false;
    }
    return Object.keys(filaRef.current).length === 0;
  }, [enviarRodada]);

  const pendentes = Object.keys(fila).length;

  // Disparo do envio: rápido no caso normal, com espera crescente depois de
  // falhar, até 15s. Sem o teto, uma academia sem sinal viraria uma sequência
  // infinita de tentativas imediatas gastando bateria.
  useEffect(() => {
    if (!pendentes || enviando) return;
    const atraso = falhas === 0 ? 250 : Math.min(15_000, 1_000 * 2 ** falhas);
    const relogio = setTimeout(() => void enviarRodada(), atraso);
    return () => clearTimeout(relogio);
  }, [pendentes, enviando, falhas, enviarRodada]);

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

  const descartar = useCallback((): boolean => {
    // Apagar a fila é a única operação irreversível deste arquivo: sem a
    // guarda, uma série confirmada entre o `await` da conclusão e este ponto
    // sumiria sem nunca ter chegado ao servidor.
    if (Object.keys(filaRef.current).length) return false;
    apagarFilaDeSessao(sessionId);
    return true;
  }, [sessionId]);

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
    aviso,
    registrar,
    esvaziar,
    descartar,
  };
}

function chave(serie: SerieDaExecucao): string {
  return chaveDaSerie(serie.workout_exercise_id, serie.set_number);
}

/**
 * A fila guardada para uma sessão. Exportada porque a tela de sessão pendente
 * precisa saber se o aparelho ainda guarda séries de **outra** sessão antes de
 * oferecer encerrá-la.
 *
 * Toda a leitura e escrita do armazenamento é defensiva: modo privado do
 * Safari e cota estourada fazem `localStorage` **lançar exceção**, e uma
 * exceção aqui derrubaria a tela de execução no meio do treino. Perder a
 * persistência é ruim; perder a tela é pior.
 */
export function lerFilaDeSessao(sessionId: string): ItemDaFila[] {
  // O inicializador de estado também roda no servidor, onde não há janela.
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(chaveDoArmazenamento(sessionId));
    if (!bruto) return [];
    const gravada = JSON.parse(bruto) as FilaGravada;
    // Redundância defensiva: a chave já é por sessão, então isto só pega
    // armazenamento corrompido — não é mais o que separa uma sessão da outra.
    if (gravada?.sessionId !== sessionId) return [];
    return Array.isArray(gravada.itens) ? gravada.itens : [];
  } catch {
    return [];
  }
}

/** As séries guardadas para uma sessão, prontas para reenvio. */
export function seriesGuardadasDe(sessionId: string): SerieDaExecucao[] {
  return lerFilaDeSessao(sessionId).map((item) => item.serie);
}

export function apagarFilaDeSessao(sessionId: string): void {
  try {
    window.localStorage.removeItem(chaveDoArmazenamento(sessionId));
  } catch {
    // Nada a fazer: a fila já foi esvaziada em memória.
  }
}

function gravar(sessionId: string, itens: ItemDaFila[]): void {
  try {
    // Só a chave desta sessão é tocada. Nunca `clear()`, nunca varredura por
    // prefixo: o aparelho pode guardar a fila de outra sessão.
    if (!itens.length) {
      window.localStorage.removeItem(chaveDoArmazenamento(sessionId));
      return;
    }
    const gravada: FilaGravada = { sessionId, itens };
    window.localStorage.setItem(
      chaveDoArmazenamento(sessionId),
      JSON.stringify(gravada),
    );
  } catch {
    // Sem persistência a fila continua valendo em memória até a aba fechar.
  }
}
