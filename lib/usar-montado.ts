"use client";

import { useSyncExternalStore } from "react";

/** Nada muda depois de montar: a assinatura existe só para cumprir a API. */
const semAssinatura = () => () => {};

/**
 * `false` no servidor e no render de hidratação; `true` daí em diante.
 *
 * Existe para ler `localStorage` sem quebrar a hidratação e sem `setState`
 * dentro de efeito (que o lint do projeto recusa, e com razão: causa render em
 * cascata). `useSyncExternalStore` é o mecanismo oficial para isso — o React
 * usa o valor do servidor para hidratar e só depois troca pelo do cliente,
 * então o HTML dos dois lados nunca discorda.
 *
 * O uso típico aqui é trocar a `key` de um componente: ao virar `true`, ele
 * remonta e os inicializadores de `useState` já podem ler o armazenamento.
 */
export function useMontado(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}
