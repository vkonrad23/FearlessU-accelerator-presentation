import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, Mesh } from 'three';
import { sceneConfig } from '@/config/scene';
import { smoothstep } from '@/lib/scene-math';
import { terrainHeight } from '@/lib/terrain';
import { useJourneyStore } from '@/store/journey';

const grove = [
  [34, -56, 1.3, 5.8],
  [42, -67, 1.1, 4.8],
  [29, -79, 1.5, 6.8],
  [48, -90, 1.2, 5.4],
] as const;

function FadeGroup({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const opacity = smoothstep((useJourneyStore.getState().progress - 0.12) / 0.48);
    group.current?.traverse((object) => {
      const material = (object as Mesh).material;
      if (material && 'opacity' in material) material.opacity = opacity;
    });
  });
  return <group ref={group}>{children}</group>;
}

export function HopefulRight() {
  const ground = (x: number, z: number) => terrainHeight(x, z, 0);
  return (
    <FadeGroup>
      <group position={[0, 0, 0]}>
        {grove.map(([x, z, radius, height], index) => (
          <group key={index} position={[x, ground(x, z), z]}>
            <mesh position={[0, height * 0.42, 0]}>
              <cylinderGeometry args={[radius * 0.16, radius * 0.24, height, 8]} />
              <meshStandardMaterial color="#765c3a" roughness={0.92} transparent />
            </mesh>
            <mesh position={[0, height * 0.9, 0]}>
              <icosahedronGeometry args={[radius, 1]} />
              <meshStandardMaterial color={index % 2 ? '#579d73' : '#79b987'} roughness={0.86} transparent />
            </mesh>
            <mesh position={[radius * 0.6, height * 0.98, radius * 0.1]}>
              <icosahedronGeometry args={[radius * 0.48, 1]} />
              <meshStandardMaterial color="#a6d99b" roughness={0.82} transparent />
            </mesh>
          </group>
        ))}
        <mesh position={[36, terrainHeight(36, -74, 0) + 0.12, -74]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[11, 48]} />
          <meshStandardMaterial color="#b4d7a2" emissive="#6fbd86" emissiveIntensity={0.16} roughness={1} transparent opacity={0.34} />
        </mesh>
      </group>
      <group position={[36, 14, -105]} rotation={[0, -0.15, 0]}>
        <mesh>
          <coneGeometry args={[13, 30, 32, 1, true]} />
          <meshBasicMaterial color={sceneConfig.colors.sun} transparent opacity={0.055} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[8, 26, 24, 1, true]} />
          <meshBasicMaterial color="#ffe7a7" transparent opacity={0.04} depthWrite={false} />
        </mesh>
      </group>
    </FadeGroup>
  );
}
