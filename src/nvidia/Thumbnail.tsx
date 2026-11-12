import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { FONT } from "./visuals/common";
import { NvidiaLogo } from "./visuals/NvidiaLogo";

export type ThumbProps = {
  /** número da parte (selo) */
  part: number;
  /** manchete em linhas curtas — 2 linhas funcionam melhor */
  headline: string[];
  /** número de impacto (ex.: "$130B") */
  bigNumber: string;
  /** rótulo ao lado do número */
  numberLabel: string;
  /** cor de destaque da parte */
  accent: string;
};

/**
 * Thumbnail da série: manchete no topo, apresentador (avatar do canal)
 * embaixo e a LOGO DA NVIDIA grande sobre o peito, como destaque principal.
 */
export const Thumbnail: React.FC<ThumbProps> = ({
  part,
  headline,
  bigNumber,
  numberLabel,
  accent,
}) => {
  const { width, height } = useVideoConfig();
  const wide = width > height;

  const pad = wide ? 56 : 64;
  const headSize = wide ? 86 : 118;

  // avatar ancorado na base, grande o bastante para sobrar paletó
  const avatarW = wide ? height * 1.25 : width * 1.2;
  const avatarH = avatarW / 1.0516;

  const logoW = wide ? width * 0.3 : width * 0.6;
  // o logo fica sobre o paletó, bem abaixo do queixo
  const logoCenterY = wide ? height * 0.66 : height - avatarH * 0.235;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d", overflow: "hidden" }}>
      {/* brilho e grade de fundo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 42% at 50% 60%, ${accent}33 0%, rgba(5,7,13,0) 72%)`,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <g stroke="rgba(255,255,255,0.05)" strokeWidth={2}>
          {Array.from({ length: Math.ceil(height / 100) + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={width} y1={i * 100} y2={i * 100} />
          ))}
          {Array.from({ length: Math.ceil(width / 100) + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * 100} x2={i * 100} y1={0} y2={height} />
          ))}
        </g>
        {/* faixas diagonais no canto superior direito */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={width - 240 + i * 44}
            y={-90}
            width={15}
            height={300}
            fill={accent}
            opacity={0.45 - i * 0.09}
            transform={`rotate(35 ${width - 240 + i * 44} 0)`}
          />
        ))}
        {/* halo atrás do apresentador */}
        <ellipse
          cx={wide ? width * 0.78 : width / 2}
          cy={height - avatarH * 0.42}
          rx={avatarW * 0.42}
          ry={avatarH * 0.42}
          fill={accent}
          opacity={0.14}
        />
      </svg>

      {/* apresentador (avatar do canal, fundo removido) */}
      <Img
        src={staticFile("assets/avatar.png")}
        style={{
          position: "absolute",
          width: avatarW,
          height: avatarH,
          left: wide ? width * 0.78 - avatarW / 2 : (width - avatarW) / 2,
          top: height - avatarH,
          objectFit: "contain",
          filter: "drop-shadow(0 18px 50px rgba(0,0,0,0.85))",
        }}
      />

      {/* selo PART N */}
      <div
        style={{
          position: "absolute",
          top: wide ? 40 : 70,
          left: pad,
          transform: "rotate(-3deg)",
          background: accent,
          color: "#05070d",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: wide ? 46 : 68,
          letterSpacing: 4,
          padding: wide ? "8px 24px" : "12px 34px",
          borderRadius: 18,
          boxShadow: `0 14px 44px ${accent}88`,
        }}
      >
        PART {part}
      </div>

      {/* manchete */}
      <div
        style={{
          position: "absolute",
          top: wide ? 128 : 192,
          left: pad,
          right: wide ? width * 0.46 : pad,
        }}
      >
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
              WebkitTextStroke: "12px #05070d",
              paintOrder: "stroke fill",
              textShadow: "0 12px 44px rgba(0,0,0,0.95)",
            }}
          >
            {line}
          </div>
        ))}

        {/* número de impacto, compacto */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 14,
            marginTop: wide ? 18 : 30,
            background: "rgba(5,7,13,0.82)",
            border: `3px solid ${accent}`,
            borderRadius: 999,
            padding: wide ? "8px 24px" : "12px 32px",
            boxShadow: `0 10px 36px rgba(0,0,0,0.8)`,
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: wide ? 54 : 78,
              color: accent,
              letterSpacing: -2,
            }}
          >
            {bigNumber}
          </span>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: wide ? 28 : 40,
              color: "white",
              letterSpacing: 2,
            }}
          >
            {numberLabel}
          </span>
        </div>
      </div>

      {/* LOGO DA NVIDIA — destaque principal, sobre o peito */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: logoCenterY,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <NvidiaLogo width={logoW} />
      </div>

      {/* barra inferior */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          background: accent,
        }}
      />
    </AbsoluteFill>
  );
};
