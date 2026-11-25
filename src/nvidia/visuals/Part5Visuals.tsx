import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./common";
import { IconTrendDown, IconTrendUp, IconUser, IconWarning } from "./Icons";
import { BigNumber, Grid, Panel, Pill } from "./ui";

const RED = "#ff3b3b";
const PAPER = "linear-gradient(180deg, #f3f0e8 0%, #e6e1d4 100%)";

const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Carimbo genérico (RESIGNED, FINAL?, etc.). */
const Stamp: React.FC<{ text: string; at: number; top: number; color?: string; size?: number; rotate?: number }> = ({
  text,
  at,
  top,
  color = RED,
  size = 104,
  rotate = -12,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 8, stiffness: 180 } });
  return (
    <div
      style={{
        position: "absolute",
        left: width / 2 - 320,
        width: 640,
        top,
        transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`,
        opacity: Math.min(1, s * 1.4),
        border: `12px solid ${color}`,
        borderRadius: 22,
        padding: "14px 10px",
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 900,
        color,
        letterSpacing: 6,
      }}
    >
      {text}
    </div>
  );
};

/** Cena 2 — o comunicado oficial (8-K) recebe o carimbo RESIGNED. */
export const FilingVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const paper = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const stampAt = 10 + fps * 2.2;
  const shake = frame > stampAt && frame < stampAt + 10 ? Math.sin(frame * 4) * 8 : 0;
  const years = Math.round(interpolate(frame, [stampAt + 6, stampAt + fps * 1.4], [0, 33], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cx = width / 2;
  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <div style={{ position: "absolute", left: cx - 330, top: 230, width: 660, height: 820, borderRadius: 18, background: PAPER, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", transform: `rotate(-2deg) scale(${paper})`, opacity: paper, padding: 44, fontFamily: FONT, color: "#1a1d24" }}>
        <div style={{ fontSize: 22, letterSpacing: 6, fontWeight: 800, color: "#6b6f78" }}>SEC · FORM 8-K</div>
        <div style={{ fontSize: 46, fontWeight: 900, marginTop: 8, lineHeight: 1.05 }}>NVIDIA Announces CEO Transition</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginTop: 10, color: "#555" }}>November 12, 2026 · effective immediately</div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ height: 12, borderRadius: 6, background: "#c9c4b6", marginTop: 26, width: `${92 - (i % 4) * 15}%` }} />
        ))}
      </div>
      <Stamp text="RESIGNED" at={stampAt} top={560} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: FONT, opacity: ease(frame, stampAt, stampAt + 10) }}>
        <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>FOUNDER · CEO SINCE 1993</div>
        <div style={{ fontSize: 120, fontWeight: 900, color: GREEN, lineHeight: 1.1 }}>{years} YEARS</div>
      </div>
    </AbsoluteFill>
  );
};

/** Cena 3 — manchetes empilhando (sem veículos reais), com o motivo atribuído a "reports". */
export const HeadlinesVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const cards = [
    { k: "OFFICIAL", t: "No reason given", c: "rgba(255,255,255,0.8)" },
    { k: "REPORTS", t: "Affairs come to light", c: "#ffb020" },
    { k: "ADMITTED", t: "One with an alleged Chinese spy", c: RED },
    { k: "BOARD", t: "Opens an investigation", c: GREEN },
  ];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(255,59,59,0.12) 0%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: 70, top: 210, fontFamily: FONT, fontSize: 28, letterSpacing: 8, fontWeight: 800, color: RED, opacity: ease(frame, 0, 10) }}>
        WHY DID HE LEAVE?
      </div>
      {cards.map((c, i) => {
        const at = 8 + i * Math.round(fps * 1.1);
        const s = spring({ frame: frame - at, fps, config: { damping: 14 } });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 60,
              width: width - 120,
              top: 280 + i * 205,
              padding: "26px 32px",
              borderRadius: 24,
              background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)",
              borderLeft: `10px solid ${c.c}`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [i % 2 ? 160 : -160, 0])}px) rotate(${(i % 2 ? 1 : -1) * 1.2}deg)`,
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 24, letterSpacing: 6, fontWeight: 800, color: c.c }}>{c.k}</div>
            <div style={{ fontSize: 54, fontWeight: 900, color: "white", marginTop: 6, lineHeight: 1.05 }}>{c.t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Avatar de iniciais (sem rosto). */
const Initials: React.FC<{ text: string; color: string; size?: number }> = ({ text, color, size = 150 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: `${color}22`, border: `4px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: size * 0.36, color, flexShrink: 0 }}>
    {text}
  </div>
);

/** Cena 4 — CEO interina + primeiro chairman separado. */
export const InterimVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const empty = 1 - ease(frame, fps * 0.8, fps * 1.4);
  const rows = [
    { at: Math.round(fps * 1.2), kicker: "INTERIM CEO", name: "Colette Kress", sub: "also stays CFO", ini: "CK", color: GREEN },
    { at: Math.round(fps * 3.4), kicker: "BOARD CHAIR · FIRST EVER", name: "Harvey Jones", sub: "a separate chairman", ini: "HJ", color: "#4fa3ff" },
  ];
  return (
    <AbsoluteFill>
      {/* cadeira vazia */}
      <div style={{ position: "absolute", left: width / 2 - 160, top: 230, width: 320, textAlign: "center", fontFamily: FONT, opacity: 0.3 + empty * 0.7 }}>
        <div style={{ color: "rgba(255,255,255,0.75)", display: "flex", justifyContent: "center" }}>
          <IconUser size={170} strokeWidth={1.4} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: 4 }}>CEO SEAT · EMPTY</div>
      </div>
      {rows.map((r, i) => {
        const s = spring({ frame: frame - r.at, fps, config: { damping: 14 } });
        return (
          <div key={i} style={{ position: "absolute", left: 60, width: width - 120, top: 560 + i * 300, display: "flex", alignItems: "center", gap: 34, padding: "30px 34px", borderRadius: 28, background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)", border: `1.5px solid ${r.color}66`, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, fontFamily: FONT }}>
            <Initials text={r.ini} color={r.color} />
            <div>
              <div style={{ fontSize: 24, letterSpacing: 5, fontWeight: 800, color: r.color }}>{r.kicker}</div>
              <div style={{ fontSize: 60, fontWeight: 900, color: "white", lineHeight: 1.05 }}>{r.name}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{r.sub}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Gráfico de linha genérico: queda (down) ou disparada (up). */
const MoveChart: React.FC<{ up: boolean; at: number; top: number }> = ({ up, at, top }) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  const gx = 110, gy = top, gw = width - 190, gh = 470;
  const N = 36;
  const shown = interpolate(frame, [10, durationInFrames - 16], [0, N], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts: string[] = [];
  let lx = gx, ly = gy;
  for (let i = 0; i <= Math.min(N, Math.floor(shown)); i++) {
    const p = i / N;
    const wobble = Math.sin(i * 1.1) * 0.025;
    let v: number;
    if (up) v = p < 0.55 ? 0.3 + wobble : 0.3 + (p - 0.55) / 0.45 * 0.62 + wobble;
    else v = p < 0.3 ? 0.82 + wobble : 0.82 - Math.min(1, (p - 0.3) / 0.45) * 0.6 + wobble;
    lx = gx + p * gw;
    ly = gy + gh - v * gh;
    pts.push(`${lx},${ly}`);
  }
  const color = up ? GREEN : RED;
  const glow = ease(frame, at, at + 10);
  return (
    <svg width={width} height={gy + gh + 40} style={{ position: "absolute", left: 0, top: 0 }}>
      <Grid x={gx} y={gy} w={gw} h={gh} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${8 + glow * 14}px ${color})` }} />
      <circle cx={lx} cy={ly} r={16} fill={color} />
    </svg>
  );
};

