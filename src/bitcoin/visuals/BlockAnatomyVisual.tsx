import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { hexFrom, MONO } from "./Blocks";

/** Por dentro de um bloco: impressão digital do anterior, transações e o relógio de ~10 min. */
export const BlockAnatomyVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const pop = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const scroll = frame * 2.2;
  const timer = interpolate(frame, [0, fps * 6], [0, 1], { extrapolateRight: "clamp" });

  const cx = width / 2;
  const bw = 900;
  const by = 470;
  const bh = 900;

  const txs = Array.from({ length: 14 }, (_, i) => ({
    from: hexFrom(i * 11 + 1, 6),
    to: hexFrom(i * 13 + 7, 6),
    amt: ((i * 37) % 97) / 10 + 0.01,
  }));

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="INSIDE A BLOCK" title="Every ~10 minutes, a new page">
        <div style={{ marginTop: 14 }}>
          <Pill>A few thousand transactions per block</Pill>
        </div>
      </Panel>

      <div
        style={{
          position: "absolute",
          left: cx - bw / 2,
          top: by,
          width: bw,
          height: bh,
          borderRadius: 30,
          background: "linear-gradient(180deg, rgba(20,26,36,0.97) 0%, rgba(10,14,21,0.97) 100%)",
          border: `4px solid ${accent}`,
          boxShadow: `0 0 50px ${accent}44, 0 30px 70px rgba(0,0,0,0.7)`,
          transform: `scale(${pop})`,
          opacity: pop,
          padding: 34,
          boxSizing: "border-box",
          fontFamily: FONT,
          overflow: "hidden",
        }}
      >
        {/* cabeçalho + relógio */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: accent, letterSpacing: 4 }}>NEW BLOCK</div>
          <svg width={110} height={110}>
            <circle cx={55} cy={55} r={44} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
            <circle
              cx={55}
              cy={55}
              r={44}
              fill="none"
              stroke={accent}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44 * timer} ${2 * Math.PI * 44}`}
              transform="rotate(-90 55 55)"
            />
            <text x={55} y={64} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill="white">
              10m
            </text>
          </svg>
        </div>

        {/* impressão digital do bloco anterior */}
        <div style={{ marginTop: 14, padding: "18px 22px", borderRadius: 18, background: `${accent}1c`, border: `2px dashed ${accent}` }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: 3 }}>FINGERPRINT OF PREVIOUS BLOCK</div>
          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 24, color: "white", wordBreak: "break-all" }}>
            0000000000000000000{hexFrom(42, 45)}
          </div>
        </div>

        {/* transações rolando */}
        <div style={{ marginTop: 22, fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.55)", letterSpacing: 3 }}>TRANSACTIONS</div>
        <div style={{ position: "relative", height: 470, overflow: "hidden", marginTop: 8 }}>
          <div style={{ transform: `translateY(${-(scroll % (txs.length * 66 / 2))}px)` }}>
            {[...txs, ...txs].map((tx, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 56,
                  marginBottom: 10,
                  padding: "0 20px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.05)",
                  fontFamily: MONO,
                  fontSize: 25,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <span>
                  {tx.from}… → {tx.to}…
                </span>
                <span style={{ color: accent, fontWeight: 900 }}>{tx.amt.toFixed(2)} BTC</span>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(180deg, rgba(10,14,21,0) 0%, rgba(10,14,21,1) 100%)" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
