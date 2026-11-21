import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { FONT } from "./BtcCommon";
import { MONO, RED } from "./Blocks";

const FIELDS: [string, string][] = [
  ["NAME", "Satoshi Nakamoto"],
  ["AGE", "37"],
  ["LOCATION", "Japan"],
  ["BORN", "5 April 1975"],
];

const CLUES = ["Flawless English", "British spelling: “colour”, “optimise”", "Quoted The Times of London"];

/** O perfil que Satoshi declarou × as pistas que não batem. */
export const ProfileVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const card = spring({ frame: frame - 8, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      {/* ficha */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 220,
          borderRadius: 26,
          background: "linear-gradient(180deg, #efe9da 0%, #e0d8c4 100%)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
          transform: `rotate(-1.5deg) scale(${card})`,
          opacity: card,
          padding: "30px 36px",
          fontFamily: FONT,
          color: "#1a1d24",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: 5, color: "#6b6f78" }}>PROFILE · P2P FOUNDATION · 2009</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: RED, border: `3px solid ${RED}`, borderRadius: 8, padding: "2px 10px" }}>SELF-REPORTED</span>
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 24 }}>
          <div
            style={{
              width: 210,
              height: 250,
              borderRadius: 14,
              background: "#11141a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 150,
              fontWeight: 900,
              color: accent,
              flexShrink: 0,
            }}
          >
            ?
          </div>
          <div style={{ flex: 1 }}>
            {FIELDS.map(([k, v], i) => {
              const s = interpolate(frame, [16 + i * 7, 28 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={k} style={{ marginBottom: 14, opacity: s }}>
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 4, color: "#6b6f78" }}>{k}</div>
                  <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700 }}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* pistas que contradizem */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 820, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 900, letterSpacing: 6, color: accent }}>BUT THE CLUES SAY…</div>
        {CLUES.map((c, i) => {
          const s = spring({ frame: frame - Math.round(fps * 1.3) - i * 12, fps, config: { damping: 13 } });
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "22px 26px",
                borderRadius: 22,
                background: "rgba(14,20,30,0.95)",
                border: `2px solid ${accent}88`,
                fontFamily: FONT,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [90, 0])}px)`,
              }}
            >
              <span style={{ fontSize: 33, fontWeight: 800, color: "white" }}>{c}</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: RED, whiteSpace: "nowrap" }}>≠ Japan?</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
