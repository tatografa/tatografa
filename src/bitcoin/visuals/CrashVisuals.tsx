/**
 * Visuais do Bitcoin Parte 4 — a queda de novembro de 2026.
 * Números conforme reportado por CNBC, CoinDesk, Cointelegraph,
 * Investing.com e The Block em 20–21/nov/2026 (ver roteiro-bitcoin-parte4.md).
 */
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { IconTrendDown } from "../../nvidia/visuals/Icons";
import { Grid, Panel, Pill } from "../../nvidia/visuals/ui";
import { BtcSymbol, FONT } from "./BtcCommon";
import { MONO, OK, RED } from "./Blocks";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ */
/* 1. Hook: a linha de preço atravessando o "chão" dos US$ 60 mil       */
/* ------------------------------------------------------------------ */
export const BreakLineVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const gx = 90, gy = 380, gw = width - 180, gh = 600;
  const levelV = 0.5;
  const toY = (v: number) => gy + gh - v * gh;
  const N = 46;
  const prog = interpolate(frame, [6, fps * 3.4], [0, 1], clampOpts);
  const pts: { x: number; y: number; v: number }[] = [];
  for (let i = 0; i <= Math.floor(prog * N); i++) {
    const p = i / N;
    const v = p < 0.55 ? 0.9 - p * 0.55 + Math.sin(i * 1.3) * 0.03 : 0.6 - Math.pow((p - 0.55) / 0.45, 1.3) * 0.5 + Math.sin(i * 1.9) * 0.015;
    pts.push({ x: gx + p * gw, y: toY(v), v });
  }
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const last = pts[pts.length - 1];
  const broken = !!last && last.v < levelV;
  const crossX = pts.find((p) => p.v < levelV)?.x ?? gx + gw;
  const flash = broken ? 0.5 + Math.sin(frame / 3) * 0.5 : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 50% 40%, rgba(255,59,59,${broken ? 0.16 : 0.04}) 0%, rgba(0,0,0,0) 70%)` }} />
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Grid x={gx} y={gy} w={gw} h={gh} rows={4} cols={5} />
        {/* o "chão" de US$ 60 mil, que racha quando a linha passa */}
        <line x1={gx} x2={broken ? crossX - 30 : gx + gw} y1={toY(levelV)} y2={toY(levelV)} stroke={broken ? RED : "#ffffff"} strokeOpacity={0.85} strokeWidth={5} strokeDasharray="18 12" />
        {broken && <line x1={crossX + 30} x2={gx + gw} y1={toY(levelV)} y2={toY(levelV)} stroke={RED} strokeOpacity={0.85} strokeWidth={5} strokeDasharray="18 12" />}
        <rect x={gx + gw - 210} y={toY(levelV) - 58} width={210} height={46} rx={10} fill={broken ? RED : "#ffffff"} />
        <text x={gx + gw - 105} y={toY(levelV) - 26} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#05070d">
          $60,000
        </text>
        <polyline points={line} fill="none" stroke={broken ? RED : accent} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${broken ? RED : accent})` }} />
        {last && <circle cx={last.x} cy={last.y} r={14} fill="#fff" />}
        {broken && <circle cx={crossX} cy={toY(levelV)} r={30 + flash * 24} fill="none" stroke={RED} strokeWidth={5} opacity={1 - flash * 0.6} />}
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Recorde × agora                                                  */
/* ------------------------------------------------------------------ */
export const PeakNowVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const base = 1260;
  const maxH = 680;
  const g1 = spring({ frame: frame - 8, fps, config: { damping: 15 } });
  const g2 = spring({ frame: frame - 26, fps, config: { damping: 15 } });
  const pct = spring({ frame: frame - Math.round(fps * 1.6), fps, config: { damping: 10 } });
  const h1 = maxH * g1;
  const h2 = maxH * (60 / 126) * g2;
  const bw = 270;
  const x1 = 150, x2 = width - 150 - bw;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="FROM THE PEAK" title="Less than half its record">
        <div style={{ marginTop: 14 }}>
          <Pill bg={RED} color="white">
            <IconTrendDown size={26} strokeWidth={3} /> below $60K · Nov 20
          </Pill>
        </div>
      </Panel>
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={80} x2={width - 80} y1={base} y2={base} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        <rect x={x1} y={base - h1} width={bw} height={h1} rx={16} fill={accent} style={{ filter: `drop-shadow(0 0 20px ${accent}88)` }} />
        <rect x={x2} y={base - h2} width={bw} height={h2} rx={16} fill={RED} style={{ filter: `drop-shadow(0 0 20px ${RED}88)` }} />
        <text x={x1 + bw / 2} y={base - h1 - 26} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill="white" opacity={g1}>
          $126K
        </text>
        <text x={x2 + bw / 2} y={base - h2 - 26} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill="white" opacity={g2}>
          {"<$60K"}
        </text>
        <text x={x1 + bw / 2} y={base + 48} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="rgba(255,255,255,0.7)">
          record · Oct 2025
        </text>
        <text x={x2 + bw / 2} y={base + 48} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="rgba(255,255,255,0.7)">
          Nov 20, 2026
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: width / 2,
          right: 0,
          top: 600,
          textAlign: "center",
          transform: `scale(${pct})`,
          opacity: pct,
          fontFamily: FONT,
          fontSize: 120,
          fontWeight: 900,
          color: RED,
          textShadow: `0 0 50px ${RED}88`,
        }}
      >
        −52%
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Sete semanas seguidas no vermelho                                */
/* ------------------------------------------------------------------ */
export const StreakVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const n = 7;
  const bw = 90;
  const gap = (width - 160 - n * bw) / (n - 1);
  const top0 = 470;
  const stepY = 90;
  const bodyH = 190;
  const big = spring({ frame: frame - Math.round(fps * 1.5), fps, config: { damping: 11 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="WEEKLY CANDLES" title="Red, red, red, red, red, red, red" />
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const s = spring({ frame: frame - 6 - i * 6, fps, config: { damping: 14 } });
          const x = 80 + i * (bw + gap);
          const y = top0 + i * stepY;
          return (
            <g key={i} opacity={s} transform={`translate(0 ${(1 - s) * -40})`}>
              <line x1={x + bw / 2} x2={x + bw / 2} y1={y - 40} y2={y + bodyH + 40} stroke={RED} strokeWidth={5} />
              <rect x={x} y={y} width={bw} height={bodyH} rx={10} fill={RED} style={{ filter: `drop-shadow(0 0 12px ${RED}88)` }} />
              <text x={x + bw / 2} y={top0 + (n - 1) * stepY + bodyH + 110} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="rgba(255,255,255,0.65)">
                W{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontFamily: FONT, transform: `scale(${big})`, opacity: big }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: "white" }}>7 weeks in a row</span>
        <div style={{ fontSize: 32, fontWeight: 800, color: RED, marginTop: 6 }}>longest losing streak since 2022</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4. O teste do "ouro digital": S&P 500 × Bitcoin                     */
/* ------------------------------------------------------------------ */
export const GoldTestVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const x0 = 80;
  const scale = (width - 2 * x0 - 230) / 27; // a barra do Bitcoin ocupa quase tudo
  const rows = [
    { name: "S&P 500", pct: 6.3, color: "#8b98a8", delay: 10 },
    { name: "Bitcoin", pct: 27, color: RED, delay: 24 },
  ];
  const strike = spring({ frame: frame - Math.round(fps * 2.4), fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="OCT 6 → NOV 18, 2026" title="Falling harder than stocks">
        <div style={{ marginTop: 14 }}>
          <Pill>AI & tech stocks are selling off</Pill>
        </div>
      </Panel>

      {rows.map((r, i) => {
        const s = spring({ frame: frame - r.delay, fps, config: { damping: 15 } });
        const w = r.pct * scale * s;
        const y = 500 + i * 250;
        return (
          <div key={r.name} style={{ position: "absolute", left: x0, top: y, fontFamily: FONT }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: "white" }}>{r.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 14 }}>
              <div style={{ width: Math.max(w, 8), height: 96, borderRadius: 16, background: r.color, boxShadow: `0 0 24px ${r.color}66` }} />
              <div style={{ fontSize: 58, fontWeight: 900, color: r.color, opacity: s, whiteSpace: "nowrap" }}>−{(r.pct * s).toFixed(1)}%</div>
            </div>
          </div>
        );
      })}

      {/* "ouro digital?" riscado */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1120, textAlign: "center", fontFamily: FONT }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, position: "relative" }}>
          <div style={{ width: 92, height: 92, borderRadius: 46, background: "radial-gradient(circle at 34% 28%, #fff0b3 0%, #e8b923 55%, #a87b0a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BtcSymbol size={54} color="#5a3f00" weight={11} />
          </div>
          <span style={{ fontSize: 58, fontWeight: 900, color: "#e8c36a" }}>“Digital gold”?</span>
          <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 9, borderRadius: 5, background: RED, transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: "left center" }} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: accent, marginTop: 18, opacity: strike }}>trading like a risky tech stock</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Juros altos por mais tempo                                        */
