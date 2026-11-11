import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, GREEN, rng } from "./common";

/**
 * Fundo animado comum a todas as cenas: gradiente verde pulsante,
 * grade em perspectiva e um campo de partículas subindo. Tudo
 * determinístico (função do quadro), leve, sem WebGL.
 */
export const Background: React.FC<{ seed?: number; grid?: boolean }> = ({
  seed = 7,
  grid = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const r = rng(seed);
  const particles = Array.from({ length: 60 }, () => ({
    x: r() * width,
    y0: r() * height,
    size: 2 + r() * 5,
    speed: 20 + r() * 60,
    drift: (r() - 0.5) * 40,
    op: 0.2 + r() * 0.6,
  }));

  const glow = 0.5 + Math.sin(t * 1.2) * 0.12;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      {/* brilho radial pulsante */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 45% at 50% 42%, rgba(118,185,0,${0.22 * glow}) 0%, rgba(118,185,0,0.06) 40%, rgba(5,7,13,0) 70%)`,
        }}
      />

      {/* grade em perspectiva na base */}
      {grid && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0 }}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="gridfade" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={GREEN} stopOpacity="0.35" />
              <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }, (_, i) => {
            const yy = height - i * 70 - ((t * 60) % 70);
            return (
              <line
                key={`h${i}`}
                x1={0}
                x2={width}
                y1={yy}
                y2={yy}
                stroke="url(#gridfade)"
                strokeWidth={1.2}
              />
            );
          })}
          {Array.from({ length: 15 }, (_, i) => {
            const cx = width / 2;
            const x = (i - 7) * 160;
            return (
              <line
                key={`v${i}`}
                x1={cx + x}
                y1={height}
                x2={cx + x * 0.25}
                y2={height * 0.62}
                stroke="url(#gridfade)"
                strokeWidth={1}
              />
            );
          })}
        </svg>
      )}

      {/* partículas */}
      {particles.map((p, i) => {
        const y = ((p.y0 - t * p.speed) % height + height) % height;
        const x = p.x + Math.sin(t + i) * p.drift;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: GREEN,
              opacity: p.op * 0.7,
              boxShadow: `0 0 ${p.size * 2}px ${GREEN}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
