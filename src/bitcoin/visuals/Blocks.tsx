import { rng } from "../../nvidia/visuals/common";
import { FONT } from "./BtcCommon";

export const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
export const RED = "#ff3b3b";
export const OK = "#3ddc84";

const HEX = "0123456789abcdef";

/** Hex pseudo-aleatório determinístico (mesmo seed → mesma string). */
export const hexFrom = (seed: number, len: number) => {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[Math.floor(r() * 16)];
  return s;
};

/** Bloco pequeno: cubo arredondado com rótulo e linhas de transações. */
export const MiniBlock: React.FC<{
  x: number;
  y: number;
  size: number;
  label: string;
  accent: string;
  state?: "ok" | "bad" | "dim";
  opacity?: number;
}> = ({ x, y, size, label, accent, state = "ok", opacity = 1 }) => {
  const color = state === "bad" ? RED : accent;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size * 0.16,
        background: "linear-gradient(160deg, rgba(24,30,42,0.98) 0%, rgba(10,14,21,0.98) 100%)",
        border: `${Math.max(3, size * 0.022)}px solid ${color}`,
        boxShadow: state === "dim" ? "none" : `0 0 ${size * 0.18}px ${color}66`,
        opacity: state === "dim" ? 0.35 * opacity : opacity,
        padding: size * 0.1,
        boxSizing: "border-box",
        fontFamily: FONT,
      }}
    >
      <div style={{ fontSize: size * 0.13, fontWeight: 900, color, letterSpacing: 1 }}>{label}</div>
      {[0.9, 0.7, 0.82, 0.6].map((w, i) => (
        <div
          key={i}
          style={{
            height: size * 0.055,
            width: `${w * 100}%`,
            borderRadius: size * 0.03,
            background: color,
            opacity: 0.45,
            marginTop: size * 0.075,
          }}
        />
      ))}
    </div>
  );
};

/** Elo de corrente entre dois blocos (pode aparecer quebrado). */
export const Link: React.FC<{ x: number; y: number; w: number; vertical?: boolean; color: string; broken?: boolean }> = ({
  x,
  y,
  w,
  vertical,
  color,
  broken,
}) => (
  <svg
    width={vertical ? 40 : w}
    height={vertical ? w : 40}
    style={{ position: "absolute", left: vertical ? x - 20 : x, top: vertical ? y : y - 20, overflow: "visible" }}
  >
    {vertical ? (
      broken ? (
        <>
          <line x1={20} y1={0} x2={20} y2={w * 0.38} stroke={color} strokeWidth={8} strokeLinecap="round" />
          <line x1={20} y1={w * 0.62} x2={20} y2={w} stroke={color} strokeWidth={8} strokeLinecap="round" />
          <line x1={6} y1={w * 0.42} x2={34} y2={w * 0.58} stroke={color} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : (
        <line x1={20} y1={0} x2={20} y2={w} stroke={color} strokeWidth={8} strokeLinecap="round" />
      )
    ) : (
      <line x1={0} y1={20} x2={w} y2={20} stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={broken ? "10 14" : undefined} />
    )}
  </svg>
);
