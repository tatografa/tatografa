import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { Panel } from "./ui";

const EVENTS = [
  { year: "1963", text: "Born in Tainan, Taiwan" },
  { year: "1973", text: "Moves to the USA as a kid" },
  { year: "1978", text: "Dishwasher & busboy at Denny's" },
  { year: "1984", text: "Engineering degree · Oregon State" },
  { year: "1993", text: "Co-founds NVIDIA at 30" },
  { year: "2025", text: "CEO of a $4T company" },
];

/** Linha do tempo vertical com marcos surgindo em sequência. */
export const TimelineVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const x = 150;
  const y0 = 470;
  const step = 150;
  const drawn = interpolate(frame, [10, 10 + fps * 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="JENSEN HUANG" title="From dishwasher to CEO" />

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={x} y1={y0} x2={x} y2={y0 + step * (EVENTS.length - 1)} stroke="rgba(255,255,255,0.12)" strokeWidth={6} />
        <line x1={x} y1={y0} x2={x} y2={y0 + step * (EVENTS.length - 1) * drawn} stroke={GREEN} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${GREEN})` }} />
      </svg>

      {EVENTS.map((e, i) => {
        const s = spring({ frame: frame - 12 - i * 11, fps, config: { damping: 14 } });
        const y = y0 + i * step;
        const last = i === EVENTS.length - 1;
        return (
          <div key={e.year} style={{ position: "absolute", left: x - 26, top: y - 26, display: "flex", alignItems: "center", gap: 28, opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)` }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: last ? GREEN : "#0b111a", border: `5px solid ${GREEN}`, boxShadow: `0 0 18px ${GREEN}88`, flexShrink: 0 }} />
            <div style={{ fontFamily: FONT }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: GREEN, lineHeight: 1 }}>{e.year}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "white", marginTop: 6 }}>{e.text}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
