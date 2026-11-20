import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { hexFrom, MONO, RED } from "./Blocks";

/**
 * A chave privada: um número secreto. A chave cai no vazio e o número
 * fica ilegível — perdeu a chave, perdeu as moedas.
 */
export const KeysVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const pop = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const dropAt = fps * 2.4;
  const fall = interpolate(frame, [dropAt, dropAt + fps * 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lost = spring({ frame: frame - Math.round(dropAt + fps * 0.9), fps, config: { damping: 11 } });

  // chave apenas ilustrativa (gerada aleatoriamente, não corresponde a nenhuma carteira usada)
  const key = hexFrom(2140, 64);
  const cx = width / 2;
  const boxColor = fall > 0.5 ? RED : accent;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="OWNERSHIP" title="Your coins = your secret key">
        <div style={{ marginTop: 14 }}>
          <Pill>Not your keys, not your coins</Pill>
        </div>
      </Panel>

      {/* ícone da chave — cai no vazio */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 450,
          textAlign: "center",
          transform: `translateY(${fall * 640}px) rotate(${fall * 60}deg) scale(${pop * (1 - fall * 0.6)})`,
          opacity: pop * (1 - fall),
        }}
      >
        <svg width={360} height={160} viewBox="0 0 360 160">
          <circle cx={80} cy={80} r={62} fill="none" stroke={accent} strokeWidth={22} />
          <rect x={136} y={68} width={210} height={24} rx={8} fill={accent} />
          <rect x={286} y={90} width={22} height={44} rx={6} fill={accent} />
          <rect x={322} y={90} width={22} height={34} rx={6} fill={accent} />
        </svg>
      </div>

      {/* o número secreto — fica ilegível quando a chave some */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 670, textAlign: "center", fontFamily: FONT, opacity: pop }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: boxColor, letterSpacing: 4 }}>
          {fall > 0.5 ? "PRIVATE KEY · LOST" : "PRIVATE KEY"}
        </div>
        <div
          style={{
            margin: "12px auto 0",
            maxWidth: 820,
            padding: "18px 22px",
            borderRadius: 18,
            background: "rgba(14,20,30,0.92)",
            border: `2px solid ${boxColor}`,
            fontFamily: MONO,
            fontSize: 30,
            color: "white",
            wordBreak: "break-all",
            lineHeight: 1.35,
            filter: `blur(${fall * 7}px)`,
          }}
        >
          {key}
        </div>
      </div>

      {/* o vazio */}
      <div
        style={{
          position: "absolute",
          left: cx - 300,
          top: 1060,
          width: 600,
          height: 110,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, #000 30%, rgba(0,0,0,0) 72%)",
          opacity: 0.4 + fall * 0.6,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1200,
          transform: `scale(${lost})`,
          opacity: lost,
          textAlign: "center",
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 900, color: RED }}>Key lost = coins gone</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginTop: 14 }}>
          An estimated <span style={{ color: accent }}>3–4 million BTC</span> are lost forever
        </div>
      </div>
    </AbsoluteFill>
  );
};
