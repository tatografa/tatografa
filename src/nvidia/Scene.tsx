import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AUDIO_DELAY, NVIDIA_GREEN, Scene as SceneType, sceneAudio } from "./data";
import { Core3D } from "./Core3D";
import { Background } from "./visuals/Background";
import { GpuVisual } from "./visuals/GpuVisual";
import { MapVisual } from "./visuals/MapVisual";
import { NeuralVisual } from "./visuals/NeuralVisual";
import { AiFlowVisual } from "./visuals/AiFlowVisual";
import { ChartVisual } from "./visuals/ChartVisual";
import { DataCenterVisual } from "./visuals/DataCenterVisual";
import { WorldVisual } from "./visuals/WorldVisual";
import { CountdownVisual } from "./visuals/CountdownVisual";
import { RainVisual } from "./visuals/RainVisual";
import { CodeVisual } from "./visuals/CodeVisual";
import { ChatVisual } from "./visuals/ChatVisual";
import { SpotlightVisual } from "./visuals/SpotlightVisual";
import { DonutVisual } from "./visuals/DonutVisual";
import { WaffleVisual } from "./visuals/WaffleVisual";
import { SupplyVisual } from "./visuals/SupplyVisual";
import { StockVisual } from "./visuals/StockVisual";
import { RivalsVisual } from "./visuals/RivalsVisual";
import { CrashVisual } from "./visuals/CrashVisual";
import { RisksVisual } from "./visuals/RisksVisual";
import { FutureVisual } from "./visuals/FutureVisual";
import { FONT } from "./visuals/common";

const formatNumber = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const Visual: React.FC<{ scene: SceneType }> = ({ scene }) => {
  switch (scene.visual) {
    case "core":
    case "cta":
      return <Core3D />;
    case "gpu":
      return <GpuVisual />;
    case "map":
      return <MapVisual />;
    case "neural":
      return <NeuralVisual />;
    case "aiflow":
      return <AiFlowVisual label={scene.label} />;
    case "chart":
      return <ChartVisual />;
    case "datacenter":
      return <DataCenterVisual />;
    case "world":
      return <WorldVisual />;
    case "countdown":
      return <CountdownVisual />;
    case "rain":
      return <RainVisual />;
    case "code":
      return <CodeVisual />;
    case "chat":
      return <ChatVisual />;
    case "spotlight":
      return <SpotlightVisual />;
    case "donut":
      return <DonutVisual />;
    case "waffle":
      return <WaffleVisual />;
    case "supply":
      return <SupplyVisual />;
    case "stock":
      return <StockVisual />;
    case "rivals":
      return <RivalsVisual />;
    case "crash":
      return <CrashVisual />;
    case "risks":
      return <RisksVisual />;
    case "future":
      return <FutureVisual />;
    default:
      return null;
  }
};

/** Legenda com trechos *entre asteriscos* destacados em verde. */
const Caption: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <span key={i} style={{ color: NVIDIA_GREEN }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

/** Barra de progresso segmentada (estilo stories). */
const StoryProgress: React.FC<{ index: number; count: number; progress: number }> = ({ index, count, progress }) => (
  <div style={{ position: "absolute", top: 40, left: 40, right: 40, display: "flex", gap: 8 }}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
        <div
          style={{
            width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
            height: "100%",
            background: NVIDIA_GREEN,
            borderRadius: 4,
          }}
        />
      </div>
    ))}
  </div>
);

export const Scene: React.FC<{
  scene: SceneType;
  durationInFrames: number;
  brand: string;
  index: number;
  count: number;
}> = ({ scene, durationInFrames, brand, index, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const inSpring = spring({ frame: frame - 8, fps, config: { damping: 14, mass: 0.7 } });
  const highlightScale = interpolate(inSpring, [0, 1], [0.6, 1]);
  const highlightY = interpolate(inSpring, [0, 1], [40, 0]);

  const counterProgress = interpolate(frame, [10, 10 + fps * 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterValue = (scene.counterTo ?? 0) * counterProgress;

  const capSpring = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const capY = interpolate(capSpring, [0, 1], [50, 0]);
  const capOpacity = interpolate(capSpring, [0, 1], [0, 1]);

  const highlightLines = scene.highlight.split("\n");
  const hasBand = scene.counterTo != null || scene.highlight.trim().length > 0;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* fundo animado */}
      <Background seed={scene.id * 13 + 3} grid={scene.visual !== "chart"} />

      {/* visual principal da cena */}
      <Visual scene={scene} />

      {/* vinheta para legibilidade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,13,0.6) 0%, rgba(5,7,13,0.0) 26%, rgba(5,7,13,0.0) 60%, rgba(5,7,13,0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      <StoryProgress index={index} count={count} progress={frame / durationInFrames} />

      {/* barra de marca + contador de cena */}
      <div
        style={{
          position: "absolute",
          top: 78,
          left: 40,
          right: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: FONT,
          color: "white",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 5,
          opacity: 0.9,
        }}
      >
        <span>
          <span style={{ color: NVIDIA_GREEN }}>●</span> {brand}
        </span>
        <span style={{ color: "rgba(255,255,255,0.55)", letterSpacing: 2 }}>
          {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
        </span>
      </div>

      {/* destaque + subtítulo (banda central-baixa, com backing escuro) */}
      {hasBand && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "60%",
            transform: `translateY(calc(-50% + ${highlightY}px))`,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-40px -0px",
              background: "radial-gradient(60% 120% at 50% 50%, rgba(5,7,13,0.78) 0%, rgba(5,7,13,0) 75%)",
              zIndex: -1,
            }}
          />
          <div style={{ transform: `scale(${highlightScale})`, display: "inline-block" }}>
            {scene.counterTo != null ? (
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: (scene.counterTo ?? 0) >= 100000 ? 132 : 160,
                  fontWeight: 900,
                  color: NVIDIA_GREEN,
                  lineHeight: 1,
                  WebkitTextStroke: "2px rgba(0,0,0,0.5)",
                  textShadow: "0 6px 28px rgba(0,0,0,0.9), 0 0 55px rgba(118,185,0,0.4)",
                }}
              >
                {scene.counterPrefix}
                {formatNumber(counterValue, scene.counterDecimals ?? 1)}
                {scene.counterSuffix}
              </div>
            ) : (
              highlightLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontSize: line.length > 10 ? 104 : 150,
                    fontWeight: 900,
                    lineHeight: 1.02,
                    background: "linear-gradient(180deg, #ffffff 0%, #dfe6ee 55%, #b9c4d0 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.85))",
                  }}
                >
                  {line}
                </div>
              ))
            )}

            {scene.sub && (
              <div
                style={{
                  marginTop: 22,
                  fontFamily: FONT,
                  fontSize: 40,
                  fontWeight: 700,
                  color: "white",
                  opacity: 0.95,
                  textShadow: "0 4px 20px rgba(0,0,0,0.9)",
                }}
              >
                {scene.sub}
              </div>
            )}
          </div>
        </div>
      )}

      {/* legenda (narração) */}
      <div
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          bottom: 150,
          transform: `translateY(${capY}px)`,
          opacity: capOpacity,
        }}
      >
        <div
          style={{
            background: "rgba(5,7,13,0.72)",
            border: `2px solid rgba(118,185,0,0.55)`,
            borderRadius: 24,
            padding: "22px 28px",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 40,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.25,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <Caption text={scene.caption} />
        </div>
      </div>

      {/* narração da cena */}
      <Sequence from={AUDIO_DELAY}>
        <Audio src={sceneAudio(scene)} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
