import { Composition } from "remotion";
import { Cubo3D } from "./Cubo3D";

// Formato do vídeo
const FPS = 30;
const DURACAO_SEGUNDOS = 6;
const LARGURA = 1920;
const ALTURA = 1080;

/**
 * Componente raiz: aqui você registra cada "Composition" (um vídeo).
 * Cada Composition vira um item na barra lateral do Remotion Studio e
 * pode ser renderizada pelo nome (o `id`) via linha de comando.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Cubo3D"
        component={Cubo3D}
        durationInFrames={FPS * DURACAO_SEGUNDOS}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
        defaultProps={{
          texto: "Tatografa 3D",
          corDoCubo: "#4f7cff",
        }}
      />
    </>
  );
};
