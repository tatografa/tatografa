import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconUser } from "./Icons";
import { Panel, Pill } from "./ui";

const RED = "#ff3b3b";

/** Organograma radial: ~60 pessoas ligadas direto ao CEO + selo "NO 1:1s". */
export const OrgChartVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const cx = width / 2;
  const cy = 930;
  const rings = [
    { r: 205, n: 18 },
    { r: 335, n: 42 },
  ];
  const total = rings.reduce((a, r) => a + r.n, 0);
  const shown = interpolate(frame, [12, 12 + fps * 2], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stamp = spring({ frame: frame - (12 + fps * 2.2), fps, config: { damping: 9 } });

  let idx = 0;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="MANAGEMENT STYLE" title="60 direct reports. Zero layers.">
        <div style={{ marginTop: 14 }}>
          <Pill>Typical CEO: 8–12 direct reports</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {rings.map((ring) =>
          Array.from({ length: ring.n }, (_, i) => {
            const k = idx++;
            if (k >= shown) return null;
            const a = (i / ring.n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(a) * ring.r;
            const y = cy + Math.sin(a) * ring.r;
            return (
              <g key={`${ring.r}-${i}`}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke={GREEN} strokeOpacity={0.22} strokeWidth={2} />
                <circle cx={x} cy={y} r={16} fill="#0b111a" stroke={GREEN} strokeWidth={3} />
              </g>
            );
          }),
        )}
        {/* CEO */}
        <circle cx={cx} cy={cy} r={78} fill={GREEN} style={{ filter: `drop-shadow(0 0 28px ${GREEN})` }} />
        <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill="#05070d">CEO</text>
      </svg>

      <div style={{ position: "absolute", left: cx - 30, top: cy - 120, color: "#05070d" }}>
        <IconUser size={60} strokeWidth={2.6} color="#05070d" />
      </div>

      {/* selo */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 230,
          top: 1300,
          width: 460,
          transform: `rotate(-6deg) scale(${stamp})`,
          opacity: stamp,
          border: `8px solid ${RED}`,
          borderRadius: 18,
          padding: "16px 10px",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 900,
          color: RED,
          letterSpacing: 4,
          background: "rgba(5,7,13,0.7)",
        }}
      >
        NO 1:1 MEETINGS
      </div>
    </AbsoluteFill>
  );
};
