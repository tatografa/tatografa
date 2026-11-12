import { AbsoluteFill, useVideoConfig } from "remotion";
import { FONT, GREEN } from "./visuals/common";
import { IconChip, IconTrendUp } from "./visuals/Icons";

export type ThumbProps = {
  /** número da parte (aparece no selo) */
  part: number;
  /** manchete em linhas curtas — 2 a 3 linhas funcionam melhor */
  headline: string[];
  /** número de impacto (ex.: "$130B") */
  bigNumber: string;
  /** rótulo abaixo/ao lado do número */
  numberLabel: string;
  /** cor de destaque da parte */
  accent: string;
  /** arte secundária ao redor da silhueta */
  motif: "chips" | "chart";
};

/**
 * Silhueta estilizada do CEO (jaqueta de couro, sem rosto).
 * Representação genérica — não é retrato de pessoa real.
 */
const Ceo: React.FC<{ cx: number; top: number; scale: number; accent: string }> = ({
  cx,
  top,
  scale,
  accent,
}) => {
  const headR = 86 * scale;
  const headY = top + headR;
  const shoulderY = headY + headR + 30 * scale;
  const bottomY = shoulderY + 420 * scale;
  const halfW = 250 * scale;

  return (
    <g>
      <defs>
        <linearGradient id="thumbJacket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b313a" />
          <stop offset="45%" stopColor="#0b0d12" />
          <stop offset="72%" stopColor="#1f242c" />
          <stop offset="100%" stopColor="#07080b" />
        </linearGradient>
        <radialGradient id="thumbRim" cx="50%" cy="40%" r="60%">
          <stop offset="60%" stopColor={accent} stopOpacity="0" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* brilho atrás */}
      <ellipse cx={cx} cy={shoulderY + 160 * scale} rx={halfW * 1.5} ry={320 * scale} fill="url(#thumbRim)" />

      {/* cabeça */}
      <circle cx={cx} cy={headY} r={headR} fill="#0b0d12" stroke={accent} strokeWidth={7} />
      {/* pescoço */}
      <rect x={cx - 34 * scale} y={headY + headR - 14} width={68 * scale} height={60 * scale} fill="#0b0d12" />

      {/* jaqueta */}
      <path
        d={`M${cx - halfW},${bottomY}
            C${cx - halfW - 14},${shoulderY + 150 * scale} ${cx - 200 * scale},${shoulderY + 40 * scale} ${cx - 96 * scale},${shoulderY + 10 * scale}
            L${cx},${shoulderY + 160 * scale}
            L${cx + 96 * scale},${shoulderY + 10 * scale}
            C${cx + 200 * scale},${shoulderY + 40 * scale} ${cx + halfW + 14},${shoulderY + 150 * scale} ${cx + halfW},${bottomY} Z`}
        fill="url(#thumbJacket)"
        stroke={accent}
        strokeWidth={7}
      />
      {/* camiseta em V */}
      <path
        d={`M${cx - 96 * scale},${shoulderY + 10 * scale} L${cx},${shoulderY + 160 * scale} L${cx + 96 * scale},${shoulderY + 10 * scale} Z`}
        fill="#15181e"
      />
      {/* lapelas */}
      <path d={`M${cx - 96 * scale},${shoulderY + 10 * scale} L${cx - 30 * scale},${shoulderY + 250 * scale}`} stroke="#656f7d" strokeWidth={6} opacity={0.7} />
      <path d={`M${cx + 96 * scale},${shoulderY + 10 * scale} L${cx + 30 * scale},${shoulderY + 250 * scale}`} stroke="#656f7d" strokeWidth={6} opacity={0.7} />
      {/* brilho do couro */}
      <path
        d={`M${cx - 170 * scale},${shoulderY + 120 * scale} Q${cx - 196 * scale},${shoulderY + 260 * scale} ${cx - 180 * scale},${bottomY - 40 * scale}`}
        stroke="#ffffff"
        strokeOpacity={0.14}
        strokeWidth={16}
        fill="none"
      />
    </g>
  );
};

