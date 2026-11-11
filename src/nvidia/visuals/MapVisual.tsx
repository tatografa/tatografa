import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN } from "./common";

/** Mapa estilizado com um pin de localização caindo e anéis de pulso. */
export const MapVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cx = width / 2;
  const cy = height * 0.4;

  const drop = spring({ frame: frame - 8, fps, config: { damping: 10, mass: 0.8 } });
  const pinY = interpolate(drop, [0, 1], [-400, 0]);
  const pinScale = interpolate(drop, [0, 1], [0.4, 1]);

  const t = frame / fps;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* quarteirões / ruas */}
        <g stroke={GREEN} strokeOpacity={0.14} strokeWidth={1.5}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={width} y1={i * 150} y2={i * 150} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={i * 140} x2={i * 140} y1={0} y2={height} />
          ))}
        </g>
        {/* algumas ruas destacadas */}
        <g stroke={GREEN} strokeOpacity={0.35} strokeWidth={3}>
          <path d="M0,620 L1080,760" fill="none" />
          <path d="M160,0 L420,1920" fill="none" />
          <path d="M1080,300 L300,1920" fill="none" />
        </g>

        {/* anéis de pulso */}
        {[0, 1, 2].map((k) => {
          const p = (t * 0.6 + k / 3) % 1;
          return (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={30 + p * 320}
              fill="none"
              stroke={GREEN}
              strokeWidth={4}
              strokeOpacity={(1 - p) * 0.6}
            />
          );
        })}

        {/* pin */}
        <g transform={`translate(${cx}, ${cy + pinY}) scale(${pinScale})`}>
          <path
            d="M0,40 C-40,-20 -34,-70 0,-70 C34,-70 40,-20 0,40 Z"
            fill={GREEN}
            stroke="#ffffff"
            strokeWidth={3}
          />
          <circle cx={0} cy={-34} r={16} fill="#05070d" />
        </g>
        {/* sombra do pin */}
        <ellipse cx={cx} cy={cy + 44} rx={26 * pinScale} ry={8 * pinScale} fill="#000" opacity={0.4} />
      </svg>
    </AbsoluteFill>
  );
};