/** Cena 5 — a ação despenca: −19%, mais de US$ 855 bi. */
export const PlungeVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const at = Math.round(fps * 1.2);
  const loss = Math.round(interpolate(frame, [at, at + fps * 2.2], [0, 855], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%, rgba(255,59,59,0.14) 0%, rgba(0,0,0,0) 70%)" }} />
      <Panel x={50} y={200} w={width - 100} kicker="NVDA · THE WEEK HE LEFT" title="Investors panic">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10 }}>
          <BigNumber color={RED}>−${loss}B</BigNumber>
          <div style={{ paddingBottom: 14 }}>
            <Pill bg={RED} color="white"><IconTrendDown size={26} strokeWidth={3} /> up to −19%</Pill>
          </div>
        </div>
      </Panel>
      <MoveChart up={false} at={at} top={640} />
    </AbsoluteFill>
  );
};

/** Cena 6 — "does not intend to reinstate": citação + carimbo FINAL? */
export const NoReturnVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Q = "…does not intend to reinstate Jensen as CEO.";
  const typed = Math.floor(interpolate(frame, [8, 8 + fps * 2.2], [0, Q.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 250, fontFamily: FONT }}>
        <div style={{ fontSize: 26, letterSpacing: 8, fontWeight: 800, color: RED }}>NOVEMBER 17 · EARNINGS CALL</div>
        <div style={{ fontSize: 200, lineHeight: 0.6, color: RED, opacity: 0.6, marginTop: 30 }}>“</div>
        <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05, color: "white", letterSpacing: -2, minHeight: 470 }}>
          {Q.slice(0, typed)}
          <span style={{ color: RED, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>— Harvey Jones, NVIDIA board chair</div>
      </div>
      <Stamp text="FINAL?" at={Math.round(fps * 3)} top={1060} size={96} rotate={-8} />
    </AbsoluteFill>
  );
};

