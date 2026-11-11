import { Composition } from "remotion";
import { Cubo3D } from "./Cubo3D";
import { NvidiaReels } from "./nvidia/NvidiaReels";
import { FPS, HEIGHT, SCENES, TAIL_FRAMES, TOTAL_FRAMES, WIDTH } from "./nvidia/data";
import { SCENES_P2, TAIL_P2, TOTAL_FRAMES_P2 } from "./nvidia/data-part2";

/**
 * Componente raiz: cada <Composition> é um vídeo.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reels vertical: A história da NVIDIA — Parte 1 */}
      <Composition
        id="NvidiaReels"
        component={NvidiaReels}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ scenes: SCENES, brand: "THE STORY OF NVIDIA", tail: TAIL_FRAMES }}
      />

      {/* Reels vertical: A história da NVIDIA — Parte 2 */}
      <Composition
        id="NvidiaReelsPart2"
        component={NvidiaReels}
        durationInFrames={TOTAL_FRAMES_P2}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ scenes: SCENES_P2, brand: "THE STORY OF NVIDIA · PART 2", tail: TAIL_P2 }}
      />

      {/* Exemplo original: cubo 3D girando */}
      <Composition
        id="Cubo3D"
        component={Cubo3D}
        durationInFrames={FPS * 6}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          texto: "Tatografa 3D",
          corDoCubo: "#4f7cff",
        }}
      />
    </>
  );
};
