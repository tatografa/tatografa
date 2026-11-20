import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { hexFrom, MONO, OK } from "./Blocks";

/** Seis máquinas chutando números sem parar; nenhuma acerta (ainda). */
export const MiningVisual: React.FC<{ winner?: boolean }> = ({ winner = false }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const cols = 2;
  const rigW = (width - 140 - 30) / cols;
  const rigH = 175;
  const winAt = Math.round(fps * 1.2);
  const won = winner && frame >= winAt;

  return (
    <AbsoluteFill>
      <Panel
        x={50}
        y={200}
        w={width - 100}
        kicker={winner ? "PROOF OF WORK" : "MINING"}
        title={winner ? "First to solve it wins" : "A global guessing race"}
      >
        <div style={{ marginTop: 14 }}>
          <Pill>Target: a fingerprint that starts with many zeros</Pill>
        </div>
      </Panel>

      {Array.from({ length: 6 }, (_, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        const isWinner = won && k === 3;
        const nonce = Math.floor((frame * 7919 + k * 104729) % 9999999);
        const hash = isWinner ? `0000000000000000000${hexFrom(777, 9)}` : hexFrom(frame * 31 + k * 977, 28);
        const fanAngle = (frame * (18 + k * 3)) % 360;
        const color = isWinner ? OK : accent;
        const dim = won && !isWinner;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 70 + c * (rigW + 30),
              top: 450 + r * (rigH + 26),
              width: rigW,
              height: rigH,
              borderRadius: 24,
              background: "linear-gradient(160deg, rgba(24,30,42,0.98) 0%, rgba(10,14,21,0.98) 100%)",
              border: `3px solid ${isWinner ? OK : dim ? "rgba(255,255,255,0.12)" : `${accent}aa`}`,
              boxShadow: isWinner ? `0 0 40px ${OK}88` : "none",
              opacity: dim ? 0.45 : 1,
              padding: 18,
              boxSizing: "border-box",
              fontFamily: FONT,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* ventoinha */}
              <svg width={70} height={70} style={{ transform: `rotate(${fanAngle}deg)`, flexShrink: 0 }}>
                <circle cx={35} cy={35} r={31} fill="#0b0f16" stroke={color} strokeWidth={3} />
                {[0, 1, 2, 3, 4].map((b) => (
                  <path key={b} d="M35 35 L35 8 A27 27 0 0 1 56 22 Z" fill={color} opacity={0.55} transform={`rotate(${b * 72} 35 35)`} />
                ))}
                <circle cx={35} cy={35} r={7} fill={color} />
              </svg>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "white" }}>MINER {k + 1}</div>
                <div style={{ fontFamily: MONO, fontSize: 21, color: "rgba(255,255,255,0.55)" }}>guess #{nonce.toLocaleString("en-US")}</div>
              </div>
              {isWinner && <div style={{ marginLeft: "auto", fontSize: 54, color: OK, fontWeight: 900 }}>✓</div>}
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: MONO,
                fontSize: 21,
                color: isWinner ? OK : "rgba(255,255,255,0.8)",
                fontWeight: isWinner ? 900 : 400,
                wordBreak: "break-all",
                lineHeight: 1.3,
              }}
            >
              {hash}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 80, right: 80, top: 1060, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 900, color: "white" }}>
        {winner ? (
          <>
            Miner 4 found it → <span style={{ color: OK }}>adds the next block</span>
          </>
        ) : (
          <>
            The network makes <span style={{ color: accent }}>quintillions of guesses</span> every second
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
