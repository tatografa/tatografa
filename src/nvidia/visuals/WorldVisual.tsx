import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/** Globo em wireframe girando, com arcos de conexão pulsando. */
export const WorldVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const cx = width / 2;
  const cy = height * 0.4;
  const R = Math.min(width, height) * 0.26;

  // meridianos (longitude) girando: rx varia como |cos|
  const meridians = Array.from({ length: 6 }, (_, i) => {
    const phase = (t * 0.5 + i / 6) * Math.PI;
    const rx = Math.abs(Math.cos(phase)) * R;
    const front = Math.sin(phase) > 0;
    return { rx, op: front ? 0.5 : 0.18 };
  });

  // paralelos (latitude)
  const parallels = [-0.6, -0.3, 0, 0.3, 0.6].map((f) => ({
    y: cy + f * R,
    rx: Math.cos(Math.asin(f)) * R,
    ry: Math.cos(Math.asin(f)) * R * 0.28,
  }));

  const r = rng(5);
  const arcs = Array.from({ length: 5 }, () => {
    const a1 = r() * Math.PI * 2;
    const a2 = r() * Math.PI * 2;
    return {
      x1: cx + Math.cos(a1) * R * 0.9,
      y1: cy + Math.sin(a1) * R * 0.5,
      x2: cx + Math.cos(a2) * R * 0.9,
      y2: cy + Math.sin(a2) * R * 0.5,
      phase: r(),
    };
  });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* halo */}
        <circle cx={cx} cy={cy} r={R + 18} fill={GREEN} opacity={0.08} />
        <circle cx={cx} cy={cy} r={R} fill="#07101a" stroke={GREEN} strokeWidth={3} strokeOpacity={0.6} />

        {parallels.map((p, i) => (
          <ellipse key={`p${i}`} cx={cx} cy={p.y} rx={p.rx} ry={p.ry} fill="none" stroke={GREEN} strokeOpacity={0.3} strokeWidth={1.5} />
        ))}
        {meridians.map((m, i) => (
          <ellipse key={`m${i}`} cx={cx} cy={cy} rx={m.rx} ry={R} fill="none" stroke={GREEN} strokeOpacity={m.op} strokeWidth={1.5} />
        ))}

        {/* arcos de conexão com dot viajando */}
        {arcs.map((a, i) => {
          const mx = (a.x1 + a.x2) / 2;
          const my = (a.y1 + a.y2) / 2 - 180;
          const p = (t * 0.5 + a.phase) % 1;
          const bx = (1 - p) * (1 - p) * a.x1 + 2 * (1 - p) * p * mx + p * p * a.x2;
          const by = (1 - p) * (1 - p) * a.y1 + 2 * (1 - p) * p * my + p * p * a.y2;
          return (
            <g key={i}>
              <path d={`M${a.x1},${a.y1} Q${mx},${my} ${a.x2},${a.y2}`} fill="none" stroke={GREEN} strokeOpacity={0.4} strokeWidth={2} />
              <circle cx={a.x1} cy={a.y1} r={6} fill={GREEN} />
              <circle cx={a.x2} cy={a.y2} r={6} fill={GREEN} />
              <circle cx={bx} cy={by} r={6} fill="#eaffd0" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
