import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { IconTrendUp } from "../../nvidia/visuals/Icons";
import { BigNumber, Grid, Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

// preço aproximado no fim de cada ano, em escala log10
const DATA: [number, number][] = [
  [2010, 0.3], [2011, 4], [2012, 13], [2013, 750], [2014, 320],
  [2015, 430], [2016, 960], [2017, 14000], [2018, 3700], [2019, 7200],
  [2020, 29000], [2021, 46000], [2022, 16500], [2023, 42000], [2024, 93000],
];

/** De centavos a dezenas de milhares: o preço do Bitcoin em escala log. */
export const GrowthVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const gx = 125, gy = 600, gw = width - 205, gh = 560;
  const lo = Math.log10(0.1), hi = Math.log10(200000);
  const toX = (year: number) => gx + ((year - 2010) / 14) * gw;
  const toY = (v: number) => gy + gh - ((Math.log10(v) - lo) / (hi - lo)) * gh;

  const prog = interpolate(frame, [14, 14 + fps * 2.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const n = DATA.length;
  const pos = prog * (n - 1);
  const i = Math.min(n - 2, Math.floor(pos));
  const f = pos - i;
  const pts = DATA.slice(0, i + 1).map(([y, v]) => ({ x: toX(y), y: toY(v) }));
  const cur = {
    x: toX(DATA[i][0] + f),
    y: toY(DATA[i][1] * Math.pow(DATA[i + 1][1] / DATA[i][1], f)),
  };
  pts.push(cur);
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const badge = spring({ frame: frame - (14 + fps * 2.3), fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="2009 → TODAY" title="From $0 to a trillion">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 8 }}>
          <BigNumber>16</BigNumber>
          <div style={{ paddingBottom: 14, fontFamily: FONT, fontSize: 32, fontWeight: 800, color: "white" }}>years</div>
          <div style={{ paddingBottom: 14, marginLeft: "auto" }}>
            <Pill>
              <IconTrendUp size={26} strokeWidth={3} /> log scale
            </Pill>
          </div>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="btcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Grid x={gx} y={gy} w={gw} h={gh} rows={5} cols={5} />
        {[1, 100, 10000, 100000].map((v) => (
          <text key={v} x={gx - 14} y={toY(v) + 8} textAnchor="end" fontFamily={FONT} fontSize={21} fill="rgba(255,255,255,0.5)">
            ${v >= 1000 ? `${v / 1000}k` : v}
          </text>
        ))}
        {[2010, 2014, 2018, 2021, 2024].map((y) => (
          <text key={y} x={toX(y)} y={gy + gh + 40} textAnchor="middle" fontFamily={FONT} fontSize={23} fontWeight={700} fill="rgba(255,255,255,0.6)">
            {y}
          </text>
        ))}
        <polygon points={`${line} ${cur.x},${gy + gh} ${pts[0].x},${gy + gh}`} fill="url(#btcArea)" />
        <polyline points={line} fill="none" stroke={accent} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${accent})` }} />
        <circle cx={cur.x} cy={cur.y} r={14} fill="#fff3dd" style={{ filter: `drop-shadow(0 0 16px ${accent})` }} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1310,
          transform: `scale(${badge})`,
          opacity: badge,
          textAlign: "center",
          padding: "20px 24px",
          borderRadius: 24,
          background: `${accent}1f`,
          border: `2px solid ${accent}`,
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 900,
          color: "white",
        }}
      >
        Nine pages → a <span style={{ color: accent }}>trillion-dollar</span> asset
      </div>
    </AbsoluteFill>
  );
};
