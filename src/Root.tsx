import { Composition } from "remotion";
import { Cubo3D } from "./Cubo3D";
import { NvidiaReels } from "./nvidia/NvidiaReels";
import { FPS, HEIGHT, SCENES, TAIL_FRAMES, TOTAL_FRAMES, WIDTH } from "./nvidia/data";
import { SCENES_P2, TAIL_P2, TOTAL_FRAMES_P2 } from "./nvidia/data-part2";
import { SCENES_P3, TAIL_P3, TOTAL_FRAMES_P3 } from "./nvidia/data-part3";
import { Thumbnail, ThumbProps } from "./nvidia/Thumbnail";

const GREEN = "#76B900";
const RED = "#ff3b3b";

/** Thumbnails da série: uma por episódio. */
const THUMBS: (ThumbProps & { id: string })[] = [
  {
    id: "ThumbPart1",
    part: 1,
    headline: ["HOW", "NVIDIA", "WAS BORN"],
    bigNumber: "$4T",
    numberLabel: "FROM A DINER",
    accent: GREEN,
    motif: "chips",
  },
  {
    id: "ThumbPart2",
    part: 2,
    headline: ["THE DAY", "IT ALMOST", "DIED"],
    bigNumber: "30",
    numberLabel: "DAYS LEFT",
    accent: RED,
    motif: "chips",
  },
  {
    id: "ThumbPart3",
    part: 3,
    headline: ["HOW NVIDIA", "MAKES", "MONEY"],
    bigNumber: "$130B",
    numberLabel: "A YEAR",
    accent: GREEN,
    motif: "chart",
  },
];

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

      {/* Reels vertical: A história da NVIDIA — Parte 3 (charts e ícones) */}
      <Composition
        id="NvidiaReelsPart3"
        component={NvidiaReels}
        durationInFrames={TOTAL_FRAMES_P3}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ scenes: SCENES_P3, brand: "THE STORY OF NVIDIA · PART 3", tail: TAIL_P3 }}
      />

      {/* Thumbnails — vertical 1080x1920 (capa de Shorts/Reels) */}
      {THUMBS.map(({ id, ...props }) => (
        <Composition
          key={id}
          id={id}
          component={Thumbnail}
          durationInFrames={1}
          fps={1}
          width={1080}
          height={1920}
          defaultProps={props}
        />
      ))}

      {/* Thumbnails — 16:9 1280x720 (YouTube tradicional / compartilhamento) */}
      {THUMBS.map(({ id, ...props }) => (
        <Composition
          key={`${id}Wide`}
          id={`${id}Wide`}
          component={Thumbnail}
          durationInFrames={1}
          fps={1}
          width={1280}
          height={720}
          defaultProps={props}
        />
      ))}

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
