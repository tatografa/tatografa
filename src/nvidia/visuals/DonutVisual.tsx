import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconCar, IconGamepad, IconMonitor, IconServer } from "./Icons";
import { BigNumber, LegendRow, Panel } from "./ui";

const SEGMENTS = [
  { name: "Data Center", pct: 88.3, value: "$115.2B", color: GREEN, icon: <IconServer size={36} /> },
  { name: "Gaming", pct: 8.7, value: "$11.4B", color: "#33d6ff", icon: <IconGamepad size={36} /> },
  { name: "Pro Visualization", pct: 1.5, value: "$1.9B", color: "#ffb347", icon: <IconMonitor size={36} /> },
  { name: "Automotive", pct: 1.3, value: "$1.7B", color: "#ff5e8a", icon: <IconCar size={36} /> },
];

/** Donut animado da receita por segmento (FY2025) + legenda com ícones. */
export const DonutVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const cx = width / 2;
  const cy = 770;
  const R = 250;
  const circ = 2 * Math.PI * R;

  // progresso geral: o donut se desenha em ~1.6s
  const p = interpolate(frame, [12, 12 + fps * 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revenue = interpolate(frame, [12, 12 + fps * 1.4], [0, 130.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dcPct = interpolate(frame, [12, 12 + fps * 1.6], [0, 88], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  let offset = 0;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="REVENUE · FY2025" title="Where the money comes from">
        <div style={{ marginTop: 10 }}>
          <BigNumber>${revenue.toFixed(1)}B</BigNumber>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={54} />
        {SEGMENTS.map((s) => {
          const len = (s.pct / 100) * circ;
          const drawn = Math.max(0, Math.min(len, p * circ - offset));
          const el = (
            <circle
              key={s.name}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={54}
              strokeDasharray={`${drawn} ${circ}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: `drop-shadow(0 0 14px ${s.color}88)` }}
            />
          );
          offset += len;
          return el;
        })}
        <text x={cx} y={cy - 10} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={900} fill="white">
          {Math.round(dcPct)}%
        </text>
        <text x={cx} y={cy + 56} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREEN} letterSpacing={4}>
          DATA CENTER
        </text>
      </svg>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1090, display: "flex", flexDirection: "column", gap: 22 }}>
        {SEGMENTS.map((s, i) => (
          <LegendRow key={s.name} icon={s.icon} name={s.name} value={s.value} pct={s.pct} color={s.color} delay={30 + i * 8} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