/** Cena 7 — Washington → conselho: setas de pressão. */
export const PressureVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const cx = width / 2;
  const a = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const b = spring({ frame: frame - fps * 1.6, fps, config: { damping: 14 } });
  const flow = (frame % 30) / 30;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 210, fontFamily: FONT, fontSize: 28, letterSpacing: 8, fontWeight: 800, color: "#4fa3ff", opacity: a }}>WASHINGTON STEPS IN</div>
      {/* prédio de governo genérico (colunas) */}
      <svg width={width} height={1400} style={{ position: "absolute", left: 0, top: 0 }}>
        <g opacity={a} transform={`translate(${cx - 230}, ${300 + (1 - a) * 40})`}>
          <polygon points="0,90 230,0 460,90" fill="#e9edf3" />
          <rect x={10} y={95} width={440} height={22} fill="#cfd6e0" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={30 + i * 72} y={125} width={34} height={190} rx={6} fill="#e9edf3" />
          ))}
          <rect x={0} y={320} width={460} height={30} fill="#cfd6e0" />
        </g>
        {/* setas de pressão */}
        {[-1, 0, 1].map((k) => {
          const x = cx + k * 150;
          const y0 = 690, y1 = 900;
          const y = y0 + ((flow + Math.abs(k) * 0.33) % 1) * (y1 - y0);
          return (
            <g key={k} opacity={b}>
              <line x1={x} x2={x} y1={y0} y2={y1} stroke="rgba(79,163,255,0.25)" strokeWidth={10} strokeLinecap="round" />
              <polygon points={`${x - 26},${y - 20} ${x + 26},${y - 20} ${x},${y + 18}`} fill="#4fa3ff" />
            </g>
          );
        })}
        {/* mesa do conselho */}
        <g opacity={b} transform={`translate(${cx - 300}, 950)`}>
          <ellipse cx={300} cy={110} rx={300} ry={95} fill="rgba(118,185,0,0.12)" stroke={GREEN} strokeWidth={4} />
          {Array.from({ length: 10 }, (_, i) => {
            const ang = (i / 10) * Math.PI * 2;
            return <circle key={i} cx={300 + Math.cos(ang) * 330} cy={110 + Math.sin(ang) * 125} r={26} fill="#1b2433" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />;
          })}
          <text x={300} y={122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="white">NVIDIA BOARD</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1250, textAlign: "center", fontFamily: FONT, opacity: ease(frame, fps * 2.6, fps * 3.2) }}>
        <Pill bg="#4fa3ff" color="#05070d" size={30}>"No national security risk" — board & White House</Pill>
      </div>
    </AbsoluteFill>
  );
};

