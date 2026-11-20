import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

const STEPS = [
  { year: "2009", reward: 50 },
  { year: "2012", reward: 25 },
  { year: "2016", reward: 12.5 },
  { year: "2020", reward: 6.25 },
  { year: "2024", reward: 3.125 },
  { year: "2028", reward: 1.5625 },
];

/** Recompensa por bloco caindo pela metade a cada ~4 anos. */
export const HalvingVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const baseY = 1300;
  const maxH = 700;
  const n = STEPS.length;
  const bw = 120;
  const gap = (width - 140 - n * bw) / (n - 1);

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE HALVING" title="Every 4 years, the reward halves">
        <div style={{ marginTop: 14 }}>
          <Pill>Less new supply, on a fixed schedule</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={50} x2={width - 50} y1={baseY} y2={baseY} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        {STEPS.map((s, i) => {
          const sp = spring({ frame: frame - 10 - i * 9, fps, config: { damping: 15 } });
          const h = (s.reward / 50) * maxH * sp;
          const x = 70 + i * (bw + gap);
          const future = i === n - 1;
          const current = i === n - 2;
          return (
            <g key={s.year} opacity={future ? 0.55 : 1}>
              <rect
                x={x}
                y={baseY - Math.max(h, 6)}
                width={bw}
                height={Math.max(h, 6)}
                rx={12}
                fill={future ? "none" : accent}
                stroke={accent}
                strokeWidth={future ? 4 : 0}
                strokeDasharray={future ? "12 10" : undefined}
                opacity={current ? 1 : future ? 1 : 0.55}
                style={current ? { filter: `drop-shadow(0 0 20px ${accent})` } : undefined}
              />
              <text x={x + bw / 2} y={baseY - Math.max(h, 6) - 18} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="white" opacity={sp}>
                {s.reward}
              </text>
              <text x={x + bw / 2} y={baseY + 44} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill={current ? accent : "rgba(255,255,255,0.65)"}>
                {s.year}
              </text>
              {i > 0 && (
                <text
                  x={x - gap / 2}
                  y={baseY - 60}
                  textAnchor="middle"
                  fontFamily={FONT}
                  fontSize={24}
                  fontWeight={900}
                  fill={accent}
                  opacity={interpolate(sp, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
                >
                  ÷2
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1400, textAlign: "center", fontFamily: FONT, fontSize: 32, fontWeight: 800, color: "white" }}>
        BTC per block · next halving <span style={{ color: accent }}>≈ 2028</span>
      </div>
    </AbsoluteFill>
  );
};
