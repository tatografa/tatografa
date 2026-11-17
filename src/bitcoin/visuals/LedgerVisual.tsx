import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

const RED = "#ff3b3b";

/** O banco no centro é riscado; a razão passa a ser copiada por todos os nós. */
export const LedgerVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const cx = width / 2;
  const cy = 900;
  const R = 330;
  const n = 8;

  const cross = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const peer = interpolate(frame, [fps * 1.4, fps * 2.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THE IDEA" title="No bank. No middleman." />

      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* ligações nó-a-nó (aparecem quando o banco sai) */}
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => (
            <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={accent} strokeOpacity={0.18 * peer} strokeWidth={2} />
          )),
        )}
        {/* pacotes circulando */}
        {peer > 0.2 &&
          nodes.map((a, i) => {
            const b = nodes[(i + 3) % n];
            const p = (t * 0.5 + i / n) % 1;
            return <circle key={`p${i}`} cx={a.x + (b.x - a.x) * p} cy={a.y + (b.y - a.y) * p} r={7} fill="#fff3dd" opacity={peer} />;
          })}

        {/* banco central riscado */}
        <g opacity={1 - peer * 0.75}>
          <rect x={cx - 95} y={cy - 80} width={190} height={160} rx={10} fill="#141b26" stroke="#5b6472" strokeWidth={4} />
          <polygon points={`${cx - 112},${cy - 80} ${cx},${cy - 136} ${cx + 112},${cy - 80}`} fill="#1b2330" stroke="#5b6472" strokeWidth={4} />
          {[-52, -17, 18, 53].map((o) => (
            <rect key={o} x={cx + o} y={cy - 44} width={18} height={96} fill="#5b6472" opacity={0.5} />
          ))}
          <text x={cx} y={cy + 118} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="#8b98a8">
            BANK
          </text>
        </g>
        {/* X vermelho */}
        <g opacity={cross} strokeLinecap="round">
          <line x1={cx - 130} y1={cy - 150} x2={cx + 130} y2={cy + 110} stroke={RED} strokeWidth={18 * cross} />
          <line x1={cx + 130} y1={cy - 150} x2={cx - 130} y2={cy + 110} stroke={RED} strokeWidth={18 * cross} />
        </g>

        {/* nós, cada um com sua cópia da razão */}
        {nodes.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={46} fill="#0b111a" stroke={accent} strokeWidth={4} style={{ filter: `drop-shadow(0 0 12px ${accent}88)` }} />
            {[0, 1, 2].map((r) => (
              <rect key={r} x={p.x - 22} y={p.y - 18 + r * 13} width={44 - r * 8} height={6} rx={3} fill={accent} opacity={0.85} />
            ))}
          </g>
        ))}
      </svg>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, textAlign: "center", fontFamily: FONT, fontSize: 34, fontWeight: 900, color: "white", opacity: peer }}>
        One shared ledger · <span style={{ color: accent }}>thousands of copies</span>
      </div>
    </AbsoluteFill>
  );
};
