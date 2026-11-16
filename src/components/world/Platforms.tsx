import { sceneConfig } from '@/config/scene';
import { stairPosition } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

export function Platforms() {
  const quality = useJourneyStore((state) => state.quality);
  const segments = quality === 'desktop' ? 64 : 32;
  const radius = sceneConfig.world.platformRadius;
  return (
    <group name="suspended-platforms">
      {sceneConfig.world.platformSteps.map((step, index) => {
        const [x, y, z] = stairPosition(step);
        return (
          <group key={step} position={[x, y, z]}>
            <mesh position={[0, -0.24, 0]}>
              <cylinderGeometry args={[radius, radius * 0.91, 0.76, segments]} />
              <meshPhysicalMaterial color={sceneConfig.colors.stone} roughness={0.47} metalness={0.2} clearcoat={0.2} />
            </mesh>
            <mesh position={[0, -0.68, 0]}>
              <cylinderGeometry args={[radius * 0.91, radius * 0.76, 0.16, segments]} />
              <meshStandardMaterial color={sceneConfig.colors.deep} metalness={0.5} roughness={0.32} />
            </mesh>
            <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.065, radius, segments]} />
              <meshBasicMaterial color={sceneConfig.colors.gold} toneMapped={false} />
            </mesh>
            {index === 0 && (
              <>
                <mesh position={[0, 0.153, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.85, 0.55, 1]}>
                  <circleGeometry args={[1.5, 32]} />
                  <meshBasicMaterial color={sceneConfig.colors.background} transparent opacity={0.2} depthWrite={false} />
                </mesh>
                <mesh position={[0, 3.6, -5]} rotation={[0, -0.12, Math.PI * 0.08]}>
                  <torusGeometry args={[4.5, 0.055, 8, segments, Math.PI * 1.65]} />
                  <meshStandardMaterial color={sceneConfig.colors.gold} emissive={sceneConfig.colors.gold} emissiveIntensity={0.2} metalness={0.7} roughness={0.25} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
