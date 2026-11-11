import { NVIDIA_GREEN } from "../data";

export const GREEN = NVIDIA_GREEN;
export const GREEN_SOFT = "#a6e22e";
export const BG = "#05070d";
export const FONT = "'Arial', 'Liberation Sans', 'DejaVu Sans', sans-serif";

/** Gerador pseudo-aleatório determinístico (mulberry32) — mesmo seed, mesma sequência. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
