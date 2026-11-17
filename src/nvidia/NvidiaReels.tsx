import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { musicFile, Scene as SceneType, sceneFrames, TAIL_FRAMES } from "./data";
import { Scene } from "./Scene";
import { AccentProvider, NVIDIA_GREEN } from "./theme";

export type NvidiaReelsProps = {
  scenes: SceneType[];
  /** texto da barra de marca no topo */
  brand: string;
  /** quadros de respiro após cada fala */
  tail?: number;
  /** cor de destaque da série (verde NVIDIA, laranja Bitcoin, …) */
  accent?: string;
};

export const NvidiaReels: React.FC<NvidiaReelsProps> = ({
  scenes,
  brand,
  tail = TAIL_FRAMES,
  accent = NVIDIA_GREEN,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Música: entra, abaixa sob a voz, sai no fim. Em loop se o vídeo for maior que a faixa.
  const musicVol = interpolate(
    frame,
    [0, 20, 40, durationInFrames - 35, durationInFrames - 5],
    [0, 0.28, 0.16, 0.16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  let cursor = 0;

  return (
    <AccentProvider accent={accent}>
    <AbsoluteFill style={{ backgroundColor: "#05070d" }}>
      <Audio src={musicFile()} volume={musicVol} loop />

      {scenes.map((scene, i) => {
        const dur = sceneFrames(scene, i === scenes.length - 1, tail);
        const from = cursor;
        cursor += dur;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={dur}>
            <Scene scene={scene} durationInFrames={dur} brand={brand} index={i} count={scenes.length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
    </AccentProvider>
  );
};
