import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { FONT } from "./visuals/common";
import { NvidiaLogo } from "./visuals/NvidiaLogo";

export type ThumbProps = {
  /** número da parte (selo) */
  part: number;
  /** manchete em linhas curtas */
  headline: string[];
  /** número de impacto (ex.: "$130B") */
  bigNumber: string;
  /** rótulo ao lado do número */
  numberLabel: string;
  /** cor de destaque da série */
  accent: string;
  /** foto real (em public/), usada full-bleed */
  photo?: string;
  /** crédito obrigatório da foto (licença CC) */
  photoCredit?: string;
  /** arquivo do logo oficial (em public/); sem ele usa o desenho próprio da NVIDIA */
  logoSrc?: string;
  /** sem foto: "avatar" = avatar do canal; "satoshi" = silhueta encapuzada anônima */
  figure?: "avatar" | "satoshi";
};

const GENESIS_HASH = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";

/**
 * Silhueta encapuzada do criador anônimo, com "?" no lugar do rosto.
 * Desenhada no sistema de coordenadas do layout vertical (pico do capuz em
 * 540,560) e reposicionada com translate/scale.
 */
export const SatoshiFigure: React.FC<{ cx: number; top: number; k: number; accent: string }> = ({ cx, top, k, accent }) => (
  <g transform={`translate(${cx} ${top}) scale(${k}) translate(-540 -560)`}>
    <defs>
      <linearGradient id="hoodie" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2a2f38" />
        <stop offset="50%" stopColor="#11141a" />
        <stop offset="100%" stopColor="#07080b" />
      </linearGradient>
      <radialGradient id="faceVoid" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#000" />
        <stop offset="100%" stopColor="#05070b" />
      </radialGradient>
    </defs>
    {/* brilho atrás */}
    <ellipse cx={540} cy={1180} rx={560} ry={620} fill={accent} opacity={0.13} />
    {/* corpo / moletom */}
    <path
      d="M-60,1960 C-40,1460 150,1235 330,1195 L750,1195 C930,1235 1120,1460 1140,1960 Z"
      fill="url(#hoodie)"
      stroke={accent}
      strokeOpacity={0.75}
      strokeWidth={7}
    />
    {/* capuz */}
    <path
      d="M240,1260 C190,960 245,640 540,560 C835,640 890,960 840,1260 C760,1215 640,1195 540,1195 C440,1195 320,1215 240,1260 Z"
      fill="url(#hoodie)"
      stroke={accent}
      strokeOpacity={0.85}
      strokeWidth={7}
    />
    {/* abertura do rosto */}
    <ellipse cx={540} cy={930} rx={172} ry={215} fill="url(#faceVoid)" />
    <text
      x={540}
      y={1022}
      textAnchor="middle"
      fontFamily={FONT}
      fontSize={290}
      fontWeight={900}
      fill={accent}
      style={{ filter: `drop-shadow(0 0 30px ${accent})` }}
    >
      ?
    </text>
  </g>
);

/**
 * Thumbnail da série: manchete no topo, pessoa (foto real, avatar ou a
 * silhueta do Satoshi) e o LOGO grande sobre o peito, como destaque.
 */
