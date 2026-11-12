import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";

/** Painel com cabeçalho (kicker + título) e corpo. */
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  kicker?: string;
  title?: string;
  delay?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, kicker, title, delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        padding: "26px 30px",
        borderRadius: 28,
        background: "linear-gradient(180deg, rgba(14,20,30,0.92) 0%, rgba(8,12,19,0.92) 100%)",
        border: "1.5px solid rgba(118,185,0,0.35)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
        fontFamily: FONT,
        color: "white",
      }}
    >
      {kicker && (
        <div style={{ fontSize: 24, letterSpacing: 6, fontWeight: 800, color: GREEN, opacity: 0.95 }}>
          {kicker}
        </div>
      )}
      {title && (
        <div style={{ fontSize: 44, fontWeight: 900, marginTop: 6, lineHeight: 1.05 }}>{title}</div>
      )}
      {children}
    </div>
  );
};

/** Número grande com gradiente. */
export const BigNumber: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 120,
  color = GREEN,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: -2,
      color,
      textShadow: `0 0 40px ${color}55, 0 8px 30px rgba(0,0,0,0.8)`,
    }}
  >
    {children}
  </div>
);

/** Etiqueta arredondada. */
export const Pill: React.FC<{ children: React.ReactNode; color?: string; bg?: string; size?: number }> = ({
  children,
  color = "#05070d",
  bg = GREEN,
  size = 26,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 800,
      color,
      background: bg,
      padding: "8px 18px",
      borderRadius: 999,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

/** Linha de legenda: ícone + nome + valor + barra animada. */
export const LegendRow: React.FC<{
  icon: React.ReactNode;
  name: string;
  value: string;
  pct: number;
  color: string;
  delay: number;
}> = ({ icon, name, value, pct, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: `${color}22`,
          border: `1.5px solid ${color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 800, color: "white" }}>
          <span>{name}</span>
          <span style={{ color }}>{value}</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.08)", marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct * s}%`, height: "100%", background: color, borderRadius: 5 }} />
        </div>
      </div>
    </div>
  );
};

/** Eixos + grade para gráficos SVG. */
export const Grid: React.FC<{ x: number; y: number; w: number; h: number; rows?: number; cols?: number }> = ({
  x,
  y,
  w,
  h,
  rows = 4,
  cols = 5,
}) => (
  <g stroke="rgba(255,255,255,0.08)" strokeWidth={1.5}>
    {Array.from({ length: rows + 1 }, (_, i) => (
      <line key={`r${i}`} x1={x} x2={x + w} y1={y + (h * i) / rows} y2={y + (h * i) / rows} />
    ))}
    {Array.from({ length: cols + 1 }, (_, i) => (
      <line key={`c${i}`} x1={x + (w * i) / cols} x2={x + (w * i) / cols} y1={y} y2={y + h} />
    ))}
    <line x1={x} x2={x + w} y1={y + h} y2={y + h} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
    <line x1={x} x2={x} y1={y} y2={y + h} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
  </g>
);
