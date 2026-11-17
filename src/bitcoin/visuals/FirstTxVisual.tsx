import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { IconUser } from "../../nvidia/visuals/Icons";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";

/** A primeira transação: 10 BTC voando de Satoshi para Hal Finney. */
export const FirstTxVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const ax = 250;
  const bx = width - 250;
  const y = 840;
  const mx = width / 2;
  const my = 610;

  const bez = (p: number) => ({
    x: (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * mx + p * p * bx,
    y: (1 - p) * (1 - p) * y + 2 * (1 - p) * p * my + p * p * y,
  });

  const start = fps * 0.7;
  const arrived = spring({ frame: frame - (start + fps * 1.6), fps, config: { damping: 12 } });

  const Party: React.FC<{ x: number; name: string; role: string; dim?: boolean }> = ({ x, name, role, dim }) => (
    <div style={{ position: "absolute", left: x - 150, top: y - 170, width: 300, textAlign: "center", fontFamily: FONT }}>
      <div
        style={{
          width: 200,
          height: 200,
          margin: "0 auto",
          borderRadius: 48,
          background: `${accent}1c`,
          border: `4px solid ${accent}`,
          boxShadow: `0 0 36px ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          opacity: dim ? 0.75 : 1,
        }}
      >
        <IconUser size={110} strokeWidth={1.8} />
      </div>
      <div style={{ marginTop: 16, fontSize: 38, fontWeight: 900, color: "white" }}>{name}</div>
      <div style={{ fontSize: 25, fontWeight: 700, color: accent }}>{role}</div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="JANUARY 12, 2009" title="The first transaction ever">
        <div style={{ marginTop: 14 }}>
          <Pill>Block 170 · 10 BTC</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${ax},${y} Q${mx},${my} ${bx},${y}`} fill="none" stroke={accent} strokeOpacity={0.3} strokeWidth={4} strokeDasharray="16 14" strokeDashoffset={-frame * 2} />
      </svg>

      {/* moedas viajando */}
      {[0, 0.22, 0.44].map((off, i) => {
        const p = Math.min(1, Math.max(0, (t - start / fps - off) * 0.55));
        if (p <= 0) return null;
        const pos = bez(p);
        return (
          <div key={i} style={{ position: "absolute", left: pos.x - 34, top: pos.y - 34, width: 68, height: 68, borderRadius: 34, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${accent}` }}>
            <BtcSymbol size={40} color="#05070d" weight={11} />
          </div>
        );
      })}

      <Party x={ax} name="Satoshi" role="the creator" />
      <Party x={bx} name="Hal Finney" role="the first believer" dim />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1160,
          textAlign: "center",
          transform: `scale(${arrived})`,
          opacity: arrived,
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>Hal Finney's tweet that day:</div>
        <div style={{ marginTop: 12, fontSize: 44, fontWeight: 900, color: accent }}>“Running bitcoin”</div>
      </div>
    </AbsoluteFill>
  );
};
