import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN } from "./common";

const Fan: React.FC<{ x: number; spin: number }> = ({ x, spin }) => (
  <group position={[x, 0.12, 0.14]}>
    {/* aro do cooler */}
    <mesh>
      <torusGeometry args={[0.74, 0.07, 12, 40]} />
      <meshStandardMaterial color="#2a3340" metalness={0.6} roughness={0.4} />
    </mesh>
    {/* fundo escuro */}
    <mesh position={[0, 0, -0.05]}>
      <circleGeometry args={[0.72, 40]} />
      <meshStandardMaterial color="#0a0e15" />
    </mesh>
    {/* pás girando */}
    <group rotation={[0, 0, spin]}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 9) * Math.PI * 2]} position={[0, 0, 0.01]}>
          <boxGeometry args={[0.66, 0.14, 0.02]} />
          <meshStandardMaterial color="#3a4452" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
    {/* cubo central verde */}
    <mesh position={[0, 0, 0.04]}>
      <cylinderGeometry args={[0.17, 0.17, 0.08, 24]} />
      <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.9} />
    </mesh>
  </group>
);

const Placa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const spin = t * 9;
  const yaw = Math.sin(t * 0.3) * 0.18;

  return (
    <group rotation={[0.14, yaw, 0]} position={[0, 0.7, 0]} scale={0.66}>
      {/* PCB (traseira saindo embaixo) */}
      <mesh position={[0, -1.02, -0.05]}>
        <boxGeometry args={[4.5, 0.5, 0.14]} />
        <meshStandardMaterial color="#0c3b12" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* conector dourado */}
      <mesh position={[-0.2, -1.3, -0.05]}>
        <boxGeometry args={[1.8, 0.14, 0.16]} />
        <meshStandardMaterial color="#caa23a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* shroud frontal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.4, 1.9, 0.3]} />
        <meshStandardMaterial color="#1a212c" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* chanfro superior */}
      <mesh position={[0, 0.98, 0.12]}>
        <boxGeometry args={[4.4, 0.12, 0.08]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={1.0} />
      </mesh>
      {/* linha luminosa central */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[4.4, 0.04, 0.02]} />
        <meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.8} />
      </mesh>
      {/* coolers */}
      <Fan x={-1.05} spin={spin} />
      <Fan x={1.05} spin={-spin * 1.05} />
    </group>
  );
};

export const GpuVisual: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[2, 4, 8]} intensity={2.0} />
      <directionalLight position={[-4, 2, 4]} intensity={0.8} color={GREEN} />
      <pointLight position={[0, 0, 4]} intensity={1.4} color="#ffffff" />
      <Placa />
    </ThreeCanvas>
  );
};
