import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";

/** Satoshi some: a silhueta se dissolve em partículas e a carteira fica selada. */
export const VanishVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const accent = useAccent();

  const fade = interpolate(frame, [fps * 0.6, fps * 2.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wallet = spring({ frame: frame - Math.round(fps * 1.9), fps, config: { damping: 13 } });

  const cx = width / 2;
  const headY = 700;
  const headR = 92;

  // partículas que sobem conforme a silhueta desaparece
  const bits = Array.from({ length: 150 }, (_, i) => {
    const seed = (i * 73 + (i % 7) * 29) % 223;
    const px = cx - 230 + (seed % 460);
    const base = headY + 60 + ((seed * 7) % 420);
    const rise = (1 - fade) * (150 + (seed % 170));
    return { x: px, y: base - rise, o: (1 - fade) * (0.25 + ((seed % 60) / 100)), s: 3 + (seed % 5) };
  });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="2011" title="And then he was gone" />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* silhueta sumindo */}
        <g opacity={0.1 + fade * 0.9}>
          <circle cx={cx} cy={headY} r={headR} fill="#0b0d12" stroke={accent} strokeWidth={6} />
          <rect x={cx - 34} y={headY + headR - 12} width={68} height={56} fill="#0b0d12" />
          <path
            d={`M${cx - 215},${headY + 450}
                C${cx - 228},${headY + 250} ${cx - 160},${headY + 180} ${cx - 92},${headY + 160}
                L${cx},${headY + 300}
                L${cx + 92},${headY + 160}
                C${cx + 160},${headY + 180} ${cx + 228},${headY + 250} ${cx + 215},${headY + 450} Z`}
            fill="#11151d"
            stroke={accent}
            strokeWidth={6}
          />
          <text x={cx} y={headY + 20} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={accent} opacity={0.65}>
            ?
          </text>
        </g>

        {/* partículas */}
        {bits.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.s} height={b.s * 2.4} rx={1.5} fill={accent} opacity={b.o} />
        ))}
      </svg>

      {/* carteira selada */}
      <div
        style={{
          position: "absolute",
          left: cx - 330,
          top: 1230,
          width: 660,
          transform: `scale(${wallet})`,
          opacity: wallet,
          borderRadius: 28,
          background: "linear-gradient(180deg, rgba(20,26,36,0.97) 0%, rgba(10,14,21,0.97) 100%)",
          border: `3px solid ${accent}`,
          boxShadow: `0 0 44px ${accent}44, 0 26px 60px rgba(0,0,0,0.7)`,
          padding: "28px 30px",
          textAlign: "center",
          fontFamily: FONT,
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 5, fontWeight: 800, color: accent }}>SATOSHI'S WALLET</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 12 }}>
          <BtcSymbol size={70} color={accent} weight={11} />
          <span style={{ fontSize: 96, fontWeight: 900, color: "white", letterSpacing: -3 }}>1,000,000</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 900, color: accent, letterSpacing: 2 }}>NEVER MOVED · 🔒</div>
      </div>
    </AbsoluteFill>
  );
};
