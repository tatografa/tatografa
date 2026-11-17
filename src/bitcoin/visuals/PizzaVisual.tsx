import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";

const Pizza: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#d9a23f" />
    <circle r={r * 0.88} fill="#e8c06a" />
    <circle r={r * 0.78} fill="#c8402f" />
    <circle r={r * 0.74} fill="#efc96f" />
    {[
      [-0.42, -0.3], [0.3, -0.42], [0.45, 0.2], [-0.22, 0.44], [0.05, 0.02], [-0.5, 0.12], [0.18, -0.08],
    ].map(([px, py], i) => (
      <circle key={i} cx={px * r} cy={py * r} r={r * 0.11} fill="#9e2b22" />
    ))}
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r * 0.78} y2={Math.sin(a) * r * 0.78} stroke="#d9a23f" strokeWidth={2} opacity={0.55} />;
    })}
  </g>
);

/** 10.000 BTC por duas pizzas — a balança que nunca mais equilibrou. */
export const PizzaVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const inSp = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const btc = Math.round(
    interpolate(frame, [12, 12 + fps * 1.5], [0, 10000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const tag = spring({ frame: frame - Math.round(fps * 2.2), fps, config: { damping: 11 } });

  const cx = width / 2;
  const y = 920;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="MAY 22, 2010" title="Bitcoin Pizza Day">
        <div style={{ marginTop: 14 }}>
          <Pill>Laszlo Hanyecz · Jacksonville, Florida</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Pizza x={cx - 185} y={y + 190} r={165} rot={-8} />
        <Pizza x={cx + 175} y={y + 230} r={150} rot={14} />
      </svg>

      {/* o preço em BTC */}
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 170, textAlign: "center", transform: `scale(${inSp})`, opacity: inSp }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily: FONT }}>
          <BtcSymbol size={96} color={accent} weight={11} />
          <span style={{ fontSize: 132, fontWeight: 900, color: accent, letterSpacing: -4, textShadow: `0 0 48px ${accent}88` }}>
            {btc.toLocaleString("en-US")}
          </span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 800, color: "white", marginTop: 4 }}>
          for 2 pizzas · about <span style={{ color: accent }}>$41</span> at the time
        </div>
      </div>

      {/* etiqueta final */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1370,
          transform: `rotate(-3deg) scale(${tag})`,
          opacity: tag,
          background: accent,
          color: "#05070d",
          borderRadius: 22,
          padding: "20px 24px",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 900,
          boxShadow: `0 18px 50px ${accent}66`,
        }}
      >
        The most expensive meal in history
      </div>
    </AbsoluteFill>
  );
};
