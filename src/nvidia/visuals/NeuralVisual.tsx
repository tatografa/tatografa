import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, rng } from "./common";

/** Rede neural com nós pulsantes e sinais viajando pelas conexões. */
export const NeuralVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;

  const layers = [3, 5, 5, 4, 2];
  const x0 = width * 0.12;
  const x1 = width * 0.88;
  const yTop = height * 0.3;
  const yBot = height * 0.78;

  const nodes: { x: number; y: number; l: number; i: number }[] = [];
  layers.forEach((count, l) => {
    const x = x0 + ((x1 - x0) * l) / (layers.length - 1);
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? (yTop + yBot) / 2 : yTop + ((yBot - yTop) * i) / (count - 1);
      nodes.push({ x, y, l, i });
    }
  });

  const edges: { a: (typeof nodes)[0]; b: (typeof nodes)[0]; seed: number }[] = [];
  let seed = 1;
  for (let l = 0; l < layers.length - 1; l++) {
    const A = nodes.filter((n) => n.l === l);
    const B = nodes.filter((n) => n.l === l + 1);
    A.forEach((a) => B.forEach((b) => edges.push({ a, b, seed: seed++ })));
  }

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* conexões */}
        {edges.map((e, k) => (
          <line
            key={k}
            x1={e.a.x}
            y1={e.a.y}
            x2={e.b.x}
            y2={e.b.y}
            stroke={GREEN}
            strokeOpacity={0.16}
            strokeWidth={1.5}
          />
        ))}
        {/* sinais viajando */}
        {edges.map((e, k) => {
          const r = rng(e.seed * 97);
          const phase = r();
          const speed = 0.5 + r() * 0.5;
          const p = (t * speed + phase) % 1;
          const x = e.a.x + (e.b.x - e.a.x) * p;
          const y = e.a.y + (e.b.y - e.a.y) * p;
          if (k % 2 !== 0) return null; // metade das arestas tem pulso (desempenho/visual)
          return <circle key={`p${k}`} cx={x} cy={y} r={4} fill="#eaffd0" opacity={0.9} />;
        })}
        {/* nós */}
        {nodes.map((n, k) => {
          const pulse = 0.6 + Math.sin(t * 3 + n.l + n.i) * 0.4;
          return (
            <g key={k}>
              <circle cx={n.x} cy={n.y} r={22} fill={GREEN} opacity={0.12 * pulse} />
              <circle cx={n.x} cy={n.y} r={11} fill={GREEN} opacity={0.85}
                style={{ filter: `drop-shadow(0 0 ${8 * pulse}px ${GREEN})` }} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
