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
import { FONT } from "./visuals/common";

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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
      return <AiFlowVisual />;
    case "chart":
      return <ChartVisual />;
    case "datacenter":
      return <DataCenterVisual />;
    case "world":
      return <WorldVisual />;
    default:
      return null;
  }
};

export const Scene: React.FC<{ scene: SceneType; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
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
            "linear-gradient(180deg, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0.0) 28%, rgba(5,7,13,0.0) 55%, rgba(5,7,13,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* barra de marca no topo */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          color: "white",
          letterSpacing: 8,
          fontSize: 30,
          fontWeight: 800,
          opacity: 0.9,
        }}
      >
        <span style={{ color: NVIDIA_GREEN }}>●</span> THE STORY OF NVIDIA
      </div>

      {/* destaque + subtítulo (banda central-baixa, com backing escuro) */}
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
            background:
              "radial-gradient(60% 120% at 50% 50%, rgba(5,7,13,0.78) 0%, rgba(5,7,13,0) 75%)",
            zIndex: -1,
          }}
        />
        <div style={{ transform: `scale(${highlightScale})`, display: "inline-block" }}>
          {scene.counterTo != null ? (
            <div
              style={{
                fontFamily: FONT,
                fontSize: 160,
                fontWeight: 900,
                color: NVIDIA_GREEN,
                lineHeight: 1,
                WebkitTextStroke: "2px rgba(0,0,0,0.5)",
                textShadow: "0 6px 28px rgba(0,0,0,0.9), 0 0 55px rgba(118,185,0,0.4)",
              }}
            >
              {scene.counterPrefix}
              {formatNumber(counterValue)}
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
                  color: "white",
                  lineHeight: 1.02,
                  textShadow: "0 8px 40px rgba(0,0,0,0.85)",
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
            background: "rgba(5,7,13,0.68)",
            border: `2px solid rgba(118,185,0,0.55)`,
            borderRadius: 22,
            padding: "22px 28px",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 42,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.25,
          }}
        >
          {scene.caption}
        </div>
      </div>

      {/* narração da cena */}
      <Sequence from={AUDIO_DELAY}>
        <Audio src={sceneAudio(scene)} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
