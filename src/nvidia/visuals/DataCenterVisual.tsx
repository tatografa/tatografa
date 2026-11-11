import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/** Fileiras de racks de servidores com LEDs piscando e varredura de luz. */
export const DataCenterVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const cols = 5;
  const rows = 7;
  const gridW = width * 0.84;
  const gridH = height * 0.52;
  const x0 = (width - gridW) / 2;
  const y0 = height * 0.22;
  const cw = gridW / cols;
  const ch = gridH / rows;

  const r = rng(99);
  // pré-computa fases dos LEDs
  const unitSeeds = Array.from({ length: cols * rows }, () => ({
    leds: Array.from({ length: 6 }, () => r()),
  }));

  const sweep = (t * 0.35) % 1; // varredura vertical

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: cols * rows }, (_, k) => {
          const ci = k % cols;
          const ri = Math.floor(k / cols);
          const x = x0 + ci * cw;
          const y = y0 + ri * ch;
          const near = Math.abs(ri / (rows - 1) - sweep) < 0.12;
          return (
            <g key={k}>
              <rect x={x + 4} y={y + 3} width={cw - 8} height={ch - 6} rx={6}
                fill="#0b1220" stroke={GREEN} strokeOpacity={near ? 0.7 : 0.22} strokeWidth={near ? 3 : 1.5} />
              {/* fenda de ventilação */}
              <rect x={x + 14} y={y + ch / 2 - 2} width={cw - 60} height={4} rx={2} fill={GREEN} opacity={0.25} />
              {/* LEDs */}
              {unitSeeds[k].leds.map((ph, j) => {
                const on = (Math.sin(t * (3 + ph * 4) + ph * 10) + 1) / 2;
                return (
                  <rect key={j} x={x + cw - 44 + (j % 3) * 12} y={y + 10 + Math.floor(j / 3) * 14}
                    width={8} height={8} rx={2}
                    fill={on > 0.5 ? "#eaffd0" : GREEN} opacity={0.3 + on * 0.7} />
                );
              })}
            </g>
          );
        })}
        {/* piso com reflexo/aisle */}
        <rect x={0} y={y0 + gridH + 10} width={width} height={height - (y0 + gridH + 10)} fill={GREEN} opacity={0.04} />
        {[0, 1, 2, 3].map((i) => {
          const p = (t * 0.6 + i / 4) % 1;
          return (
            <ellipse key={i} cx={width / 2} cy={y0 + gridH + 40 + p * 300} rx={200 + p * 220} ry={10}
              fill="none" stroke={GREEN} strokeOpacity={(1 - p) * 0.4} strokeWidth={3} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