/** Cena 8 — votação unânime + contador de 11 dias. */
export const ReinstatedVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const days = Math.round(interpolate(frame, [fps * 2.4, fps * 4.2], [0, 11], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(118,185,0,0.14) 0%, rgba(0,0,0,0) 70%)" }} />
      <Panel x={50} y={200} w={width - 100} kicker="NOVEMBER 23, 2026" title="Board vote: reinstate Jensen Huang">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 22 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const s = spring({ frame: frame - (10 + i * 4), fps, config: { damping: 12 } });
            return (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 18, background: `${GREEN}22`, border: `3px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, fontSize: 44, color: GREEN, fontWeight: 900 }}>
                ✓
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18 }}>
          <Pill size={30}>UNANIMOUS · effective immediately</Pill>
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: FONT, opacity: ease(frame, fps * 2.2, fps * 2.6) }}>
        <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>NOV 12 → NOV 23</div>
        <div style={{ fontSize: 240, fontWeight: 900, color: GREEN, lineHeight: 1, textShadow: `0 0 50px ${GREEN}66` }}>{days}</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: "white" }}>DAYS OUT</div>
      </div>
    </AbsoluteFill>
  );
};

/** Cena 9 — a ação dispara +31%: melhor dia desde 2003. */
export const SurgeVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const at = Math.round(fps * 1.4);
  const pct = interpolate(frame, [at, at + fps * 1.6], [0, 31.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 45%, rgba(118,185,0,0.16) 0%, rgba(0,0,0,0) 70%)" }} />
      <Panel x={50} y={200} w={width - 100} kicker="NVDA · NOVEMBER 23" title="The comeback rally">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10 }}>
          <BigNumber>+{pct.toFixed(1)}%</BigNumber>
          <div style={{ paddingBottom: 14 }}>
            <Pill><IconTrendUp size={26} strokeWidth={3} /> best day since 2003</Pill>
          </div>
        </div>
      </Panel>
      <MoveChart up at={at} top={640} />
    </AbsoluteFill>
  );
};

/** Cena 10 — investigações em andamento. */
export const ProbeVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const items = [
    { k: "INDEPENDENT DIRECTORS", t: "Board committee investigation", c: "#ffb020" },
    { k: "STATE OF CALIFORNIA", t: "Attorney General probe", c: "#4fa3ff" },
  ];
  const t = frame / fps;
  const mx = width / 2 + Math.sin(t * 1.6) * 180;
  const my = 420 + Math.cos(t * 1.2) * 50;
  return (
    <AbsoluteFill>
      {/* lupa */}
      <svg width={width} height={760} style={{ position: "absolute", left: 0, top: 0, opacity: ease(frame, 0, 10) }}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={140} y={260 + i * 56} width={width - 280 - (i % 3) * 120} height={18} rx={9} fill="rgba(255,255,255,0.12)" />
        ))}
        <circle cx={mx} cy={my} r={120} fill="rgba(255,176,32,0.08)" stroke="#ffb020" strokeWidth={14} />
        <line x1={mx + 85} y1={my + 85} x2={mx + 190} y2={my + 190} stroke="#ffb020" strokeWidth={26} strokeLinecap="round" />
      </svg>
      {items.map((it, i) => {
        const s = spring({ frame: frame - (fps * 0.8 + i * fps * 1.4), fps, config: { damping: 14 } });
        const blink = Math.floor(frame / 12) % 2;
        return (
          <div key={i} style={{ position: "absolute", left: 60, width: width - 120, top: 800 + i * 240, padding: "26px 32px", borderRadius: 24, background: "linear-gradient(180deg, rgba(14,20,30,0.95) 0%, rgba(8,12,19,0.95) 100%)", borderLeft: `10px solid ${it.c}`, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, fontFamily: FONT }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 24, letterSpacing: 5, fontWeight: 800, color: it.c }}>{it.k}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: RED }}>
                <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: blink ? 1 : 0.3 }} /> ONGOING
              </div>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: "white", marginTop: 6, lineHeight: 1.05 }}>{it.t}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", gap: 12, alignItems: "center", fontFamily: FONT, fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.75)", opacity: ease(frame, fps * 3.6, fps * 4.2) }}>
        <span style={{ color: "#ffb020", display: "flex" }}><IconWarning size={36} strokeWidth={2.6} /></span>
        The story isn't over
      </div>
    </AbsoluteFill>
  );
};