export const Thumbnail: React.FC<ThumbProps> = ({
  part,
  headline,
  bigNumber,
  numberLabel,
  accent,
  photo,
  photoCredit,
  logoSrc,
  figure = "avatar",
}) => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const satoshi = !photo && figure === "satoshi";

  const pad = wide ? 56 : 64;
  // a manchete encolhe para caber na coluna de texto
  const textRight = wide ? width * 0.46 : pad;
  const textW = width - pad - textRight;
  const longest = Math.max(...headline.map((l) => l.length));
  const headSize = Math.min(wide ? 86 : 118, textW / (longest * 0.62));

  const avatarW = wide ? height * 1.25 : width * 1.2;
  const avatarH = avatarW / 1.0516;

  // geometria da silhueta (layout vertical é a referência, k=1)
  const sk = wide ? 0.5 : 1;
  const scx = wide ? width * 0.74 : width / 2;
  const stop = wide ? 50 : 560;
  const sy = (y: number) => (y - 560) * sk + stop;

  let logoW: number;
  let logoTop: number;
  let logoLeft: number | undefined;
  if (satoshi) {
    logoW = wide ? 250 : 500;
    logoTop = sy(1450);
    logoLeft = wide ? scx - logoW / 2 : undefined;
  } else if (wide && photo) {
    logoW = width * 0.3;
    logoTop = height * 0.83;
    logoLeft = pad;
  } else {
    logoW = wide ? width * 0.3 : width * 0.6;
    logoTop = wide ? height * 0.66 : photo ? height * 0.8 : height - avatarH * 0.235;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d", overflow: "hidden" }}>
      {photo ? (
        <>
          <Img
            src={staticFile(photo)}
            style={
              wide
                ? {
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: height * 0.82,
                    objectFit: "cover",
                    objectPosition: "50% 25%",
                  }
                : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }
            }
          />
          <AbsoluteFill
            style={{
              background: wide
                ? "linear-gradient(90deg, rgba(5,7,13,1) 0%, rgba(5,7,13,1) 40%, rgba(5,7,13,0.55) 56%, rgba(5,7,13,0.08) 72%, rgba(5,7,13,0.05) 100%)"
                : "linear-gradient(180deg, rgba(5,7,13,0.93) 0%, rgba(5,7,13,0.75) 30%, rgba(5,7,13,0.05) 48%, rgba(5,7,13,0.15) 68%, rgba(5,7,13,0.9) 100%)",
            }}
          />
          <AbsoluteFill style={{ background: `radial-gradient(50% 30% at 50% 82%, ${accent}2a 0%, rgba(0,0,0,0) 70%)` }} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(60% 42% at 50% 60%, ${accent}33 0%, rgba(5,7,13,0) 72%)` }} />
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <g stroke="rgba(255,255,255,0.05)" strokeWidth={2}>
              {Array.from({ length: Math.ceil(height / 100) + 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} x2={width} y1={i * 100} y2={i * 100} />
              ))}
              {Array.from({ length: Math.ceil(width / 100) + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * 100} x2={i * 100} y1={0} y2={height} />
              ))}
            </g>

            {satoshi ? (
              <>
                {/* hash do bloco gênesis ao fundo */}
                <g transform={`rotate(-12 ${width / 2} ${height / 2})`} opacity={0.07}>
                  {Array.from({ length: Math.ceil(height / 70) + 6 }, (_, i) => (
                    <text
                      key={i}
                      x={-400 + (i % 3) * 140}
                      y={-120 + i * 70}
                      fontFamily="'DejaVu Sans Mono', monospace"
                      fontSize={wide ? 22 : 34}
                      fill={accent}
                    >
                      {GENESIS_HASH + GENESIS_HASH}
                    </text>
                  ))}
                </g>
                <SatoshiFigure cx={scx} top={stop} k={sk} accent={accent} />
              </>
            ) : (
              <ellipse cx={wide ? width * 0.78 : width / 2} cy={height - avatarH * 0.42} rx={avatarW * 0.42} ry={avatarH * 0.42} fill={accent} opacity={0.14} />
            )}
          </svg>

          {!satoshi && (
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
          )}
        </>
      )}

      {/* faixas diagonais no canto superior direito (somem quando a silhueta ocupa o canto) */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, display: satoshi && wide ? "none" : undefined }}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={width - 240 + i * 44} y={-90} width={15} height={300} fill={accent} opacity={0.45 - i * 0.09} transform={`rotate(35 ${width - 240 + i * 44} 0)`} />
        ))}
      </svg>

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

      {/* manchete + número */}
      <div style={{ position: "absolute", top: wide ? 128 : 192, left: pad, right: textRight }}>
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
              whiteSpace: "nowrap",
              WebkitTextStroke: "12px #05070d",
              paintOrder: "stroke fill",
              textShadow: "0 12px 44px rgba(0,0,0,0.95)",
            }}
          >
            {line}
          </div>
        ))}
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
            boxShadow: "0 10px 36px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: wide ? 54 : 78, color: accent, letterSpacing: -2 }}>{bigNumber}</span>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: wide ? 26 : 38, color: "white", letterSpacing: 2 }}>{numberLabel}</span>
        </div>
      </div>

      {/* LOGO — destaque principal */}
      <div
        style={{
          position: "absolute",
          left: logoLeft ?? 0,
          right: logoLeft === undefined ? 0 : undefined,
          top: logoTop,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: logoLeft === undefined ? "center" : "flex-start",
        }}
      >
        <NvidiaLogo width={logoW} color={accent} src={logoSrc ? staticFile(logoSrc) : undefined} />
      </div>

      {/* crédito da foto (obrigatório em licenças CC) */}
      {photo && photoCredit && (
        <div style={{ position: "absolute", right: 16, bottom: 18, fontFamily: FONT, fontSize: wide ? 16 : 20, fontWeight: 700, color: "rgba(255,255,255,0.75)", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
          {photoCredit}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: accent }} />
    </AbsoluteFill>
  );
};
