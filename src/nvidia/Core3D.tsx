import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NVIDIA_GREEN } from "./data";

/** Núcleo 3D verde girando — animado por useCurrentFrame (determinístico). */
const Nucleo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const rot = t * 0.9;
  const pulse = 1 + Math.sin(t * 3) * 0.04;

  return (
    <group scale={pulse}>
      {/* Núcleo sólido */}
      <mesh rotation={[rot, rot * 0.8, 0]}>
        <icosahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color={NVIDIA_GREEN}
          emissive={NVIDIA_GREEN}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.2}
          flatShading
        />
      </mesh>
      {/* Gaiola em wireframe por fora */}
      <mesh rotation={[-rot * 0.6, rot * 0.5, rot * 0.2]}>
        <icosahedronGeometry args={[2.1, 0]} />
        <meshBasicMaterial color={NVIDIA_GREEN} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

export const Core3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 5]} intensity={1.6} />
      <pointLight position={[-5, -3, 2]} intensity={1.2} color={NVIDIA_GREEN} />
      <Nucleo />
    </ThreeCanvas>
  );
};
