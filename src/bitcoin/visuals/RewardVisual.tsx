import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";
import { Link, MiniBlock, OK } from "./Blocks";

/** O vencedor encaixa o bloco novo na corrente e recebe moedas novas. */
export const RewardVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const size = 200;
  const gap = 60;
  const y = 560;
  const slide = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  const newX = interpolate(slide, [0, 1], [width + 40, 70 + 3 * (size + gap)]);
  const coins = spring({ frame: frame - Math.round(fps * 1.1), fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="PROOF OF WORK" title="The winner writes the next page">
        <div style={{ marginTop: 14 }}>
          <Pill>Reward: brand-new Bitcoin + fees</Pill>
        </div>
      </Panel>

      {[0, 1, 2].map((i) => (
        <div key={i}>
          <MiniBlock x={70 + i * (size + gap) - 140} y={y} size={size} label={`#${i + 1}`} accent={accent} />
          <Link x={70 + i * (size + gap) - 140 + size} y={y + size / 2} w={gap} color={accent} />
        </div>
      ))}
      <div style={{ position: "absolute", left: newX - 140, top: y - 12, width: size + 24, height: size + 24, borderRadius: 40, boxShadow: `0 0 60px ${OK}99` }} />
      <MiniBlock x={newX - 140} y={y} size={size} label="NEW" accent={OK} />

      {/* moedas novas */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", transform: `scale(${coins})`, opacity: coins }}>
        <div style={{ display: "inline-flex", gap: 22, marginBottom: 26 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: `radial-gradient(circle at 34% 28%, #ffc266 0%, ${accent} 50%, #c96f08 100%)`,
                border: "5px solid #ffd089",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 34px ${accent}aa`,
                transform: `translateY(${Math.sin(frame / 6 + i) * 8}px)`,
              }}
            >
              <BtcSymbol size={66} color="#fff6e4" weight={11} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 96, fontWeight: 900, color: accent, letterSpacing: -2, textShadow: `0 0 40px ${accent}88` }}>
          +3.125 BTC
        </div>
        <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: "white", marginTop: 6 }}>
          created out of thin air · every ~10 minutes
        </div>
      </div>
    </AbsoluteFill>
  );
};
