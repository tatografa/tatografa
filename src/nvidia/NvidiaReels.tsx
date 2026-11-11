import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { musicFile, SCENES, sceneFrames, TOTAL_FRAMES } from "./data";
import { Scene } from "./Scene";

export const NvidiaReels: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade da música: entra no começo, abaixa sob a voz, sai no fim.
  const musicVol = interpolate(
    frame,
    [0, 20, 40, durationInFrames - 35, durationInFrames - 5],
    [0, 0.28, 0.16, 0.16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070d" }}>
      {/* Trilha de fundo única, por cima de todas as cenas */}
      <Audio src={musicFile()} volume={musicVol} />

      {SCENES.map((scene) => {
        const dur = sceneFrames(scene);
        const from = cursor;
        cursor += dur;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={dur}>
            <Scene scene={scene} durationInFrames={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const nvidiaDuration = TOTAL_FRAMES;
