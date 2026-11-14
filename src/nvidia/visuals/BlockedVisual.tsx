import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconBan } from "./Icons";
import { Panel, Pill } from "./ui";

const RED = "#ff3b3b";

/** Acordo com a Arm: um contrato que recebe o carimbo "BLOCKED". */
export const BlockedVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const paper = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const stampAt = 14 + fps * 1.6;
  const stamp = spring({ frame: frame - stampAt, fps, config: { damping: 8, stiffness: 180 } });
  const shake = frame > stampAt && frame < stampAt + 10 ? Math.sin(frame * 4) * 8 : 0;

  const cx = width / 2;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <Panel x={50} y={200} w={width - 100} kicker="2020 → 2022 · THE DEAL THAT DIED" title="NVIDIA tries to buy Arm">
        <div style={{ marginTop: 14 }}>
          <Pill>$40 billion · biggest chip deal ever</Pill>
        </div>
      </Panel>

      {/* contrato */}
      <div style={{ position: "absolute", left: cx - 330, top: 540, width: 660, height: 780, borderRadius: 18, background: "linear-gradient(180deg, #f3f0e8 0%, #e6e1d4 100%)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)", transform: `rotate(2deg) scale(${paper})`, opacity: paper, padding: 44, fontFamily: FONT, color: "#1a1d24" }}>
        <div style={{ fontSize: 22, letterSpacing: 6, fontWeight: 800, color: "#6b6f78" }}>AGREEMENT</div>
        <div style={{ fontSize: 46, fontWeight: 900, marginTop: 8 }}>NVIDIA + Arm</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: "#555" }}>Announced Sept 2020 · $40,000,000,000</div>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ height: 12, borderRadius: 6, background: "#c9c4b6", marginTop: 26, width: `${90 - (i % 3) * 18}%` }} />
        ))}
        <div style={{ marginTop: 44, display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6b6f78", fontWeight: 700 }}>
          <span>Signature ________</span>
          <span>UK · US · EU · China</span>
        </div>
      </div>

      {/* carimbo */}
      <div
        style={{
          position: "absolute",
          left: cx - 300,
          top: 820,
          width: 600,
          transform: `rotate(-14deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`,
          opacity: Math.min(1, stamp * 1.4),
          border: `12px solid ${RED}`,
          borderRadius: 22,
          padding: "16px 10px",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 108,
          fontWeight: 900,
          color: RED,
          letterSpacing: 6,
          mixBlendMode: "multiply",
        }}
      >
        BLOCKED
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1385, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: FONT, color: "white", fontSize: 30, fontWeight: 800, opacity: stamp, whiteSpace: "nowrap" }}>
        <span style={{ color: RED, display: "flex" }}><IconBan size={40} strokeWidth={2.6} /></span>
        UK, US, EU & China regulators said no · Feb 2022
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1445, textAlign: "center", fontFamily: FONT, color: GREEN, fontSize: 26, fontWeight: 800, opacity: stamp }}>
        NVIDIA paid a $1.25B break-up fee and walked away
      </div>
    </AbsoluteFill>
  );
};