export const Thumbnail: React.FC<ThumbProps> = ({
  part,
  headline,
  bigNumber,
  numberLabel,
  accent,
  motif,
}) => {
  const { width, height } = useVideoConfig();
  const wide = width > height;

  // layout
  const pad = wide ? 70 : 70;
  const headSize = wide ? 96 : 128;
  const numSize = wide ? 190 : 250;
  const textTop = wide ? 120 : 300;
  // no motivo "chart" a silhueta vai para a direita, abrindo espaço às barras
  const ceoCx = wide ? width - 300 : motif === "chart" ? width * 0.68 : width / 2;
  const ceoTop = wide ? 150 : 1120;
  const ceoScale = wide ? 0.78 : 1.05;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d", overflow: "hidden" }}>
      {/* brilho de fundo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 50% at 50% 38%, ${accent}2e 0%, rgba(5,7,13,0) 72%)`,
        }}
      />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* grade */}
        <g stroke="rgba(255,255,255,0.045)" strokeWidth={2}>
          {Array.from({ length: 22 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={width} y1={i * 100} y2={i * 100} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`v${i}`} x1={i * 100} x2={i * 100} y1={0} y2={height} />
          ))}
        </g>

        {/* faixas diagonais no canto */}
        <g opacity={0.5}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={width - 260 + i * 46}
              y={-80}
              width={16}
              height={320}
              fill={accent}
              opacity={0.5 - i * 0.1}
              transform={`rotate(35 ${width - 260 + i * 46} 0)`}
            />
          ))}
        </g>

        {/* raios atrás do número */}
        <g opacity={0.33}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            const cx = wide ? pad + 300 : width / 2;
            const cy = wide ? height - 170 : 980;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(a) * 900}
                y2={cy + Math.sin(a) * 900}
                stroke={accent}
                strokeWidth={i % 2 ? 10 : 26}
                opacity={0.1}
              />
            );
          })}
        </g>

        {/* motivo secundário: barras subindo (atrás da silhueta, à esquerda) */}
        {motif === "chart" &&
          !wide &&
          [0, 1, 2, 3].map((i) => {
            const bw = wide ? 54 : 76;
            const gap = wide ? 18 : 24;
            const x = pad + i * (bw + gap);
            const h = (wide ? 60 : 90) + i * (wide ? 55 : 85);
            const y = height - (wide ? 90 : 110) - h;
            return (
              <g key={i}>
                <rect x={x} y={y} width={bw} height={h} rx={10} fill={accent} opacity={0.28 + i * 0.14} />
                <rect x={x} y={y} width={bw} height={9} rx={4} fill="#eaffd0" opacity={0.85} />
              </g>
            );
          })}

        {/* silhueta do CEO */}
        <Ceo cx={ceoCx} top={ceoTop} scale={ceoScale} accent={accent} />

        {/* motivo secundário: chips flutuando */}
        {motif === "chips" &&
          [
            { x: 130, y: height - 420, s: 1.1, r: -14 },
            { x: width - 150, y: height - 300, s: 0.85, r: 18 },
            { x: 200, y: height - 170, s: 0.7, r: 8 },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${c.s})`} opacity={0.9}>
              <rect x={-52} y={-52} width={104} height={104} rx={14} fill="#0c1420" stroke={accent} strokeWidth={6} />
              <rect x={-22} y={-22} width={44} height={44} rx={6} fill={accent} />
              {[-30, -10, 10, 30].map((o) => (
                <g key={o} fill={accent}>
                  <rect x={o - 5} y={-70} width={10} height={18} />
                  <rect x={o - 5} y={52} width={10} height={18} />
                  <rect x={-70} y={o - 5} width={18} height={10} />
                  <rect x={52} y={o - 5} width={18} height={10} />
                </g>
              ))}
            </g>
          ))}

      </svg>

      {/* selo PART N */}
      <div
        style={{
          position: "absolute",
          top: wide ? 46 : 92,
          left: pad,
          transform: "rotate(-3deg)",
          background: accent,
          color: "#05070d",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: wide ? 56 : 76,
          letterSpacing: 4,
          padding: wide ? "10px 30px" : "16px 40px",
          borderRadius: 20,
          boxShadow: `0 16px 50px ${accent}77`,
        }}
      >
        PART {part}
      </div>

      {/* manchete */}
      <div style={{ position: "absolute", top: textTop, left: pad, right: wide ? width * 0.42 : pad }}>
        {headline.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: headSize,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "white",
              WebkitTextStroke: "10px #05070d",
              paintOrder: "stroke fill",
              textShadow: `0 10px 40px rgba(0,0,0,0.9)`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* número de impacto */}
      <div
        style={{
          position: "absolute",
          left: pad,
          top: wide ? undefined : 860,
          bottom: wide ? 90 : undefined,
          display: "flex",
          alignItems: "flex-end",
          gap: 22,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: numSize,
            lineHeight: 0.92,
            letterSpacing: -8,
            color: accent,
            WebkitTextStroke: "10px #05070d",
            paintOrder: "stroke fill",
            textShadow: `0 0 70px ${accent}aa, 0 14px 40px rgba(0,0,0,0.95)`,
          }}
        >
          {bigNumber}
        </div>
        <div
          style={{
            paddingBottom: wide ? 26 : 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: wide ? 36 : 46,
            color: "white",
            textShadow: "0 6px 24px rgba(0,0,0,0.95)",
          }}
        >
          <span style={{ color: accent, display: "flex" }}>
            {motif === "chart" ? <IconTrendUp size={wide ? 40 : 52} strokeWidth={3.2} /> : <IconChip size={wide ? 40 : 52} strokeWidth={2.6} />}
          </span>
          {numberLabel}
        </div>
      </div>

      {/* rodapé: marca */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: wide ? 70 : 92,
          background: "linear-gradient(90deg, rgba(5,7,13,0.96) 0%, rgba(5,7,13,0.7) 100%)",
          borderTop: `5px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${pad}px`,
          fontFamily: FONT,
        }}
      >
        <span style={{ fontSize: wide ? 34 : 44, fontWeight: 900, color: "white", letterSpacing: 10 }}>
          NVIDIA
        </span>
        <span style={{ fontSize: wide ? 24 : 30, fontWeight: 800, color: accent, letterSpacing: 5 }}>
          THE STORY
        </span>
      </div>
    </AbsoluteFill>
  );
};
