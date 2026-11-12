import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconCoin } from "./Icons";
import { BigNumber, Panel, Pill } from "./ui";

/** Waffle chart 10x10: de cada $1, ~75 centavos são lucro bruto. */
export const WaffleVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const total = 100;
  const profit = 75;
  const lit = Math.floor(
    interpolate(frame, [14, 14 + fps * 1.8], [0, profit], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const pct = Math.round((lit / profit) * 75);

  const cols = 10;
  const gap = 12;
  const cell = (width - 160 - gap * (cols - 1)) / cols;
  const x0 = 80;
  const y0 = 560;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="GROSS MARGIN" title="Of every $1 in revenue…">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10 }}>
          <BigNumber>{pct}%</BigNumber>
          <div style={{ paddingBottom: 14 }}>
            <Pill>≈ 75¢ profit</Pill>
          </div>
        </div>
      </Panel>

      {Array.from({ length: total }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const on = i < lit;
        const x = x0 + c * (cell + gap);
        const y = y0 + (cols - 1 - r) * (cell + gap); // preenche de baixo para cima
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cell,
              height: cell,
              borderRadius: 16,
              background: on ? `linear-gradient(160deg, #a6e22e, ${GREEN})` : "rgba(255,255,255,0.06)",
              border: on ? "none" : "1.5px solid rgba(255,255,255,0.1)",
              boxShadow: on ? `0 0 18px ${GREEN}66` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: on ? "#05070d" : "rgba(255,255,255,0.25)",
              transform: `scale(${on ? 1 : 0.92})`,
            }}
          >
            <IconCoin size={cell * 0.5} strokeWidth={2.4} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: y0 + 10 * (cell + gap) + 30,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        <span style={{ color: GREEN }}>■ Gross profit · 75¢</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>■ Cost · 25¢</span>
      </div>
    </AbsoluteFill>
  );
};
