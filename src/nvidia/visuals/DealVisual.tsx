import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconChip, IconServer } from "./Icons";
import { Panel, Pill } from "./ui";

const BLUE = "#33d6ff";

/** Aquisição da Mellanox: dois blocos se conectam e viram uma malha de rede. */
export const DealVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const join = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const ax = interpolate(join, [0, 1], [180, 330]);
  const bx = interpolate(join, [0, 1], [width - 180, width - 330]);
  const y = 900;
  const mesh = interpolate(frame, [14 + fps * 0.9, 14 + fps * 2.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const result = spring({ frame: frame - (14 + fps * 2.2), fps, config: { damping: 12 } });

  const nodes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: width / 2 + Math.cos(a) * 300, y: 1230 + Math.sin(a) * 140 };
  });

  const Block: React.FC<{ x: number; color: string; icon: React.ReactNode; name: string; sub: string }> = ({ x, color, icon, name, sub }) => (
    <div style={{ position: "absolute", left: x - 130, top: y - 130, width: 260, textAlign: "center", fontFamily: FONT }}>
      <div style={{ width: 180, height: 180, margin: "0 auto", borderRadius: 44, background: `${color}22`, border: `4px solid ${color}`, boxShadow: `0 0 40px ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      <div style={{ marginTop: 14, fontSize: 40, fontWeight: 900, color: "white" }}>{name}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{sub}</div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="2020 · THE SMART DEAL" title="NVIDIA buys Mellanox">
        <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
          <Pill>$6.9 billion</Pill>
          <Pill bg={BLUE}>networking</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={ax + 90} y1={y} x2={bx - 90} y2={y} stroke="white" strokeOpacity={0.5 * join} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-frame * 2} />
        {/* malha resultante */}
        {nodes.map((n, i) =>
          nodes.slice(i + 1).map((m, j) => (
            <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={BLUE} strokeOpacity={0.12 * mesh} strokeWidth={1.5} />
          )),
        )}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={10} fill={BLUE} opacity={mesh} style={{ filter: `drop-shadow(0 0 8px ${BLUE})` }} />
        ))}
        {[0, 0.5].map((off, k) => {
          const p = (t * 0.7 + off) % 1;
          const i = Math.floor(p * nodes.length);
          const a = nodes[i];
          const b = nodes[(i + 1) % nodes.length];
          const f = p * nodes.length - i;
          return <circle key={k} cx={a.x + (b.x - a.x) * f} cy={a.y + (b.y - a.y) * f} r={8} fill="#eaffd0" opacity={mesh} />;
        })}
      </svg>

      <Block x={ax} color={GREEN} icon={<IconChip size={96} />} name="NVIDIA" sub="the chips" />
      <Block x={bx} color={BLUE} icon={<IconServer size={96} />} name="Mellanox" sub="the wires" />

      <div style={{ position: "absolute", left: 80, right: 80, top: 1405, transform: `scale(${result})`, opacity: result, textAlign: "center", fontFamily: FONT, color: "white", fontSize: 36, fontWeight: 900, padding: "18px 24px", borderRadius: 22, border: `2px solid ${BLUE}`, background: "rgba(51,214,255,0.1)" }}>
        Now a <span style={{ color: BLUE }}>$10B+ / year</span> business inside NVIDIA
      </div>
    </AbsoluteFill>
  );
};
