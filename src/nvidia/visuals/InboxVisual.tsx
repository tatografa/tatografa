import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { BigNumber, Panel } from "./ui";

const MAILS = [
  { from: "Engineer · Santa Clara", subject: "Top 5 Things: Blackwell yield, CUDA bug, …" },
  { from: "Sales · Tokyo", subject: "Top 5 Things: new data center customer" },
  { from: "Intern · Austin", subject: "Top 5 Things: a weird thing I noticed in the lab" },
  { from: "Research · Toronto", subject: "Top 5 Things: competitor just shipped a chip" },
  { from: "Supply chain · Taiwan", subject: "Top 5 Things: TSMC capacity next quarter" },
  { from: "Robotics · Seattle", subject: "Top 5 Things: humanoid demo went viral" },
];

/** E-mails "Top 5 Things" chegando na caixa do CEO, com contador. */
export const InboxVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const count = Math.round(interpolate(frame, [10, 10 + fps * 2.4], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="INBOX · CEO" title="“Top 5 Things” emails">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 8 }}>
          <BigNumber>{count}+</BigNumber>
          <div style={{ paddingBottom: 14, fontFamily: FONT, fontSize: 32, fontWeight: 800, color: "white" }}>read every week</div>
        </div>
      </Panel>

      <div style={{ position: "absolute", left: 60, right: 60, top: 520, display: "flex", flexDirection: "column", gap: 18 }}>
        {MAILS.map((m, i) => {
          const s = spring({ frame: frame - 14 - i * 10, fps, config: { damping: 15 } });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: 22,
                background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)",
                border: `1.5px solid rgba(118,185,0,${i === 0 ? 0.8 : 0.3})`,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [120, 0])}px)`,
                fontFamily: FONT,
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 27, background: GREEN, color: "#05070d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, flexShrink: 0 }}>
                {m.from[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{m.from}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.subject}</div>
              </div>
              <div style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: 7, background: GREEN, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
