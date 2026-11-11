import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/** Um chip central recebendo fluxos de dados de todas as direções. */
export const AiFlowVisual: React.FC<{ label?: string }> = ({ label = "AI" }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const cx = width / 2;
  const cy = height * 0.42;
  const chip = 220;

  const r = rng(42);
  const streams = Array.from({ length: 16 }, (_, i) => {
    const ang = (i / 16) * Math.PI * 2 + 0.2;
    const dist = 650 + r() * 350;
    return {
      sx: cx + Math.cos(ang) * dist,
      sy: cy + Math.sin(ang) * dist,
      speed: 0.4 + r() * 0.6,
      phase: r(),
    };
  });

  const pins = Array.from({ length: 10 });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* fluxos */}
        {streams.map((s, k) => {
          const ex = cx + (s.sx - cx) * (chip / 2 / Math.hypot(s.sx - cx, s.sy - cy));
          const ey = cy + (s.sy - cy) * (chip / 2 / Math.hypot(s.sx - cx, s.sy - cy));
          return (
            <g key={k}>
              <line x1={s.sx} y1={s.sy} x2={ex} y2={ey} stroke={GREEN} strokeOpacity={0.14} strokeWidth={2} />
              {[0, 0.5].map((off, j) => {
                const p = (t * s.speed + s.phase + off) % 1;
                const x = s.sx + (ex - s.sx) * p;
                const y = s.sy + (ey - s.sy) * p;
                return <circle key={j} cx={x} cy={y} r={5} fill="#eaffd0" opacity={0.85 * (1 - p * 0.4)} />;
              })}
            </g>
          );
        })}

        {/* halo do chip */}
        <rect
          x={cx - chip / 2 - 24}
          y={cy - chip / 2 - 24}
          width={chip + 48}
          height={chip + 48}
          rx={28}
          fill={GREEN}
          opacity={0.1 + Math.sin(t * 3) * 0.04}
        />

        {/* pinos */}
        <g fill={GREEN} opacity={0.8}>
          {pins.map((_, i) => {
            const gap = chip / 10;
            const o = cx - chip / 2 + gap / 2 + i * gap;
            return (
              <g key={i}>
                <rect x={o - 4} y={cy - chip / 2 - 22} width={8} height={22} />
                <rect x={o - 4} y={cy + chip / 2} width={8} height={22} />
                <rect x={cx - chip / 2 - 22} y={cy - chip / 2 + gap / 2 + i * gap - 4} width={22} height={8} />
                <rect x={cx + chip / 2} y={cy - chip / 2 + gap / 2 + i * gap - 4} width={22} height={8} />
              </g>
            );
          })}
        </g>

        {/* corpo do chip */}
        <rect x={cx - chip / 2} y={cy - chip / 2} width={chip} height={chip} rx={20} fill="#0c1420" stroke={GREEN} strokeWidth={4} />
        {/* die central */}
        <rect x={cx - 55} y={cy - 55} width={110} height={110} rx={10} fill={GREEN} opacity={0.9}
          style={{ filter: `drop-shadow(0 0 ${18 + Math.sin(t * 4) * 8}px ${GREEN})` }} />
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={label.length > 2 ? 26 : 34} fontWeight={900} fill="#05070d" fontFamily="sans-serif">{label}</text>
      </svg>
    </AbsoluteFill>
  );
};
