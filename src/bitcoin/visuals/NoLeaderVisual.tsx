import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { IconBan, IconCoin, IconWarning } from "../../nvidia/visuals/Icons";
import { Panel } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { RED } from "./Blocks";

const ITEMS = [
  { icon: <IconBan size={44} strokeWidth={2.4} />, text: "No one to arrest" },
  { icon: <IconCoin size={44} strokeWidth={2.4} />, text: "No one to bribe" },
  { icon: <IconWarning size={44} strokeWidth={2.4} />, text: "No one to pressure" },
];

/** Rede sem centro: a coroa no meio é riscada. */
export const NoLeaderVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const cx = width / 2;
  const cy = 760;
  const R = 270;
  const n = 10;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });
  const cross = spring({ frame: frame - 14, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="MAYBE THAT'S THE POINT" title="A money with no leader" />

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => (
            <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={accent} strokeOpacity={0.16} strokeWidth={2} />
          )),
        )}
        {nodes.map((p, i) => {
          const glow = 0.5 + Math.sin(t * 3 + i) * 0.5;
          return <circle key={i} cx={p.x} cy={p.y} r={22} fill="#0b111a" stroke={accent} strokeWidth={4} style={{ filter: `drop-shadow(0 0 ${6 + glow * 10}px ${accent})` }} />;
        })}

        {/* coroa riscada no centro */}
        <g opacity={interpolate(cross, [0, 1], [1, 0.5])}>
          <path
            d={`M${cx - 80},${cy + 40} L${cx - 90},${cy - 50} L${cx - 40},${cy - 10} L${cx},${cy - 70} L${cx + 40},${cy - 10} L${cx + 90},${cy - 50} L${cx + 80},${cy + 40} Z`}
            fill="#e8c36a"
            stroke="#ffe39e"
            strokeWidth={4}
          />
          <rect x={cx - 84} y={cy + 40} width={168} height={22} rx={6} fill="#e8c36a" />
        </g>
        <g opacity={cross} strokeLinecap="round">
          <line x1={cx - 120} y1={cy - 110} x2={cx + 120} y2={cy + 100} stroke={RED} strokeWidth={16} />
          <line x1={cx + 120} y1={cy - 110} x2={cx - 120} y2={cy + 100} stroke={RED} strokeWidth={16} />
        </g>
      </svg>

      <div style={{ position: "absolute", left: 120, right: 120, top: 1090, display: "flex", flexDirection: "column", gap: 18 }}>
        {ITEMS.map((it, i) => {
          const s = spring({ frame: frame - Math.round(fps * 1.1) - i * 10, fps, config: { damping: 13 } });
          return (
            <div
              key={it.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 24px",
                borderRadius: 20,
                background: "rgba(14,20,30,0.95)",
                border: `2px solid ${accent}88`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`,
                fontFamily: FONT,
              }}
            >
              <span style={{ color: accent, display: "flex" }}>{it.icon}</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "white" }}>{it.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
