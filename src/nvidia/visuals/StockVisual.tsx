import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconTrendUp } from "./Icons";
import { BigNumber, Grid, Panel, Pill } from "./ui";

// Preço aproximado (ajustado por splits), fechamento de cada ano.
const DATA: [number, number][] = [
  [2015, 0.8], [2016, 2.6], [2017, 4.8], [2018, 3.3], [2019, 5.9],
  [2020, 13], [2021, 29], [2022, 14.6], [2023, 49.5], [2024, 134], [2025, 180],
];

/** Gráfico de linha com eixos: a alta da ação NVDA 2015 → 2025. */
export const StockVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const gx = 120, gy = 560, gw = width - 200, gh = 620;
  const maxY = 200;
  const toX = (year: number) => gx + ((year - 2015) / 10) * gw;
  const toY = (v: number) => gy + gh - (v / maxY) * gh;

  const prog = interpolate(frame, [16, 16 + fps * 2.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = DATA.length;
  const pos = prog * (n - 1);
  const i = Math.min(n - 2, Math.floor(pos));
  const f = pos - i;
  const pts = DATA.slice(0, i + 1).map(([y, v]) => ({ x: toX(y), y: toY(v) }));
  const cur = {
    x: toX(DATA[i][0] + f),
    y: toY(DATA[i][1] + (DATA[i + 1][1] - DATA[i][1]) * f),
  };
  pts.push(cur);
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${line} ${cur.x},${gy + gh} ${pts[0].x},${gy + gh}`;

  const value = interpolate(prog, [0, 1], [1000, 225000]);
  const callout = spring({ frame: frame - (16 + fps * 2.4), fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="NVDA STOCK · 2015 → 2025" title="$1,000 invested became…">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10 }}>
          <BigNumber>${Math.round(value).toLocaleString("en-US")}</BigNumber>
          <div style={{ paddingBottom: 14 }}>
            <Pill><IconTrendUp size={26} strokeWidth={3} /> ×200+</Pill>
          </div>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="stockArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.45} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Grid x={gx} y={gy} w={gw} h={gh} rows={4} cols={5} />
        {[0, 50, 100, 150, 200].map((v) => (
          <text key={v} x={gx - 14} y={toY(v) + 9} textAnchor="end" fontFamily={FONT} fontSize={22} fill="rgba(255,255,255,0.5)">
            ${v}
          </text>
        ))}
        {[2015, 2017, 2019, 2021, 2023, 2025].map((y) => (
          <text key={y} x={toX(y)} y={gy + gh + 40} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={700} fill="rgba(255,255,255,0.6)">
            {y}
          </text>
        ))}
        <polygon points={area} fill="url(#stockArea)" />
        <polyline points={line} fill="none" stroke={GREEN} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${GREEN})` }} />
        <circle cx={cur.x} cy={cur.y} r={14} fill="#eaffd0" style={{ filter: `drop-shadow(0 0 14px ${GREEN})` }} />

        {/* callout no fim */}
        <g opacity={callout} transform={`translate(${cur.x - 250} ${cur.y - 120}) scale(${callout})`}>
          <rect width={230} height={70} rx={18} fill="#eaffd0" />
          <text x={115} y={46} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="#05070d">
            ≈ $180 / share
          </text>
        </g>
      </svg>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1270, fontFamily: FONT, color: "rgba(255,255,255,0.6)", fontSize: 24, textAlign: "center" }}>
        Split-adjusted share price, approximate
      </div>
    </AbsoluteFill>
  );
};
