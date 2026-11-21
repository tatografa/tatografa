import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { SatoshiFigure } from "../../nvidia/Thumbnail";

/** Hook: a silhueta encapuzada do Satoshi sendo "escaneada", sem resultado. */
export const HoodVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const accent = useAccent();

  const appear = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const scanY = 330 + ((frame * 9) % 1050);
  const flicker = frame % 47 < 3 ? 0.55 : 1;
  const jitter = frame % 61 < 2 ? 8 : 0;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: appear * flicker }}>
        <g transform={`translate(${jitter} 0)`}>
          <SatoshiFigure cx={width / 2} top={300} k={0.85} accent={accent} />
        </g>
        {/* linha de varredura */}
        <rect x={0} y={scanY} width={width} height={4} fill={accent} opacity={0.55} />
        <rect x={0} y={scanY - 60} width={width} height={60} fill={`url(#scanFade)`} />
        <defs>
          <linearGradient id="scanFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.18} />
          </linearGradient>
        </defs>
        <text x={width - 70} y={330} textAnchor="end" fontFamily="'DejaVu Sans Mono', monospace" fontSize={26} fill={accent} opacity={0.8}>
          IDENTITY: UNKNOWN
        </text>
        <text x={width - 70} y={366} textAnchor="end" fontFamily="'DejaVu Sans Mono', monospace" fontSize={22} fill="rgba(255,255,255,0.5)">
          match: 0 results
        </text>
      </svg>
    </AbsoluteFill>
  );
};
