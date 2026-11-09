import { sceneConfig } from '@/config/scene';
import { terrainHeight } from '@/lib/terrain';
import { FadeGroup } from './FadeGroup';

const rubble = [
  [-25, -36, 0.6, 0.25, 0.8],
  [-20, -32, 0.45, 0.2, 0.5],
  [-14, -39, 0.8, 0.3, 0.55],
  [-30, -28, 0.5, 0.2, 0.9],
] as const;

export function RuinedLeft() {
  const ground = (x: number, z: number) => terrainHeight(x, z, 0);
  const stone = sceneConfig.colors.deep;
  const ash = '#172522';
  return (
    <FadeGroup start={0.18} end={0.7} reverse>
      <group position={[-22, ground(-22, -35), -35]} rotation={[0, -0.12, 0]}>
        <mesh position={[-3.4, 3.2, 0]} rotation={[0.02, 0.1, -0.08]}>
          <boxGeometry args={[0.55, 6.4, 0.8]} />
          <meshStandardMaterial color={stone} roughness={1} transparent />
        </mesh>
        <mesh position={[2.8, 2.8, 0.2]} rotation={[-0.03, -0.08, 0.06]}>
          <boxGeometry args={[0.6, 5.6, 0.85]} />
          <meshStandardMaterial color={ash} roughness={1} transparent />
        </mesh>
        <mesh position={[-0.25, 2.15, 0]} rotation={[0, 0.02, 0]}>
          <boxGeometry args={[6.8, 0.55, 0.7]} />
          <meshStandardMaterial color={stone} roughness={1} transparent />
        </mesh>
        <mesh position={[0, 1.35, 0.2]}>
          <boxGeometry args={[3.2, 2.7, 0.55]} />
          <meshStandardMaterial color={ash} roughness={1} transparent />
        </mesh>
      </group>
      <group position={[-34, ground(-34, -22), -22]} rotation={[0, 0.25, 0.08]}>
        <mesh position={[0, 3.3, 0]}>
          <cylinderGeometry args={[1.8, 2.25, 6.6, 7]} />
          <meshStandardMaterial color={stone} roughness={1} transparent />
        </mesh>
        <mesh position={[0, 6.85, 0]} rotation={[0.08, 0.2, -0.04]}>
          <coneGeometry args={[2.3, 0.7, 7]} />
          <meshStandardMaterial color={ash} roughness={1} transparent />
        </mesh>
      </group>
      {rubble.map(([x, z, sx, sy, sz], index) => (
        <mesh key={index} position={[x, ground(x, z) + sy, z]} rotation={[0.2 * index, 0.4 * index, -0.18]}>
          <boxGeometry args={[sx * 3, sy * 2, sz * 2]} />
          <meshStandardMaterial color={index % 2 ? ash : stone} roughness={1} transparent />
        </mesh>
      ))}
    </FadeGroup>
  );
}
