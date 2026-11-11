import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/**
 * Palco com holofotes convergindo numa silhueta genérica de jaqueta de couro
 * (representa o CEO, sem retratar o rosto de ninguém) + flashes de câmera.
 */
export const SpotlightVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const cx = width / 2;
  const headY = height * 0.27;
  const floorY = height * 0.52;

  const sweep = Math.sin(t * 0.9) * 40;
  const on = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  const beam = (fromX: number, targetX: number, key: string) => (
    <polygon
      key={key}
      points={`${fromX - 30},-20 ${fromX + 30},-20 ${targetX + 230},${floorY + 30} ${targetX - 230},${floorY + 30}`}
      fill="url(#beam)"
      opacity={on * 0.85}
    />
  );

  const r = rng(77);
  const flashes = Array.from({ length: 10 }, () => ({
    x: 80 + r() * (width - 160),
    y: height * 0.08 + r() * height * 0.4,
    at: r() * 5,
  }));

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
          </linearGradient>
          <radialGradient id="floor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="jacket" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#262b33" />
            <stop offset="45%" stopColor="#0a0c10" />
            <stop offset="70%" stopColor="#1d2128" />
            <stop offset="100%" stopColor="#07080b" />
          </linearGradient>
        </defs>

        {beam(120, cx + sweep, "b1")}
        {beam(width - 120, cx - sweep, "b2")}

        {/* luz no chão */}
        <ellipse cx={cx} cy={floorY} rx={330} ry={60} fill="url(#floor)" opacity={on} />

        {/* silhueta: cabeça */}
        <circle cx={cx} cy={headY} r={72} fill="#0b0d11" stroke={GREEN} strokeOpacity={0.55} strokeWidth={4} />
        {/* pescoço */}
        <rect x={cx - 26} y={headY + 60} width={52} height={40} fill="#0b0d11" />
        {/* jaqueta de couro */}
        <path
          d={`M${cx - 190},${floorY - 10}
              C${cx - 200},${headY + 170} ${cx - 160},${headY + 110} ${cx - 70},${headY + 95}
              L${cx},${headY + 190}
              L${cx + 70},${headY + 95}
              C${cx + 160},${headY + 110} ${cx + 200},${headY + 170} ${cx + 190},${floorY - 10} Z`}
          fill="url(#jacket)"
          stroke={GREEN}
          strokeOpacity={0.6}
          strokeWidth={4}
        />
        {/* camiseta por baixo (V) */}
        <path d={`M${cx - 70},${headY + 95} L${cx},${headY + 190} L${cx + 70},${headY + 95} Z`} fill="#15181e" />
        {/* lapelas e zíper (brilho do couro) */}
        <path d={`M${cx - 70},${headY + 95} L${cx - 20},${headY + 260}`} stroke="#5b6472" strokeWidth={4} opacity={0.6} />
        <path d={`M${cx + 70},${headY + 95} L${cx + 20},${headY + 260}`} stroke="#5b6472" strokeWidth={4} opacity={0.6} />
        <path d={`M${cx - 130},${headY + 180} Q${cx - 150},${headY + 280} ${cx - 140},${floorY - 30}`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={10} fill="none" />

        {/* flashes de câmera */}
        {flashes.map((f, i) => {
          const dt = (t - f.at) % 2.4;
          const a = dt >= 0 && dt < 0.18 ? 1 - dt / 0.18 : 0;
          if (a <= 0) return null;
          return (
            <g key={i} opacity={a}>
              <circle cx={f.x} cy={f.y} r={10 + 30 * a} fill="#ffffff" opacity={0.25} />
              <circle cx={f.x} cy={f.y} r={6} fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
