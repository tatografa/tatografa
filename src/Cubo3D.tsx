import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  // Audio, staticFile  // <- descomente para usar áudio (veja abaixo)
} from "remotion";

type Props = {
  texto: string;
  corDoCubo: string;
};

/**
 * Um cubo 3D que gira. A animação é dirigida por `useCurrentFrame()`,
 * NÃO por `useFrame`/tempo real: o Remotion renderiza quadro a quadro,
 * então toda animação precisa ser uma função do número do quadro para
 * ser determinística (e idêntica no preview e no render final).
 */
const Cubo: React.FC<{ cor: string }> = ({ cor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Uma rotação completa a cada 3 segundos
  const rotacao = (frame / (fps * 3)) * Math.PI * 2;

  // Um "flutuar" suave no eixo Y
  const y = Math.sin((frame / fps) * 2) * 0.3;

  return (
    <mesh rotation={[rotacao, rotacao * 0.7, 0]} position={[0, y, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={cor} metalness={0.3} roughness={0.25} />
    </mesh>
  );
};

export const Cubo3D: React.FC<Props> = ({ texto, corDoCubo }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Fade-in do texto nos primeiros 20 quadros
  const opacidadeTexto = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      {/* ÁUDIO (opcional):
          1) coloque um arquivo em public/musica.mp3
          2) descomente o import de Audio/staticFile acima
          3) descomente a linha abaixo
      <Audio src={staticFile("musica.mp3")} />
      */}

      {/* Cena 3D (Three.js) */}
      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [0, 0, 6], fov: 50 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -2, 3]} intensity={0.8} color="#ff5eaa" />
        <Cubo cor={corDoCubo} />
      </ThreeCanvas>

      {/* Texto por cima da cena (HTML normal do Remotion) */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 80,
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            opacity: opacidadeTexto,
            color: "white",
            fontFamily: "sans-serif",
            fontSize: 90,
            fontWeight: 800,
            letterSpacing: -2,
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
            margin: 0,
          }}
        >
          {texto}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
