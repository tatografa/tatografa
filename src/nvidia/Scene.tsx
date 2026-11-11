import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  AUDIO_DELAY,
  NVIDIA_GREEN,
  Scene as SceneType,
  sceneAudio,
  sceneBg,
} from "./data";
import { Core3D } from "./Core3D";

const FONT = "'Arial', 'Liberation Sans', 'DejaVu Sans', sans-serif";

const formatNumber = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const Scene: React.FC<{ scene: SceneType; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ---- Fundo: Ken Burns (zoom + leve pan) ----
  const kb = interpolate(frame, [0, durationInFrames], [1.12, 1.26], {
    extrapolateRight: "clamp",
  });
  const panX = interpolate(frame, [0, durationInFrames], [-16, 16]);

  // Fade de entrada/saída da cena inteira
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // ---- Destaque central: entrada com mola ----
  const inSpring = spring({ frame: frame - 6, fps, config: { damping: 14, mass: 0.7 } });
  const highlightScale = interpolate(inSpring, [0, 1], [0.6, 1]);
  const highlightY = interpolate(inSpring, [0, 1], [40, 0]);

  // ---- Contador numérico ----
  const counterProgress = interpolate(frame, [8, 8 + fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterValue = (scene.counterTo ?? 0) * counterProgress;

  // ---- Legenda (parte de baixo) ----
  const capSpring = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const capY = interpolate(capSpring, [0, 1], [50, 0]);
  const capOpacity = interpolate(capSpring, [0, 1], [0, 1]);

  const highlightLines = scene.highlight.split("\n");

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, backgroundColor: "#05070d" }}>
      {/* Fundo */}
      <AbsoluteFill>
        <Img
          src={sceneBg(scene)}
          style={{
            width,
            height,
            objectFit: "cover",
            transform: `scale(${kb}) translateX(${panX}px)`,
          }}
        />
      </AbsoluteFill>

      {/* Escurecimento para legibilidade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0.15) 35%, rgba(5,7,13,0.45) 65%, rgba(5,7,13,0.92) 100%)",
        }}
      />

      {/* Núcleo 3D (hook e encerramento) */}
      {scene.kind === "core3d" && (
        <AbsoluteFill style={{ opacity: 0.9 }}>
          <Core3D />
        </AbsoluteFill>
      )}

      {/* Barra de marca no topo */}
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
          opacity: 0.85,
        }}
      >
        <span style={{ color: NVIDIA_GREEN }}>●</span> A HISTÓRIA DA NVIDIA
      </div>

      {/* Destaque central */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 70px",
          transform: `translateY(${highlightY}px)`,
        }}
      >
        <div style={{ transform: `scale(${highlightScale})`, textAlign: "center" }}>
          {scene.kind === "counter" ? (
            <div
              style={{
                fontFamily: FONT,
                fontSize: 150,
                fontWeight: 900,
                color: NVIDIA_GREEN,
                lineHeight: 1,
                WebkitTextStroke: "2px rgba(0,0,0,0.55)",
                textShadow:
                  "0 6px 28px rgba(0,0,0,0.85), 0 0 55px rgba(118,185,0,0.4)",
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
                  fontSize: line.length > 10 ? 110 : 150,
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1.02,
                  textShadow: "0 10px 50px rgba(0,0,0,0.6)",
                }}
              >
                {line}
              </div>
            ))
          )}

          {scene.sub && (
            <div
              style={{
                marginTop: 26,
                fontFamily: FONT,
                fontSize: 40,
                fontWeight: 700,
                color: "white",
                opacity: 0.92,
                textShadow: "0 4px 20px rgba(0,0,0,0.7)",
              }}
            >
              {scene.sub}
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* Legenda (o que é falado) */}
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
            background: "rgba(5,7,13,0.66)",
            border: `2px solid rgba(118,185,0,0.55)`,
            borderRadius: 22,
            padding: "22px 28px",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 42,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.25,
            backdropFilter: "blur(2px)",
          }}
        >
          {scene.caption}
        </div>
      </div>

      {/* Áudio da narração desta cena (começa alguns quadros após o corte) */}
      <Sequence from={AUDIO_DELAY}>
        <Audio src={sceneAudio(scene)} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};
