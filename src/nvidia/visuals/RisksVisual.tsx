import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "./common";
import { IconBan, IconUser, IconWarning } from "./Icons";
import { Panel } from "./ui";

const RISKS = [
  { icon: <IconBan size={56} strokeWidth={2.2} />, color: "#ff5e5e", title: "Export bans", text: "US limits sales of top chips to China", level: "HIGH" },
  { icon: <IconWarning size={56} strokeWidth={2.2} />, color: "#ffb347", title: "Taiwan dependence", text: "Nearly every chip is made by TSMC", level: "HIGH" },
  { icon: <IconUser size={56} strokeWidth={2.2} />, color: "#33d6ff", title: "Customers go solo", text: "Google, Amazon & Microsoft build their own", level: "MEDIUM" },
];

/** Três cards de risco entrando em sequência. */
export const RisksVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="RISK REPORT" title="What could bring it down" />

      <div style={{ position: "absolute", left: 60, right: 60, top: 430, display: "flex", flexDirection: "column", gap: 26 }}>
        {RISKS.map((r, i) => {
          const s = spring({ frame: frame - 12 - i * 14, fps, config: { damping: 13 } });
          const pulse = 0.85 + Math.sin(frame / 6 + i) * 0.15;
          return (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "28px 30px",
                borderRadius: 28,
                background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)",
                border: `2px solid ${r.color}88`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 ${30 * pulse}px ${r.color}33`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [80, 0])}px)`,
                fontFamily: FONT,
              }}
            >
              <div style={{ width: 110, height: 110, borderRadius: 28, background: `${r.color}22`, color: r.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {r.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: "white" }}>{r.title}</div>
                  <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, color: "#05070d", background: r.color, padding: "4px 12px", borderRadius: 999 }}>
                    {r.level}
                  </span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginTop: 6, lineHeight: 1.3 }}>{r.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
