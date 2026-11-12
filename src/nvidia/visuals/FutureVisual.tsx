import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconBrain, IconCar, IconChip, IconFactory, IconRobot, IconServer } from "./Icons";
import { Panel } from "./ui";

const TILES = [
  { icon: <IconChip size={72} />, label: "Blackwell & Rubin", sub: "next-gen chips" },
  { icon: <IconRobot size={72} />, label: "Humanoid robots", sub: "physical AI" },
  { icon: <IconCar size={72} />, label: "Self-driving cars", sub: "DRIVE platform" },
  { icon: <IconFactory size={72} />, label: "AI factories", sub: "gigawatt data centers" },
  { icon: <IconBrain size={72} />, label: "Healthcare AI", sub: "drug discovery" },
  { icon: <IconServer size={72} />, label: "Sovereign AI", sub: "nations buying in" },
];

/** Grade 2x3 de tiles com ícones acendendo em sequência. */
export const FutureVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const cols = 2;
  const gap = 24;
  const x0 = 60;
  const tw = (width - x0 * 2 - gap) / cols;
  const th = 250;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="WHAT'S NEXT" title="“The next industrial revolution”" />

      {TILES.map((tile, i) => {
        const s = spring({ frame: frame - 12 - i * 8, fps, config: { damping: 14 } });
        const glow = 0.5 + Math.sin(t * 2.2 + i * 1.1) * 0.5;
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <div
            key={tile.label}
            style={{
              position: "absolute",
              left: x0 + c * (tw + gap),
              top: 420 + r * (th + gap),
              width: tw,
              height: th,
              borderRadius: 30,
              background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)",
              border: `2px solid rgba(118,185,0,${0.3 + glow * 0.6})`,
              boxShadow: `0 0 ${20 + glow * 30}px rgba(118,185,0,${0.15 + glow * 0.25}), 0 20px 40px rgba(0,0,0,0.5)`,
              opacity: s,
              transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontFamily: FONT,
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ color: GREEN, filter: `drop-shadow(0 0 ${8 + glow * 10}px ${GREEN})` }}>{tile.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{tile.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{tile.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
