import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN } from "./common";

const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";

const CODE = [
  "__global__ void add(float *a, float *b, float *c) {",
  "  int i = blockIdx.x * blockDim.x + threadIdx.x;",
  "  c[i] = a[i] + b[i];",
  "}",
  "",
  "int main() {",
  "  add<<<4096, 256>>>(a, b, c);",
  "  // 1,048,576 threads in parallel",
  "}",
];

const KEYWORDS = /\b(__global__|void|float|int|return)\b/g;

/** Colore palavras-chave e comentários de uma linha (simples). */
const colorize = (line: string) => {
  if (line.trim().startsWith("//")) {
    return [{ text: line, color: "#7fa36b" }];
  }
  const parts: { text: string; color: string }[] = [];
  let last = 0;
  for (const m of line.matchAll(KEYWORDS)) {
    if (m.index! > last) parts.push({ text: line.slice(last, m.index), color: "#e6edf3" });
    parts.push({ text: m[0], color: GREEN });
    last = m.index! + m[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), color: "#e6edf3" });
  return parts;
};

/** Janela de terminal digitando um kernel CUDA + grade de threads acendendo. */
export const CodeVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames, fps } = useVideoConfig();

  const totalChars = CODE.reduce((a, l) => a + l.length + 1, 0);
  const typed = interpolate(frame, [6, durationInFrames * 0.62], [0, totalChars], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // distribui caracteres digitados pelas linhas
  let remaining = typed;
  const shown = CODE.map((line) => {
    const n = Math.max(0, Math.min(line.length, Math.floor(remaining)));
    remaining -= line.length + 1;
    return line.slice(0, n);
  });
  const firstIncomplete = shown.findIndex((s, i) => s.length < CODE[i].length);
  const cursorLine = firstIncomplete === -1 ? CODE.length - 1 : firstIncomplete;
  const blink = Math.floor(frame / (fps / 2)) % 2 === 0;

  const panelX = 50;
  const panelY = 220;
  const panelW = width - 100;
  const lineH = 46;
  const panelH = 90 + CODE.length * lineH;

  // grade de threads acendendo depois que o código "roda"
  const cols = 24;
  const rows = 5;
  const runP = interpolate(frame, [durationInFrames * 0.6, durationInFrames * 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gridY = panelY + panelH + 40;
  const cell = (panelW - (cols - 1) * 6) / cols;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* janela */}
        <rect x={panelX} y={panelY} width={panelW} height={panelH} rx={22} fill="#0b111a" stroke={GREEN} strokeOpacity={0.5} strokeWidth={2} />
        <rect x={panelX} y={panelY} width={panelW} height={58} rx={22} fill="#121a26" />
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
          <circle key={c} cx={panelX + 34 + i * 30} cy={panelY + 29} r={9} fill={c} />
        ))}
        <text x={panelX + panelW / 2} y={panelY + 37} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="#8b98a8">
          kernel.cu
        </text>

        {shown.map((s, i) => {
          const y = panelY + 100 + i * lineH;
          const parts = colorize(s);
          return (
            <text key={i} x={panelX + 30} y={y} fontFamily={MONO} fontSize={25} xmlSpace="preserve">
              {parts.map((p, j) => (
                <tspan key={j} fill={p.color}>
                  {p.text}
                </tspan>
              ))}
              {i === cursorLine && blink && <tspan fill={GREEN}>▍</tspan>}
            </text>
          );
        })}

        {/* threads paralelas */}
        {Array.from({ length: cols * rows }, (_, k) => {
          const c = k % cols;
          const rr = Math.floor(k / cols);
          const lit = (c + rr * 3) / (cols + rows * 3) < runP;
          return (
            <rect
              key={k}
              x={panelX + c * (cell + 6)}
              y={gridY + rr * (cell + 6)}
              width={cell}
              height={cell}
              rx={3}
              fill={GREEN}
              opacity={lit ? 0.9 : 0.1}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
