import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { Panel, Pill } from "./ui";

/** Guardanapo de lanchonete com um chip sendo rabiscado a caneta + mancha de café. */
export const NapkinVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const drop = spring({ frame: frame - 6, fps, config: { damping: 13 } });
  const sketch = interpolate(frame, [20, 20 + fps * 2.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = 1400;

  const cx = width / 2;
  const cy = 980;
  const size = 640;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="1993 · SAN JOSE" title="A company sketched on a napkin">
        <div style={{ marginTop: 14 }}>
          <Pill>Denny's booth · 3 engineers · 1 idea</Pill>
        </div>
      </Panel>

      <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, transform: `rotate(-5deg) scale(${drop})`, opacity: drop }}>
        {/* guardanapo */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(160deg, #f6f1e6 0%, #e9e2d2 100%)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }} />
        {/* textura: dobras */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(0,0,0,0.08)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "rgba(0,0,0,0.08)" }} />
        {/* mancha de café */}
        <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
          <circle cx={size - 120} cy={120} r={74} fill="none" stroke="#8a5a2b" strokeWidth={14} opacity={0.35} />
          <circle cx={size - 120} cy={120} r={60} fill="#8a5a2b" opacity={0.08} />

          {/* rabisco do chip (desenhado a caneta) */}
          <g stroke="#1b2a6b" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - sketch)}>
            <rect x={size * 0.28} y={size * 0.32} width={size * 0.44} height={size * 0.44} rx={14} />
            <rect x={size * 0.42} y={size * 0.46} width={size * 0.16} height={size * 0.16} rx={6} />
            {[0.34, 0.42, 0.5, 0.58, 0.66].map((p) => (
              <g key={p}>
                <line x1={size * p} y1={size * 0.32} x2={size * p} y2={size * 0.24} />
                <line x1={size * p} y1={size * 0.76} x2={size * p} y2={size * 0.84} />
                <line x1={size * 0.28} y1={size * p} x2={size * 0.2} y2={size * p} />
                <line x1={size * 0.72} y1={size * p} x2={size * 0.8} y2={size * p} />
              </g>
            ))}
            <path d={`M${size * 0.15},${size * 0.9} Q${size * 0.5},${size * 0.98} ${size * 0.85},${size * 0.9}`} />
          </g>
          <text x={size * 0.5} y={size * 0.17} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill="#1b2a6b" opacity={sketch}>
            3D graphics chip!
          </text>
        </svg>
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1360, textAlign: "center", fontFamily: FONT, color: "white", fontSize: 34, fontWeight: 800 }}>
        Startup capital: <span style={{ color: GREEN }}>$40,000</span> · Today: <span style={{ color: GREEN }}>$4,000,000,000,000</span>
      </div>
    </AbsoluteFill>
  );
};
