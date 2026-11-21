import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";
import { MONO, OK } from "./Blocks";

const ROWS = ["Jan 2009", "Feb 2009", "Apr 2009", "Jul 2009", "Oct 2009", "Jan 2010"];

/** A prova definitiva: mover uma moeda antiga. Nunca aconteceu. */
export const UntouchedVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const pop = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const pulse = 0.5 + Math.sin(frame / 6) * 0.5;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE PROOF" title="Move one coin. That's all.">
        <div style={{ marginTop: 14 }}>
          <Pill>Satoshi's coins: ≈ 1.1M BTC (est.)</Pill>
        </div>
      </Panel>

      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 460,
          borderRadius: 28,
          background: "linear-gradient(180deg, rgba(20,26,36,0.97) 0%, rgba(10,14,21,0.97) 100%)",
          border: `3px solid ${accent}`,
          boxShadow: `0 0 40px ${accent}44`,
          padding: "26px 28px",
          fontFamily: FONT,
          transform: `scale(${pop})`,
          opacity: pop,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BtcSymbol size={46} color={accent} weight={11} />
          <span style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: 4 }}>EARLY MINED COINS</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={r}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.05)",
              fontFamily: MONO,
              fontSize: 26,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <span>50 BTC · mined {r}</span>
            <span style={{ color: OK, fontWeight: 900, fontFamily: FONT, fontSize: 22, letterSpacing: 2 }}>UNTOUCHED</span>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1120, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>Coins moved since Satoshi vanished</div>
        <div style={{ fontSize: 170, fontWeight: 900, color: "white", lineHeight: 1, marginTop: 6, textShadow: `0 0 ${30 + pulse * 30}px ${accent}88` }}>0</div>
      </div>
    </AbsoluteFill>
  );
};
