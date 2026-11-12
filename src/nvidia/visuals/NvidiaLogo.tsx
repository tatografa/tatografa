import { GREEN } from "./common";

/**
 * Marca da NVIDIA para as thumbnails.
 *
 * ATENÇÃO: este é um desenho PRÓPRIO, inspirado na identidade da NVIDIA
 * (olho + wordmark em verde). NÃO é o arquivo oficial da marca.
 * Para publicar, baixe o logo oficial em nvidia.com/pt-br/about-nvidia/brand/
 * salve em `public/assets/nvidia-logo.png` e troque <NvidiaEye/> pela imagem.
 */
export const NvidiaEye: React.FC<{ size?: number; color?: string }> = ({
  size = 200,
  color = GREEN,
}) => (
  <svg width={size} height={size * 0.56} viewBox="0 0 124 70" fill="none">
    {/* curva única e larga que forma o "olho" */}
    <path
      d="M34,61 C10,53 8,22 38,13 C74,2 118,17 118,36 C118,53 96,65 76,56 C61,49 60,32 76,29"
      stroke={color}
      strokeWidth={13}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Olho + wordmark, empilhados.
 *
 * Para usar o logo OFICIAL: salve o arquivo em `public/assets/nvidia-logo.png`
 * e passe `src={staticFile("assets/nvidia-logo.png")}` — o desenho próprio
 * é substituído pela imagem.
 */
export const NvidiaLogo: React.FC<{ width?: number; color?: string; src?: string }> = ({
  width = 760,
  color = GREEN,
  src,
}) =>
  src ? (
    <img
      src={src}
      alt="NVIDIA"
      style={{
        width,
        filter: `drop-shadow(0 0 ${width * 0.09}px ${color}cc) drop-shadow(0 ${width * 0.02}px ${width * 0.04}px rgba(0,0,0,0.95))`,
      }}
    />
  ) : (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: width * 0.02,
      filter: `drop-shadow(0 0 ${width * 0.09}px ${color}cc) drop-shadow(0 ${width * 0.02}px ${width * 0.04}px rgba(0,0,0,0.95))`,
    }}
  >
    <NvidiaEye size={width * 0.46} color={color} />
    <div
      style={{
        fontFamily: "'Arial', 'Liberation Sans', sans-serif",
        fontWeight: 900,
        fontSize: width * 0.2,
        letterSpacing: width * 0.012,
        color,
        lineHeight: 1,
      }}
    >
      NVIDIA
    </div>
  </div>
  );
