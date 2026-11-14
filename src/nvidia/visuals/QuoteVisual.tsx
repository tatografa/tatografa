import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./common";

const RED = "#ff3b3b";
const QUOTE = "Our company is always thirty days from going out of business.";

/** Pôster de citação com efeito de digitação e pulso vermelho. */
export const QuoteVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const typed = Math.floor(interpolate(frame, [8, 8 + fps * 2.4], [0, QUOTE.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pulse = 0.5 + Math.sin(t * 6) * 0.5;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(70% 50% at 50% 45%, rgba(255,59,59,${0.08 + pulse * 0.08}) 0%, rgba(0,0,0,0) 70%)` }} />

      <div style={{ position: "absolute", left: 70, right: 70, top: 300, fontFamily: FONT }}>
        <div style={{ fontSize: 26, letterSpacing: 8, fontWeight: 800, color: RED }}>THE MOTTO</div>
        <div style={{ fontSize: 220, lineHeight: 0.6, color: RED, opacity: 0.6, marginTop: 30 }}>“</div>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, color: "white", letterSpacing: -2, minHeight: 520 }}>
          {QUOTE.slice(0, typed)}
          <span style={{ color: RED, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ marginTop: 30, fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>— Jensen Huang, every single year since 1993</div>
      </div>

      {/* anel de 30 dias pulsando */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle cx={width - 180} cy={1300} r={110} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={16} />
        <circle cx={width - 180} cy={1300} r={110} fill="none" stroke={RED} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 110 * 0.25} ${2 * Math.PI * 110}`} transform={`rotate(-90 ${width - 180} 1300)`} style={{ filter: `drop-shadow(0 0 ${8 + pulse * 10}px ${RED})` }} />
        <text x={width - 180} y={1322} textAnchor="middle" fontFamily={FONT} fontSize={70} fontWeight={900} fill={RED}>30</text>
      </svg>
    </AbsoluteFill>
  );
};
