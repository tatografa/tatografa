/**
 * Avisa o fim do descanso com a tela apagada.
 *
 * O timer da execução continua sendo a fonte da verdade: ele guarda o instante
 * em que o descanso termina e deriva o restante do relógio, então mostra o
 * número certo mesmo depois de cinco minutos com o celular no bolso. O alarme é
 * um **extra** — se o navegador suspender o service worker, a tela ainda está
 * certa quando o aluno olha.
 *
 * A permissão é pedida no primeiro descanso, não na abertura do app: pedir
 * permissão antes de o usuário entender para que serve é como se perde a
 * permissão para sempre.
 */

/** Quanto tempo o alarme aceita agendar. Descanso maior que isso é engano. */
const MAXIMO_MS = 60 * 60 * 1000;

export function agendarAlarmeDeDescanso(segundos: number): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

  const emMs = Math.round(segundos * 1000);
  if (!Number.isFinite(emMs) || emMs <= 0 || emMs > MAXIMO_MS) return;

  const enviar = () => {
    if (Notification.permission !== "granted") return;
    navigator.serviceWorker.ready
      .then((registro) => {
        registro.active?.postMessage({ tipo: "descanso", emMs });
      })
      .catch(() => undefined);
  };

  if (Notification.permission === "default") {
    // `requestPermission` devolve promessa nos navegadores atuais; o retorno em
    // callback do Safari antigo cai no `catch` e o app segue sem alarme.
    Notification.requestPermission()
      .then(enviar)
      .catch(() => undefined);
    return;
  }

  enviar();
}
