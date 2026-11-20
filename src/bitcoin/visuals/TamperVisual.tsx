import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { hexFrom, MONO, RED } from "./Blocks";

/**
 * Corrente vertical de 4 blocos. Alguém altera uma transação no bloco 2:
 * a impressão digital dele muda e a quebra se propaga para os seguintes.
 */
export const TamperVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const editAt = Math.round(fps * 1.1);
  const edited = frame >= editAt;
  // a quebra desce um bloco a cada ~0,35s
  const brokenFrom = (i: number) => edited && frame >= editAt + (i - 1) * Math.round(fps * 0.35);
  const stamp = spring({ frame: frame - (editAt + Math.round(fps * 1.4)), fps, config: { damping: 9 } });

  const bw = 760;
  const bh = 160;
  const gapY = 56;
  const x = (width - bw) / 2;
  const y0 = 430;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="WHY IT'S TAMPER-PROOF" title="Change one block, break them all" />

      {[0, 1, 2, 3].map((i) => {
        const bad = i >= 1 && brokenFrom(i);
        const color = bad ? RED : accent;
        const y = y0 + i * (bh + gapY);
        const shake = i === 1 && edited && frame < editAt + 10 ? Math.sin(frame * 3) * 6 : 0;
        return (
          <div key={i}>
            {/* elo para o bloco de baixo */}
            {i < 3 && (
              <svg width={40} height={gapY} style={{ position: "absolute", left: width / 2 - 20, top: y + bh }}>
                {i >= 1 && brokenFrom(i) ? (
                  <>
                    <line x1={20} y1={0} x2={20} y2={gapY * 0.35} stroke={RED} strokeWidth={8} strokeLinecap="round" />
                    <line x1={20} y1={gapY * 0.65} x2={20} y2={gapY} stroke={RED} strokeWidth={8} strokeLinecap="round" />
                    <line x1={4} y1={gapY * 0.4} x2={36} y2={gapY * 0.6} stroke={RED} strokeWidth={6} strokeLinecap="round" />
                  </>
                ) : (
                  <line x1={20} y1={0} x2={20} y2={gapY} stroke={accent} strokeWidth={8} strokeLinecap="round" />
                )}
              </svg>
            )}
            <div
              style={{
                position: "absolute",
                left: x + shake,
                top: y,
                width: bw,
                height: bh,
                borderRadius: 24,
                background: bad ? "rgba(60,12,14,0.92)" : "linear-gradient(160deg, rgba(24,30,42,0.98) 0%, rgba(10,14,21,0.98) 100%)",
                border: `4px solid ${color}`,
                boxShadow: `0 0 26px ${color}55`,
                padding: "18px 26px",
                boxSizing: "border-box",
                fontFamily: FONT,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 30, fontWeight: 900, color }}>BLOCK {i + 1}</span>
                {i === 1 && (
                  <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: edited ? RED : "white" }}>
                    Alice → Bob: {edited ? "100" : "1"} BTC {edited ? "✎" : ""}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: bad ? "#ffb3b3" : "rgba(255,255,255,0.7)" }}>
                fingerprint: {bad ? hexFrom(900 + i, 20) : `0000000000${hexFrom(100 + i, 14)}`}
                {bad ? "  ✗" : "  ✓"}
              </div>
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: width / 2 - 290,
          top: 1345,
          width: 580,
          transform: `rotate(-10deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
          opacity: Math.min(1, stamp * 1.4),
          border: `11px solid ${RED}`,
          borderRadius: 20,
          padding: "10px 10px",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 80,
          fontWeight: 900,
          color: RED,
          letterSpacing: 6,
          background: "rgba(5,7,13,0.75)",
        }}
      >
        REJECTED
      </div>
    </AbsoluteFill>
  );
};
