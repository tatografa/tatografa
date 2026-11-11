import { Composition } from "remotion";
import { Cubo3D } from "./Cubo3D";
import { NvidiaReels } from "./nvidia/NvidiaReels";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./nvidia/data";

/**
 * Componente raiz: cada <Composition> é um vídeo.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reels vertical: História da NVIDIA (60s) */}
      <Composition
        id="NvidiaReels"
        component={NvidiaReels}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
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
