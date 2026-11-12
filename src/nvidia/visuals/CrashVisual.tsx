import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconTrendDown } from "./Icons";
import { BigNumber, Grid, Panel, Pill } from "./ui";

const RED = "#ff3b3b";

/** DeepSeek, 27 jan 2025: a ação cai 17% e a NVIDIA perde ~US$ 589 bi num dia. */
export const CrashVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  const gx = 120, gy = 580, gw = width - 200, gh = 560;
  const toY = (v: number) => gy + gh - ((v - 100) / 60) * gh; // escala 100..160

  // 0..0.55 do tempo: linha estável (~142); depois, queda brusca para ~118.
  const dropAt = Math.round(durationInFrames * 0.5);
  const N = 40;
  const pts: { x: number; y: number }[] = [];
  const shown = interpolate(frame, [14, durationInFrames - 20], [0, N], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  for (let i = 0; i <= Math.min(N, Math.floor(shown)); i++) {
    const p = i / N;
    const x = gx + p * gw;
    const base = 138 + Math.sin(i * 0.9) * 2.5 + (p < 0.55 ? p * 8 : 0);
    const v = p < 0.55 ? base : 118 + Math.sin(i * 1.3) * 2;
    pts.push({ x, y: toY(v) });
  }
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const last = pts[pts.length - 1];

  const crashed = frame > dropAt;
  const loss = interpolate(frame, [dropAt, dropAt + fps * 1.2], [0, 589], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badge = spring({ frame: frame - dropAt, fps, config: { damping: 10 } });
  const shake = crashed && frame < dropAt + 12 ? Math.sin(frame * 3) * 6 : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 45%, rgba(255,59,59,${crashed ? 0.16 : 0}) 0%, rgba(0,0,0,0) 70%)` }} />

      <Panel x={50} y={200} w={width - 100} kicker="JANUARY 27, 2025" title={crashed ? "The DeepSeek shock" : "A normal Monday…"}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10 }}>
          <BigNumber color={crashed ? RED : GREEN}>{crashed ? `−$${Math.round(loss)}B` : "$3.5T"}</BigNumber>
          <div style={{ paddingBottom: 14 }}>
            {crashed ? (
              <Pill bg={RED} color="white"><IconTrendDown size={26} strokeWidth={3} /> −17% in one day</Pill>
            ) : (
              <Pill>market cap</Pill>
            )}
          </div>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Grid x={gx} y={gy} w={gw} h={gh} rows={3} cols={4} />
        {[100, 120, 140, 160].map((v) => (
          <text key={v} x={gx - 14} y={toY(v) + 9} textAnchor="end" fontFamily={FONT} fontSize={22} fill="rgba(255,255,255,0.5)">
            ${v}
          </text>
        ))}
        {/* marcador do dia */}
        <line x1={gx + gw * 0.55} x2={gx + gw * 0.55} y1={gy} y2={gy + gh} stroke={RED} strokeWidth={3} strokeDasharray="10 10" opacity={crashed ? 0.9 : 0.2} />
        <polyline points={line} fill="none" stroke={crashed ? RED : GREEN} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${crashed ? RED : GREEN})` }} />
        {last && <circle cx={last.x} cy={last.y} r={13} fill="#fff" />}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1200,
          transform: `scale(${badge})`,
          opacity: badge,
          padding: "22px 28px",
          borderRadius: 24,
          background: "rgba(255,59,59,0.12)",
          border: `2px solid ${RED}`,
          fontFamily: FONT,
          color: "white",
          fontSize: 32,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        Biggest single-day loss of any company, ever
      </div>
    </AbsoluteFill>
  );
};
