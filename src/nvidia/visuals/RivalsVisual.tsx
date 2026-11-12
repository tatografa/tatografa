import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconBrain, IconChip, IconCloud, IconServer } from "./Icons";
import { Panel, Pill } from "./ui";

const ROWS = [
  { name: "NVIDIA", pct: 80, color: GREEN, icon: <IconChip size={34} />, note: "H100 · Blackwell" },
  { name: "AMD", pct: 7, color: "#ff5e5e", icon: <IconChip size={34} />, note: "MI300 · MI350" },
  { name: "Google", pct: 5, color: "#33d6ff", icon: <IconBrain size={34} />, note: "TPU" },
  { name: "Amazon", pct: 4, color: "#ffb347", icon: <IconCloud size={34} />, note: "Trainium" },
  { name: "Microsoft", pct: 2, color: "#b48cff", icon: <IconServer size={34} />, note: "Maia" },
  { name: "Intel · others", pct: 2, color: "#8b98a8", icon: <IconChip size={34} />, note: "Gaudi…" },
];

/** Barras horizontais: participação estimada no mercado de chips de IA. */
export const RivalsVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="AI CHIP MARKET SHARE · EST." title="Everyone wants a piece">
        <div style={{ marginTop: 14 }}>
          <Pill>NVIDIA ≈ 80%+</Pill>
        </div>
      </Panel>

      <div style={{ position: "absolute", left: 70, right: 70, top: 470, display: "flex", flexDirection: "column", gap: 26, fontFamily: FONT }}>
        {ROWS.map((r, i) => {
          const s = spring({ frame: frame - 14 - i * 7, fps, config: { damping: 16 } });
          const w = interpolate(s, [0, 1], [0, r.pct]);
          return (
            <div key={r.name} style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
                <div style={{ width: 58, height: 58, borderRadius: 16, background: `${r.color}22`, border: `1.5px solid ${r.color}77`, color: r.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {r.icon}
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: "white" }}>{r.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{r.note}</div>
                <div style={{ marginLeft: "auto", fontSize: 36, fontWeight: 900, color: r.color }}>{Math.round(w)}%</div>
              </div>
              <div style={{ height: 30, borderRadius: 15, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ width: `${w}%`, height: "100%", borderRadius: 15, background: `linear-gradient(90deg, ${r.color}99, ${r.color})`, boxShadow: `0 0 16px ${r.color}66` }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
