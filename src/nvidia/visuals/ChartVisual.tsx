import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN } from "./common";

/** Barras crescendo (faturamento ano a ano) com linha de tendência. */
export const ChartVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const heights = [0.14, 0.18, 0.22, 0.3, 0.33, 0.6, 1.0]; // fração da altura máxima
  const baseY = height * 0.82;
  const maxH = height * 0.42;
  const n = heights.length;
  const bw = 108;
  const gap = 34;
  const totalW = n * bw + (n - 1) * gap;
  const startX = (width - totalW) / 2;

  const tops = heights.map((h, i) => {
    const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 16 } });
    return h * s;
  });

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* linha de base */}
        <line x1={startX - 20} y1={baseY} x2={startX + totalW + 20} y2={baseY} stroke={GREEN} strokeOpacity={0.4} strokeWidth={3} />

        {/* barras */}
        {tops.map((hh, i) => {
          const h = hh * maxH;
          const x = startX + i * (bw + gap);
          const y = baseY - h;
          const last = i === n - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={h} rx={8}
                fill={GREEN} opacity={last ? 1 : 0.55}
                style={last ? { filter: `drop-shadow(0 0 22px ${GREEN})` } : undefined} />
              <rect x={x} y={y} width={bw} height={6} rx={3} fill="#eaffd0" opacity={0.9} />
            </g>
          );
        })}

        {/* linha de tendência conectando os topos */}
        <polyline
          points={tops
            .map((hh, i) => `${startX + i * (bw + gap) + bw / 2},${baseY - hh * maxH}`)
            .join(" ")}
          fill="none"
          stroke="#eaffd0"
          strokeWidth={4}
          strokeOpacity={interpolate(frame, [30, 50], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </svg>
    </AbsoluteFill>
  );
};
