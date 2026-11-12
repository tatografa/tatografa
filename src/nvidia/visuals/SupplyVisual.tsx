import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconChip, IconFactory } from "./Icons";
import { Panel, Pill } from "./ui";

const BLUE = "#33d6ff";

const Node: React.FC<{
  x: number;
  y: number;
  color: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  delay: number;
}> = ({ x, y, color, icon, title, sub, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", left: x - 120, top: y - 120, width: 240, textAlign: "center", fontFamily: FONT, transform: `scale(${s})`, opacity: s }}>
      <div
        style={{
          width: 170,
          height: 170,
          margin: "0 auto",
          borderRadius: 48,
          background: `${color}1f`,
          border: `3px solid ${color}`,
          boxShadow: `0 0 40px ${color}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </div>
      <div style={{ marginTop: 16, fontSize: 36, fontWeight: 900, color: "white" }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 4 }}>{sub}</div>
    </div>
  );
};

/** NVIDIA desenha (EUA) → TSMC fabrica (Taiwan): chips viajando pelo arco. */
export const SupplyVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;

  const ax = 240, ay = 900; // NVIDIA
  const bx = width - 240, by = 900; // TSMC
  const mx = width / 2, my = 620; // controle do arco

  const bez = (p: number) => ({
    x: (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * mx + p * p * bx,
    y: (1 - p) * (1 - p) * ay + 2 * (1 - p) * p * my + p * p * by,
  });

  const drawn = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="SUPPLY CHAIN" title="Fabless: designs here, built there">
        <div style={{ marginTop: 16, display: "flex", gap: 14 }}>
          <Pill bg={GREEN}>NVIDIA designs</Pill>
          <Pill bg={BLUE}>TSMC manufactures</Pill>
        </div>
      </Panel>

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* grade de "mapa" */}
        <g stroke="rgba(255,255,255,0.06)" strokeWidth={1.5}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={width} y1={520 + i * 90} y2={520 + i * 90} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={i * 120} x2={i * 120} y1={520} y2={1150} />
          ))}
        </g>
        {/* arco */}
        <path
          d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={4}
          strokeDasharray="14 14"
          strokeDashoffset={-frame * 2}
          opacity={drawn}
        />
        {/* projetos (verde) indo para Taiwan, chips (azul) voltando */}
        {[0, 0.33, 0.66].map((off, i) => {
          const p = (t * 0.35 + off) % 1;
          const a = bez(p);
          const b = bez(1 - p);
          return (
            <g key={i} opacity={drawn}>
              <circle cx={a.x} cy={a.y - 14} r={9} fill={GREEN} style={{ filter: `drop-shadow(0 0 8px ${GREEN})` }} />
              <rect x={b.x - 12} y={b.y + 4} width={24} height={24} rx={5} fill={BLUE} style={{ filter: `drop-shadow(0 0 8px ${BLUE})` }} />
            </g>
          );
        })}
        <text x={mx} y={my + 40} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="rgba(255,255,255,0.6)" letterSpacing={4}>
          ~ 11,000 KM
        </text>
      </svg>

      <Node x={ax} y={ay} color={GREEN} icon={<IconChip size={90} />} title="NVIDIA" sub="Santa Clara, USA" delay={10} />
      <Node x={bx} y={by} color={BLUE} icon={<IconFactory size={90} />} title="TSMC" sub="Hsinchu, Taiwan" delay={22} />

      <div style={{ position: "absolute", left: 80, right: 80, top: 1140, fontFamily: FONT, textAlign: "center", color: "white", fontSize: 34, fontWeight: 800, lineHeight: 1.3 }}>
        0 factories owned by NVIDIA <span style={{ color: BLUE }}>·</span> 100% of top chips made by TSMC
      </div>
    </AbsoluteFill>
  );
};
