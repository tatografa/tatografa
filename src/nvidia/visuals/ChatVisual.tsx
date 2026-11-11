import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";

type Msg = { from: "user" | "ai"; text: string; at: number };

const MSGS: Msg[] = [
  { from: "user", text: "Explain GPUs like I'm five", at: 6 },
  { from: "ai", text: "Imagine thousands of tiny workers doing math at the same time…", at: 26 },
  { from: "user", text: "Now write me a business plan", at: 78 },
  { from: "ai", text: "Sure! Step 1: buy more GPUs.", at: 98 },
];

const TYPING = 18; // quadros de "digitando..." antes da resposta da IA

const Dots: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", gap: 10, padding: "6px 4px" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: "#cfd8e3",
          opacity: 0.35 + 0.65 * ((Math.sin(frame / 3 - i) + 1) / 2),
        }}
      />
    ))}
  </div>
);

/** Conversa com um chatbot surgindo na tela + selo de crescimento viral. */
export const ChatVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badge = spring({ frame: frame - 130, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 230,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {MSGS.map((m, i) => {
          const s = spring({ frame: frame - m.at, fps, config: { damping: 15 } });
          if (frame < m.at) return null;
          const isUser = m.from === "user";
          const typing = !isUser && frame - m.at < TYPING;
          return (
            <div
              key={i}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "78%",
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
                transformOrigin: isUser ? "right bottom" : "left bottom",
                opacity: s,
                background: isUser ? GREEN : "#141c28",
                color: isUser ? "#05070d" : "#e6edf3",
                border: isUser ? "none" : "2px solid rgba(118,185,0,0.35)",
                borderRadius: 30,
                borderBottomRightRadius: isUser ? 8 : 30,
                borderBottomLeftRadius: isUser ? 30 : 8,
                padding: "20px 28px",
                fontFamily: FONT,
                fontSize: 36,
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              {typing ? <Dots frame={frame} /> : m.text}
            </div>
          );
        })}
      </div>

      {/* selo viral */}
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 60,
          transform: `scale(${badge}) rotate(-6deg)`,
          background: "#ff3b6b",
          color: "white",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 30,
          padding: "12px 22px",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(255,59,107,0.45)",
        }}
      >
        🔥 1M users in 5 days
      </div>
    </AbsoluteFill>
  );
};
