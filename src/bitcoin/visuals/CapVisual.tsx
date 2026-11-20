import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";

/** O teto de 21 milhões: contador, cadeado e a barra de quanto já foi minerado. */
export const CapVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const count = Math.round(interpolate(frame, [8, 8 + fps * 1.4], [0, 21000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const lock = spring({ frame: frame - Math.round(fps * 1.5), fps, config: { damping: 10 } });
  const bar = interpolate(frame, [fps * 1.6, fps * 3.2], [0, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE HARD CAP" title="Written into the code" />

      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: FONT }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 18 }}>
          <BtcSymbol size={110} color={accent} weight={11} />
          <span style={{ fontSize: 150, fontWeight: 900, color: "white", letterSpacing: -5 }}>{count.toLocaleString("en-US")}</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: accent, letterSpacing: 6, marginTop: 6 }}>MAXIMUM. EVER.</div>
      </div>

      {/* cadeado */}
      <svg width={220} height={240} style={{ position: "absolute", left: width / 2 - 110, top: 760, transform: `scale(${lock})`, opacity: lock }}>
        <path d="M60 110 V75 a50 50 0 0 1 100 0 V110" fill="none" stroke={accent} strokeWidth={20} strokeLinecap="round" />
        <rect x={30} y={105} width={160} height={120} rx={24} fill={accent} />
        <circle cx={110} cy={155} r={16} fill="#05070d" />
        <rect x={103} y={160} width={14} height={36} rx={6} fill="#05070d" />
      </svg>

      {/* quanto já foi minerado */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060, fontFamily: FONT }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 900, color: "white" }}>
          <span>Already mined</span>
          <span style={{ color: accent }}>~{Math.round(bar * 100)}%</span>
        </div>
        <div style={{ height: 44, borderRadius: 22, background: "rgba(255,255,255,0.08)", marginTop: 14, overflow: "hidden", border: "2px solid rgba(255,255,255,0.12)" }}>
          <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 22, background: `linear-gradient(90deg, ${accent}aa, ${accent})`, boxShadow: `0 0 20px ${accent}88` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 14 }}>
          <span>2009</span>
          <span>last coin ≈ 2140</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