/* ------------------------------------------------------------------ */
export const RatesVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const cx = width / 2, cy = 860, R = 300;
  const needle = interpolate(spring({ frame: frame - 8, fps, config: { damping: 9 } }), [0, 1], [0.15, 0.82]);
  const ang = Math.PI * (1 - needle);
  const arc = (a0: number, a1: number) => {
    const p0 = [cx + R * Math.cos(Math.PI * (1 - a0)), cy - R * Math.sin(Math.PI * (1 - a0))];
    const p1 = [cx + R * Math.cos(Math.PI * (1 - a1)), cy - R * Math.sin(Math.PI * (1 - a1))];
    return `M${p0[0]},${p0[1]} A${R},${R} 0 0 1 ${p1[0]},${p1[1]}`;
  };

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="INTEREST RATES" title="Higher for longer" />
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={arc(0, 0.33)} fill="none" stroke={OK} strokeWidth={46} />
        <path d={arc(0.34, 0.66)} fill="none" stroke="#ffb347" strokeWidth={46} />
        <path d={arc(0.67, 1)} fill="none" stroke={RED} strokeWidth={46} />
        <line x1={cx} y1={cy} x2={cx + (R - 40) * Math.cos(ang)} y2={cy - (R - 40) * Math.sin(ang)} stroke="white" strokeWidth={12} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={26} fill="white" />
        <text x={cx - R} y={cy + 66} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={OK}>LOW</text>
        <text x={cx + R} y={cy + 66} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={RED}>HIGH</text>
      </svg>

      {/* dinheiro saindo dos ativos de risco */}
      <div style={{ position: "absolute", left: 70, top: 1010, width: 380, padding: "22px 18px", borderRadius: 22, border: `2px solid ${RED}`, background: "rgba(60,12,14,0.6)", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: RED, letterSpacing: 3 }}>RISKY ASSETS</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "white", marginTop: 6 }}>crypto · tech stocks</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 1010, width: 380, padding: "22px 18px", borderRadius: 22, border: `2px solid ${OK}`, background: "rgba(10,50,30,0.5)", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: OK, letterSpacing: 3 }}>SAFE YIELD</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "white", marginTop: 6 }}>cash · bonds</div>
      </div>
      {[0, 0.33, 0.66].map((off, i) => {
        const p = (t * 0.6 + off) % 1;
        return (
          <div key={i} style={{ position: "absolute", left: 455 + p * 150, top: 1050, opacity: 1 - Math.abs(p - 0.5) * 1.4 }}>
            <BtcSymbol size={44} color={accent} weight={11} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Saída dos ETFs                                                    */
/* ------------------------------------------------------------------ */
export const EtfOutVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const count = Math.round(interpolate(frame, [10, 10 + fps * 1.8], [0, 582], clampOpts));
  const cx = width / 2;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="US SPOT BITCOIN ETFs" title="Investors are pulling out" />

      {/* cofre */}
      <div style={{ position: "absolute", left: cx - 210, top: 480, width: 420, height: 380, borderRadius: 30, background: "linear-gradient(180deg, #1c2330 0%, #0e131b 100%)", border: `5px solid ${accent}`, boxShadow: `0 0 40px ${accent}44` }}>
        <div style={{ position: "absolute", left: 120, top: 100, width: 180, height: 180, borderRadius: 90, border: `10px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BtcSymbol size={90} color={accent} weight={11} />
        </div>
      </div>

      {/* moedas saindo */}
      {Array.from({ length: 9 }, (_, i) => {
        const p = (t * 0.55 + i / 9) % 1;
        const a = -0.9 + (i % 5) * 0.45;
        const x = cx + Math.sin(a) * p * 420;
        const y = 860 + p * 330;
        return (
          <div key={i} style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 30, background: accent, opacity: 1 - p, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${p * 200}deg)` }}>
            <BtcSymbol size={36} color="#05070d" weight={12} />
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 140, fontWeight: 900, color: RED, lineHeight: 1, textShadow: `0 0 40px ${RED}66` }}>−${count}M</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "white", marginTop: 6 }}>in a single day</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Liquidações em cascata                                            */
/* ------------------------------------------------------------------ */
export const LiquidationVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const levs = [5, 10, 20, 25, 50, 100, 10, 20, 50, 5, 25, 100, 20, 10, 50];
  const cols = 3;
  const cw = (width - 140 - 2 * 20) / cols;
  const ch = 118;
  const total = interpolate(frame, [10, fps * 3.2], [0, 2.0], clampOpts);

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="LEVERAGE" title="Borrowed bets, forced out">
        <div style={{ marginTop: 14 }}>
          <Pill bg={RED} color="white">${total.toFixed(1)}B+ wiped out in 24h</Pill>
        </div>
      </Panel>

      {levs.map((lev, k) => {
        const c = k % cols;
        const r = Math.floor(k / cols);
        // alavancagens maiores quebram primeiro
        const at = 14 + (1 - lev / 100) * fps * 2 + r * 3;
        const dead = frame >= at;
        const pop = spring({ frame: frame - at, fps, config: { damping: 10 } });
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 70 + c * (cw + 20),
              top: 470 + r * (ch + 18),
              width: cw,
              height: ch,
              borderRadius: 18,
              background: dead ? "rgba(70,12,14,0.92)" : "rgba(14,20,30,0.95)",
              border: `2px solid ${dead ? RED : "rgba(255,255,255,0.18)"}`,
              boxShadow: dead ? `0 0 ${18 * pop}px ${RED}88` : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              transform: dead ? `scale(${1 + (1 - pop) * 0.12})` : undefined,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: dead ? "#ffb3b3" : "white" }}>LONG {lev}×</div>
            <div style={{ fontSize: dead ? 22 : 20, fontWeight: 900, color: dead ? RED : OK, letterSpacing: 2, marginTop: 4 }}>{dead ? "LIQUIDATED" : "OPEN"}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Abaixo do custo de mineração                                     */
/* ------------------------------------------------------------------ */
export const MineCostVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const maxW = width - 200;
  const g1 = spring({ frame: frame - 8, fps, config: { damping: 15 } });
  const g2 = spring({ frame: frame - 24, fps, config: { damping: 15 } });
  const gapOp = interpolate(frame, [fps * 1.4, fps * 2.2], [0, 1], clampOpts);
  const w1 = maxW * g1;
  const w2 = maxW * (60 / 86) * g2;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="JPMORGAN ESTIMATE" title="Mining at a loss">
        <div style={{ marginTop: 14 }}>
          <Pill>Cost to produce 1 BTC</Pill>
        </div>
      </Panel>

      <div style={{ position: "absolute", left: 100, top: 520, fontFamily: FONT }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "white" }}>Cost to mine</div>
        <div style={{ marginTop: 14, width: w1, height: 110, borderRadius: 18, background: `repeating-linear-gradient(45deg, ${accent}, ${accent} 18px, ${accent}cc 18px, ${accent}cc 36px)`, boxShadow: `0 0 24px ${accent}66`, display: "flex", alignItems: "center", paddingLeft: 26, boxSizing: "border-box" }}>
          <span style={{ fontSize: 54, fontWeight: 900, color: "#05070d", opacity: g1 }}>≈ $86,000</span>
        </div>

        <div style={{ fontSize: 34, fontWeight: 900, color: "white", marginTop: 60 }}>Market price</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
          <div style={{ width: w2, height: 110, borderRadius: 18, background: RED, boxShadow: `0 0 24px ${RED}66`, display: "flex", alignItems: "center", paddingLeft: 26, boxSizing: "border-box" }}>
            <span style={{ fontSize: 54, fontWeight: 900, color: "white", opacity: g2 }}>{"< $60,000"}</span>
          </div>
          <div style={{ width: maxW - w2, height: 110, borderRadius: 18, border: `4px dashed ${RED}`, marginLeft: 10, opacity: gapOp, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: RED }}>GAP</span>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: 1060, textAlign: "center", fontFamily: FONT, opacity: gapOp }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: "white" }}>
          Price is <span style={{ color: RED }}>~30% below</span> the cost to make it
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>JPMorgan analyst estimate · Nov 2026</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 9. Já caiu assim antes                                               */
/* ------------------------------------------------------------------ */
const CRASHES = [
  { year: "2011", pct: 93, done: true },
  { year: "2015", pct: 86, done: true },
  { year: "2018", pct: 84, done: true },
  { year: "2022", pct: 77, done: true },
  { year: "2026", pct: 52, done: false },
];

