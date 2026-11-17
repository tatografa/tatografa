import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";

export const FONT = "'Arial', 'Liberation Sans', 'DejaVu Sans', sans-serif";

/**
 * Símbolo ₿ desenhado à mão — o caractere Unicode não existe nas fontes
 * disponíveis no container, então é montado com um "B" e duas hastes.
 */
export const BtcSymbol: React.FC<{ size?: number; color?: string; weight?: number }> = ({
  size = 100,
  color = "#fff",
  weight = 10,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x={30} y={4} width={weight} height={92} fill={color} />
    <rect x={52} y={4} width={weight} height={92} fill={color} />
    <path
      d="M22 18h34a17 17 0 0 1 0 34H22V18Zm0 34h38a17 17 0 0 1 0 34H22V52Z"
      stroke={color}
      strokeWidth={weight}
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Moeda girando em 3D feita com CSS (sem WebGL): a face é um círculo
 * achatado em X por cos(ângulo) e a espessura aparece como uma faixa
 * proporcional a |sin(ângulo)|.
 */
export const BtcCoin3D: React.FC<{ size?: number; centerY?: number }> = ({
  size = 560,
  centerY = 790,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();
  const t = frame / fps;

  const a = t * 1.45;
  const c = Math.cos(a);
  const squash = Math.abs(c);
  const edgeW = size * 0.085 * Math.abs(Math.sin(a));
  const bob = Math.sin(t * 1.7) * 14;
  const tilt = Math.sin(t * 0.8) * 4;

  const dark = "#8a4d05";

  return (
    <AbsoluteFill>
      {/* brilho atrás */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - size * 0.75,
          top: centerY + bob - size * 0.75,
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}3a 0%, rgba(0,0,0,0) 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerY + bob,
          display: "flex",
          justifyContent: "center",
          transform: `rotate(${tilt}deg)`,
        }}
      >
        <div style={{ position: "relative", height: size, width: size, marginTop: -size / 2 }}>
          {/* espessura da moeda */}
          <div
            style={{
              position: "absolute",
              left: size / 2 - edgeW / 2,
              top: size * 0.015,
              width: edgeW,
              height: size * 0.97,
              borderRadius: edgeW / 2,
              background: `linear-gradient(90deg, ${dark} 0%, ${accent} 45%, ${dark} 100%)`,
            }}
          />

          {/* face (achatada conforme gira) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scaleX(${squash})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: `radial-gradient(circle at 34% 28%, #ffc266 0%, ${accent} 46%, #c96f08 100%)`,
              border: `${size * 0.03}px solid #ffd089`,
              boxShadow: `0 0 ${size * 0.14}px ${accent}aa, inset 0 0 ${size * 0.1}px rgba(0,0,0,0.35)`,
            }}
          >
            {/* anel interno */}
            <div
              style={{
                position: "absolute",
                inset: size * 0.07,
                borderRadius: "50%",
                border: `${size * 0.012}px solid rgba(255,245,220,0.45)`,
              }}
            />
            <div style={{ transform: `scaleX(${c < 0 ? -1 : 1})`, display: "flex" }}>
              <BtcSymbol size={size * 0.52} color="#fff6e4" weight={11} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
