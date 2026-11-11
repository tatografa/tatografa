import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/** Chip estilizado (corpo + pinos + die). */
const Chip: React.FC<{ x: number; y: number; s: number; rot: number; op: number }> = ({ x, y, s, rot, op }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    {[-18, -6, 6, 18].map((o) => (
      <g key={o} fill={GREEN} opacity={0.8}>
        <rect x={o - 3} y={-36} width={6} height={10} />
        <rect x={o - 3} y={26} width={6} height={10} />
        <rect x={-36} y={o - 3} width={10} height={6} />
        <rect x={26} y={o - 3} width={10} height={6} />
      </g>
    ))}
    <rect x={-27} y={-27} width={54} height={54} rx={7} fill="#0c1420" stroke={GREEN} strokeWidth={3} />
    <rect x={-12} y={-12} width={24} height={24} rx={3} fill={GREEN} />
  </g>
);

/**
 * Chips caindo cada vez mais rápido e em maior quantidade (vendas explodindo),
 * acumulando numa pilha brilhante na base.
 */
export const RainVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const r = rng(128);
  const chips = Array.from({ length: 70 }, () => ({
    x: 40 + r() * (width - 80),
    delay: r() * 3.2, // segundos até começar a cair
    speed: 700 + r() * 600,
    s: 0.7 + r() * 0.8,
    rot0: r() * 360,
    spin: (r() - 0.5) * 220,
  }));

  const floorY = height * 0.78;
  const pileH = interpolate(frame, [10, durationInFrames], [0, 150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {chips.map((c, i) => {
          const tt = t - c.delay;
          if (tt < 0) return null;
          // cai até o chão e reaparece no topo (loop), dando sensação de fluxo contínuo
          const travel = floorY - pileH + 60;
          const y = -60 + ((tt * c.speed) % travel);
          return <Chip key={i} x={c.x} y={y} s={c.s} rot={c.rot0 + tt * c.spin} op={0.9} />;
        })}

        {/* pilha que cresce na base */}
        <defs>
          <linearGradient id="pile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.55} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path
          d={`M0,${floorY} Q${width / 2},${floorY - pileH * 1.6} ${width},${floorY} L${width},${height} L0,${height} Z`}
          fill="url(#pile)"
        />
        <path
          d={`M0,${floorY} Q${width / 2},${floorY - pileH * 1.6} ${width},${floorY}`}
          fill="none"
          stroke="#eaffd0"
          strokeOpacity={0.6}
          strokeWidth={3}
        />
      </svg>
    </AbsoluteFill>
  );
};
