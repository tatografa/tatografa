import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

/** Bloco gênesis com a manchete do Times escondida dentro dele. */
export const GenesisVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const block = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  const reveal = interpolate(frame, [fps * 1.5, fps * 2.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 0.6 + Math.sin(frame / 7) * 0.4;

  const cx = width / 2;
  const bw = 820;
  const bh = 368;
  const by = 600;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="JANUARY 3, 2009" title="Block 0 — the genesis block">
        <div style={{ marginTop: 14 }}>
          <Pill>Reward: 50 BTC · unspendable</Pill>
        </div>
      </Panel>

      {/* o bloco */}
      <div
        style={{
          position: "absolute",
          left: cx - bw / 2,
          top: by,
          width: bw,
          height: bh,
          borderRadius: 26,
          background: "linear-gradient(180deg, rgba(20,26,36,0.97) 0%, rgba(10,14,21,0.97) 100%)",
          border: `4px solid ${accent}`,
          boxShadow: `0 0 ${30 + glow * 40}px ${accent}55, 0 30px 70px rgba(0,0,0,0.7)`,
          transform: `scale(${block})`,
          opacity: block,
          padding: 30,
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: accent, fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>
          <span>BLOCK #0</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>03 JAN 2009</span>
        </div>

        {/* hash */}
        <div style={{ marginTop: 16, fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 19, color: "rgba(255,255,255,0.45)", wordBreak: "break-all" }}>
          000000000019d6689c085ae165831e93 4ff763ae46a2a6c172b3f1b60a8ce26f
        </div>

        {/* a mensagem escondida */}
        <div
          style={{
            marginTop: 24,
            padding: "20px 22px",
            borderRadius: 16,
            background: `${accent}1f`,
            border: `2px dashed ${accent}`,
            opacity: reveal,
            transform: `translateY(${interpolate(reveal, [0, 1], [18, 0])}px)`,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: accent, letterSpacing: 3 }}>COINBASE MESSAGE</div>
          <div style={{ fontSize: 31, fontWeight: 900, color: "white", lineHeight: 1.25, marginTop: 8, fontFamily: "'DejaVu Serif', Georgia, serif" }}>
            “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: by + bh + 50, textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.75)", opacity: reveal }}>
        A timestamp — and a message about why Bitcoin exists
      </div>
    </AbsoluteFill>
  );
};
