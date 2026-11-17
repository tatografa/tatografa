import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Grid, Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

const RED = "#ff3b3b";

/** 2008: o mercado despencando, bancos caindo e o carimbo BAILOUT. */
export const CrisisVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const gx = 110, gy = 560, gw = width - 190, gh = 520;
  const N = 44;
  const shown = interpolate(frame, [10, durationInFrames - 30], [0, N], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= Math.min(N, Math.floor(shown)); i++) {
    const p = i / N;
    // sobe um pouco, depois desaba
    const v = p < 0.3 ? 0.85 + p * 0.3 : 0.92 - Math.pow((p - 0.3) / 0.7, 1.6) * 0.78;
    pts.push({ x: gx + p * gw, y: gy + gh - v * gh + Math.sin(i * 1.7) * 7 });
  }
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const last = pts[pts.length - 1];

  const stamp = spring({ frame: frame - Math.round(durationInFrames * 0.55), fps, config: { damping: 9 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%, rgba(255,59,59,0.14) 0%, rgba(0,0,0,0) 72%)" }} />

      <Panel x={50} y={200} w={width - 100} kicker="SEPTEMBER 2008" title="The system breaks">
        <div style={{ marginTop: 14 }}>
          <Pill bg={RED} color="white">Lehman Brothers collapses</Pill>
        </div>
      </Panel>

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="crashArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
            <stop offset="100%" stopColor={RED} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Grid x={gx} y={gy} w={gw} h={gh} rows={4} cols={5} />
        {pts.length > 1 && (
          <polygon points={`${line} ${last.x},${gy + gh} ${pts[0].x},${gy + gh}`} fill="url(#crashArea)" />
        )}
        <polyline points={line} fill="none" stroke={RED} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${RED})` }} />
        {last && <circle cx={last.x} cy={last.y} r={13} fill="#fff" />}

      </svg>

      <div
        style={{
          position: "absolute",
          left: width / 2 - 280,
          top: 1180,
          width: 560,
          transform: `rotate(-9deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
          opacity: Math.min(1, stamp * 1.4),
          border: `11px solid ${RED}`,
          borderRadius: 20,
          padding: "12px 10px",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 92,
          fontWeight: 900,
          color: RED,
          letterSpacing: 6,
          background: "rgba(5,7,13,0.55)",
        }}
      >
        BAILOUT
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1370,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 800,
          color: "white",
          opacity: Math.min(1, stamp * 1.2),
        }}
      >
        <span style={{ color: RED }}>$700 billion</span> of taxpayer money
      </div>
    </AbsoluteFill>
  );
};
