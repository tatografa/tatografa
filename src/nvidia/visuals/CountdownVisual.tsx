import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./common";

const RED = "#ff3b3b";

/**
 * Contagem regressiva de 30 dias (quase falência em 1996): anel que se esvazia,
 * número caindo, linha de "caixa" despencando e vinheta vermelha pulsante.
 */
export const CountdownVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;

  const cx = width / 2;
  const cy = height * 0.36;
  const R = 230;
  const circ = 2 * Math.PI * R;

  const progress = interpolate(frame, [8, durationInFrames - 12], [1, 0.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const day = Math.max(1, Math.ceil(progress * 30));
  const alarm = 0.5 + Math.sin(t * 8) * 0.5;

  // linha de caixa despencando (atrás do anel)
  const pts = Array.from({ length: 24 }, (_, i) => {
    const x = (i / 23) * width;
    const drop = Math.pow(i / 23, 1.8) * 520;
    const wobble = Math.sin(i * 1.7) * 26;
    return { x, y: height * 0.2 + drop + wobble };
  });
  const visible = interpolate(frame, [0, durationInFrames * 0.8], [2, pts.length], {
    extrapolateRight: "clamp",
  });
  const line = pts.slice(0, Math.floor(visible)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <AbsoluteFill>
      {/* vinheta vermelha pulsante */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at 50% 40%, rgba(255,59,59,${0.1 + alarm * 0.12}) 0%, rgba(5,7,13,0) 70%)`,
        }}
      />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline points={line} fill="none" stroke={RED} strokeWidth={5} strokeOpacity={0.45} />

        {/* anel de fundo */}
        <circle cx={cx} cy={cy} r={R} fill="#0b0f16" stroke="#2a1a1d" strokeWidth={26} />
        {/* anel que se esvazia */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={RED}
          strokeWidth={26}
          strokeLinecap="round"
          strokeDasharray={`${circ * progress} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 ${10 + alarm * 14}px ${RED})` }}
        />
        {/* marcas de dias */}
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * (R - 40)}
              y1={cy + Math.sin(a) * (R - 40)}
              x2={cx + Math.cos(a) * (R - 56)}
              y2={cy + Math.sin(a) * (R - 56)}
              stroke="#ffffff"
              strokeOpacity={i / 30 < progress ? 0.5 : 0.12}
              strokeWidth={3}
            />
          );
        })}
        <text x={cx} y={cy - 100} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill="#ffffff" opacity={0.7} letterSpacing={8}>
          DAYS LEFT
        </text>
        <text x={cx} y={cy + 70} textAnchor="middle" fontFamily={FONT} fontSize={170} fontWeight={900} fill={RED}>
          {day}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
