"use client";

import { useEffect } from "react";

/**
 * Registra o service worker e pede armazenamento persistente.
 *
 * **Sobre o armazenamento persistente, e sobre o que ele não resolve:** a fila
 * de séries vive no `localStorage` do aparelho até ser enviada. O handoff da
 * execução declara o limite — quem treina sem sinal e limpa os dados do
 * navegador perde a fila. `navigator.storage.persist()` protege contra o
 * descarte **automático** que o navegador faz sob pressão de disco. Não protege
 * contra o usuário limpando os dados de propósito, e nenhuma API do navegador
 * protege: quem apaga os dados do site apaga `localStorage` e IndexedDB junto.
 *
 * Por isso este componente não migra a fila para IndexedDB: a migração custaria
 * trabalho real e não entregaria o que o limite pede. O que reduz a janela de
 * perda continua sendo enviar cedo, que é o que a fila já faz, e mostrar o
 * contador de pendentes, que é o que torna o limite aceitável.
 */
export function RegistraServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Depois do load: registrar durante a hidratação disputa banda com o que a
    // tela precisa para aparecer.
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sem service worker o app inteiro continua funcionando — ele só deixa
        // de instalar e de ter a tela de offline. Não é erro para o usuário.
      });

      navigator.storage?.persist?.().catch(() => undefined);
    };

    if (document.readyState === "complete") registrar();
    else {
      window.addEventListener("load", registrar, { once: true });
      return () => window.removeEventListener("load", registrar);
    }
  }, []);

  return null;
}