export const HistoryVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const top = 470;
  const maxH = 640;
  const n = CRASHES.length;
  const bw = 140;
  const gap = (width - 140 - n * bw) / (n - 1);

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="IT HAS HAPPENED BEFORE" title="Every big crash, peak to bottom" />
      <svg width={width} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={50} x2={width - 50} y1={top} y2={top} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
        {CRASHES.map((c, i) => {
          const s = spring({ frame: frame - 8 - i * 9, fps, config: { damping: 15 } });
          const h = (c.pct / 100) * maxH * s;
          const x = 70 + i * (bw + gap);
          const now = !c.done;
          return (
            <g key={c.year}>
              <rect x={x} y={top} width={bw} height={h} rx={14} fill={now ? RED : "rgba(255,59,59,0.45)"} stroke={now ? "#ffb3b3" : "none"} strokeWidth={now ? 4 : 0} style={now ? { filter: `drop-shadow(0 0 22px ${RED})` } : undefined} />
              <text x={x + bw / 2} y={top + h + 52} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill="white" opacity={s}>
                −{c.pct}%
              </text>
              <text x={x + bw / 2} y={top - 22} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={now ? RED : "rgba(255,255,255,0.75)"}>
                {c.year}
              </text>
              <text x={x + bw / 2} y={top + h + 96} textAnchor="middle" fontFamily={FONT} fontSize={c.done ? 22 : 26} fontWeight={900} fill={c.done ? OK : RED} opacity={s}>
                {c.done ? "RECOVERED ✓" : "SO FAR · ?"}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>
        Past recoveries don't guarantee future ones
      </div>
    </AbsoluteFill>
  );
};
