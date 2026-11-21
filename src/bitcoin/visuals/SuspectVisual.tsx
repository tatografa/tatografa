import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { RED } from "./Blocks";

type Suspect = {
  name: string;
  initials: string;
  lines: string[];
  note: string;
  verdict: string;
};

/**
 * Teorias públicas sobre a identidade de Satoshi. Ninguém aqui é apontado
 * como Satoshi: cada card mostra a negativa ou a decisão judicial.
 * Sem fotos — só iniciais.
 */
export const SUSPECTS: Record<string, Suspect> = {
  dorian: {
    name: "Dorian Nakamoto",
    initials: "DN",
    lines: ["Retired engineer · California", "Named by Newsweek, 2014"],
    note: "“I am not Dorian Nakamoto.” — Satoshi's old account",
    verdict: "DENIED",
  },
  hal: {
    name: "Hal Finney",
    initials: "HF",
    lines: ["Received the first Bitcoin", "Lived a few blocks from Dorian"],
    note: "Passed away in 2014",
    verdict: "DENIED",
  },
  szabo: {
    name: "Nick Szabo",
    initials: "NS",
    lines: ["Computer scientist", "Designed “bit gold” in 1998"],
    note: "A decade before Bitcoin",
    verdict: "DENIED",
  },
  wright: {
    name: "Craig Wright",
    initials: "CW",
    lines: ["Claimed to be Satoshi", "for years, since 2016"],
    note: "UK High Court · 2024",
    verdict: "RULED: NOT SATOSHI",
  },
};

const ORDER = ["dorian", "hal", "szabo", "wright"];

/** Quadro de suspeitos com barbante vermelho; o card da vez ganha destaque e o carimbo. */
export const SuspectVisual: React.FC<{ who: string }> = ({ who }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const current = Math.max(0, ORDER.indexOf(who));
  const focus = spring({ frame: frame - 6, fps, config: { damping: 15 } });
  const stamp = spring({ frame: frame - Math.round(fps * 1.6), fps, config: { damping: 9 } });

  const cw = 455;
  const ch = 440;
  const gap = 30;
  const x0 = (width - (cw * 2 + gap)) / 2;
  const y0 = 440;
  const pinX = width / 2;
  const pinY = y0 + ch + gap / 2;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE SUSPECTS" title={`Theory ${current + 1} of 4`} />

      {/* barbante vermelho até o "?" central */}
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {ORDER.map((_, i) => {
          const cx = x0 + (i % 2) * (cw + gap) + cw / 2;
          const cy = y0 + Math.floor(i / 2) * (ch + gap) + ch / 2;
          return <line key={i} x1={cx} y1={cy} x2={pinX} y2={pinY} stroke="#c0392b" strokeWidth={4} opacity={0.7} />;
        })}
      </svg>

      {ORDER.map((key, i) => {
        const s = SUSPECTS[key];
        const active = i === current;
        const seen = i < current;
        const x = x0 + (i % 2) * (cw + gap);
        const y = y0 + Math.floor(i / 2) * (ch + gap);
        const scale = active ? interpolate(focus, [0, 1], [1, 1.04]) : 1;
        const isRuling = key === "wright";
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cw,
              height: ch,
              borderRadius: 24,
              background: "linear-gradient(180deg, rgba(22,28,40,0.98) 0%, rgba(10,14,21,0.98) 100%)",
              border: `3px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
              boxShadow: active ? `0 0 44px ${accent}66, 0 24px 50px rgba(0,0,0,0.6)` : "0 18px 40px rgba(0,0,0,0.5)",
              opacity: active ? 1 : seen ? 0.6 : 0.35,
              transform: `scale(${scale})`,
              zIndex: active ? 2 : 1,
              padding: "28px 26px",
              boxSizing: "border-box",
              textAlign: "center",
              fontFamily: FONT,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                margin: "0 auto",
                borderRadius: 55,
                background: "#0b0f16",
                border: `3px solid ${active ? accent : "rgba(255,255,255,0.25)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 900,
                color: active ? accent : "rgba(255,255,255,0.6)",
              }}
            >
              {s.initials}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "white", marginTop: 14 }}>{s.name}</div>
            {s.lines.map((l) => (
              <div key={l} style={{ fontSize: 23, fontWeight: 700, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                {l}
              </div>
            ))}
            <div style={{ fontSize: 21, fontWeight: 700, color: active ? accent : "rgba(255,255,255,0.5)", marginTop: 12, lineHeight: 1.25 }}>{s.note}</div>

            {/* carimbo: animado no card da vez, fixo nos já vistos */}
            {(active || seen) && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 22,
                  transform: `translateX(-50%) rotate(-7deg) scale(${active ? interpolate(stamp, [0, 1], [2, 1]) : 0.8})`,
                  opacity: active ? Math.min(1, stamp * 1.4) : 0.9,
                  border: `5px solid ${RED}`,
                  borderRadius: 10,
                  padding: "4px 14px",
                  fontSize: isRuling ? 28 : 38,
                  fontWeight: 900,
                  color: RED,
                  letterSpacing: 3,
                  whiteSpace: "nowrap",
                  background: "rgba(5,7,13,0.8)",
                }}
              >
                {s.verdict}
              </div>
            )}
          </div>
        );
      })}

      {/* alfinete central */}
      <div
        style={{
          position: "absolute",
          left: pinX - 40,
          top: pinY - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: "#c0392b",
          border: "4px solid #ffb3a7",
          boxShadow: "0 0 24px rgba(192,57,43,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 46,
          fontWeight: 900,
          color: "white",
          zIndex: 3,
        }}
      >
        ?
      </div>
    </AbsoluteFill>
  );
};
