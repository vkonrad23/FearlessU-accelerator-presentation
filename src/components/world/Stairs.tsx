import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Color, InstancedMesh, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import { sceneConfig } from '@/config/scene';
import { ambientDelta, clamp, stairPosition } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

export function Stairs() {
  const steps = useRef<InstancedMesh>(null);
  const edges = useRef<InstancedMesh>(null);
  const lastStep = useRef(-2);
  const time = useRef(0);
  const [base, bright, color] = useMemo(() => [
    new Color(sceneConfig.colors.gold).multiplyScalar(sceneConfig.lighting.stepEmissive),
    new Color(sceneConfig.colors.sun).multiplyScalar(sceneConfig.lighting.pulseEmissive),
    new Color(),
  ], []);
  const { stairCount, stairWidth, stairRun } = sceneConfig.world;
  const tread = useMemo(() => new RoundedBoxGeometry(stairWidth, 0.3, stairRun * 0.95, 1, 0.065), [stairWidth, stairRun]);
  useEffect(() => () => tread.dispose(), [tread]);

  useLayoutEffect(() => {
    const transform = new Object3D();
    for (let i = 0; i < stairCount; i += 1) {
      const [x, y, z] = stairPosition(i);
      transform.position.set(x, y, z);
      transform.rotation.y = -0.13 * Math.cos(i / stairCount * Math.PI);
      transform.updateMatrix();
      steps.current?.setMatrixAt(i, transform.matrix);
      transform.position.y += 0.145;
      transform.position.z += stairRun * 0.45;
      transform.updateMatrix();
      edges.current?.setMatrixAt(i, transform.matrix);
    }
    if (steps.current) steps.current.instanceMatrix.needsUpdate = true;
    if (edges.current) edges.current.instanceMatrix.needsUpdate = true;
  }, [stairCount, stairRun]);

  useFrame((_, delta) => {
    const { activeStep, chapter, progress, motionPaused, visible } = useJourneyStore.getState();
    const elapsed = ambientDelta(delta, progress, motionPaused, visible);
    const step = chapter === 2 ? activeStep : -1;
    if (!edges.current || (elapsed === 0 && lastStep.current === step)) return;
    time.current += elapsed;
    lastStep.current = step;
    const pulseAt = (time.current / sceneConfig.motion.stairPulsePeriod % 1) * (stairCount + 20) - 10;
    for (let i = 0; i < stairCount; i += 1) {
      const pulse = Math.exp(-(((i - pulseAt) / 5) ** 2)) * 0.6;
      const landing = step >= 0 ? Math.exp(-(((i - (30 + step * 16)) / 3) ** 2)) * 0.65 : 0;
      edges.current.setColorAt(i, color.copy(base).lerp(bright, clamp(pulse + landing)));
    }
    if (edges.current.instanceColor) edges.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={steps} args={[tread, undefined, stairCount]}>
        <meshPhysicalMaterial color={sceneConfig.colors.stone} metalness={0.18} roughness={0.38} clearcoat={0.3} clearcoatRoughness={0.3} envMapIntensity={0.8} />
      </instancedMesh>
      <instancedMesh ref={edges} args={[undefined, undefined, stairCount]}>
        <boxGeometry args={[stairWidth, 0.038, 0.055]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
