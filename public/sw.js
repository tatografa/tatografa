/*
 * Service worker do Reps Club.
 *
 * ============================ A REGRA QUE MANDA ============================
 *
 * **Nenhuma resposta de navegação entra no cache. Nunca.**
 *
 * Toda página deste app é autenticada e pessoal: `/app` mostra o treino de um
 * aluno, `/painel` mostra a carteira de um personal. HTML cacheado é HTML que
 * pode ser servido para a próxima pessoa que abrir o app no mesmo aparelho —
 * celular emprestado na academia é caso real aqui. Um erro nesta linha mostra o
 * treino de um aluno para outro, e nenhuma policy do banco pega isso: o RLS
 * protege a API, não o que o navegador guardou.
 *
 * O que entra no cache é só o que **não tem dono**: o build estático do Next
 * (com hash no nome, imutável), ícones, manifest e a página `/offline`, que é
 * pública e não mostra dado de ninguém.
 *
 * ============================ O QUE ISSO ENTREGA ===========================
 *
 * - App instalado abre sem barra de navegador e com ícone próprio.
 * - Sem sinal, a navegação cai numa página que explica, em vez de no erro do
 *   navegador.
 * - Com o app **já aberto**, a execução continua registrando série offline —
 *   isso já funcionava antes deste arquivo, porque a fila é local.
 *
 * O que ele NÃO entrega, de propósito: abrir o treino do zero sem sinal. Isso
 * exigiria cachear página autenticada.
 */

const VERSAO = "reps-club-v1";
const ESTATICO = `${VERSAO}-estatico`;
const OFFLINE = "/offline";

/** Pré-carrega só o que é público e serve para a tela de fallback. */
const ESSENCIAIS = [OFFLINE, "/icone-192.png", "/logo.svg"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(ESTATICO)
      .then((cache) => cache.addAll(ESSENCIAIS))
      // Falhar aqui não pode impedir a instalação: sem esses arquivos o app
      // ainda funciona online, que é o caso normal.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => !chave.startsWith(VERSAO))
            .map((chave) => caches.delete(chave)),
        ),
      )
      // Assume o controle das abas abertas já nesta ativação: sem isto, a
      // versão nova só valeria depois de fechar todas as abas, e o aluno ficaria
      // numa versão velha sem saber.
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;

  // Só GET. POST é Server Action — e Server Action nunca vem do cache.
  if (requisicao.method !== "GET") return;

  const url = new URL(requisicao.url);

  // Outro domínio (fonte do Google, por exemplo): deixa o navegador resolver.
  if (url.origin !== self.location.origin) return;

  // Navegação: rede sempre, e a página de offline como rede de segurança.
  // A resposta **não** é guardada.
  if (requisicao.mode === "navigate") {
    evento.respondWith(
      fetch(requisicao).catch(() =>
        caches.match(OFFLINE).then(
          (resposta) =>
            resposta ??
            new Response(
              "<!doctype html><meta charset=utf-8><title>Sem conexão</title><p>Sem conexão.",
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            ),
        ),
      ),
    );
    return;
  }

  // Build do Next: nome com hash, conteúdo imutável. Cache primeiro.
  const imutavel =
    url.pathname.startsWith("/_next/static/") ||
    ESSENCIAIS.includes(url.pathname);

  if (!imutavel) return;

  evento.respondWith(
    caches.match(requisicao).then((doCache) => {
      if (doCache) return doCache;
      return fetch(requisicao).then((resposta) => {
        // `basic` = mesma origem e resposta completa. Opaca ou parcial (206)
        // no cache vira arquivo quebrado servido para sempre.
        if (resposta.ok && resposta.type === "basic") {
          const copia = resposta.clone();
          caches.open(ESTATICO).then((cache) => cache.put(requisicao, copia));
        }
        return resposta;
      });
    }),
  );
});

/*
 * Alarme de fim de descanso.
 *
 * A tela de execução agenda o instante do fim (ela já guarda `descansoAte` como
 * timestamp, nunca como contador) e o service worker avisa mesmo com a tela
 * apagada — que é exatamente quando o aluno precisa do aviso e não está olhando.
 *
 * `setTimeout` aqui é aceitável porque o descanso é de segundos a minutos: o
 * navegador pode suspender o worker em espera longa, e por isso a tela continua
 * mostrando o tempo certo por conta própria. O alarme é um extra, não a
 * fonte da verdade.
 */
self.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || dados.tipo !== "descanso") return;

  const emMs = Number(dados.emMs);
  if (!Number.isFinite(emMs) || emMs <= 0 || emMs > 60 * 60 * 1000) return;

  setTimeout(() => {
    if (self.registration.showNotification) {
      self.registration
        .showNotification("Descanso terminou", {
          body: "Hora da próxima série.",
          icon: "/icone-192.png",
          badge: "/icone-192.png",
          vibrate: [200, 80, 200],
          tag: "descanso",
          renotify: true,
        })
        .catch(() => undefined);
    }
  }, emMs);
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  evento.waitUntil(
    self.clients.matchAll({ type: "window" }).then((janelas) => {
      const aberta = janelas.find((janela) => janela.url.includes("/app"));
      if (aberta) return aberta.focus();
      return self.clients.openWindow("/app");
    }),
  );
});
