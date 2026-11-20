import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { IconMonitor } from "../../nvidia/visuals/Icons";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";
import { Link, MiniBlock } from "./Blocks";

/** Esteira de blocos encadeados + dezenas de computadores com a mesma cópia. */
export const BlockchainVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const size = 190;
  const gap = 70;
  const step = size + gap;
  const y = 520;
  const offset = (t * 70) % step;

  const nodesOn = interpolate(frame, [fps * 1.2, fps * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cols = 4;
  const rows = 3;
  const cw = (width - 140) / cols;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE BLOCKCHAIN" title="One public record">
        <div style={{ marginTop: 14 }}>
          <Pill>Every transaction since 2009</Pill>
        </div>
      </Panel>

      {/* esteira de blocos */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = -step + i * step - offset + 60;
        const idx = Math.floor((t * 70) / step) + i;
        return (
          <div key={i}>
            <MiniBlock x={x} y={y} size={size} label={`#${idx}`} accent={accent} />
            <Link x={x + size} y={y + size / 2} w={gap} color={accent} />
          </div>
        );
      })}

      {/* cópias idênticas */}
      {Array.from({ length: cols * rows }, (_, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        const on = k / (cols * rows) < nodesOn;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 70 + c * cw,
              top: 830 + r * 175,
              width: cw - 20,
              height: 150,
              borderRadius: 22,
              background: "rgba(14,20,30,0.9)",
              border: `2px solid ${on ? accent : "rgba(255,255,255,0.12)"}`,
              boxShadow: on ? `0 0 20px ${accent}44` : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: on ? accent : "rgba(255,255,255,0.3)",
            }}
          >
            <IconMonitor size={52} strokeWidth={2} />
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2, 3].map((b) => (
                <div key={b} style={{ width: 22, height: 14, borderRadius: 4, background: on ? accent : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 80, right: 80, top: 1370, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 900, color: "white", opacity: nodesOn }}>
        Tens of thousands of copies · <span style={{ color: accent }}>all identical</span>
      </div>
    </AbsoluteFill>
  );
};
