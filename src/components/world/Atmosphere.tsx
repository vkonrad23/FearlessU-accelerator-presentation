import { useFrame } from '@react-three/fiber';
import { Color, DirectionalLight } from 'three';
import { useMemo, useRef } from 'react';
import { sceneConfig } from '@/config/scene';
import { safetyEnvelope } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';
import { Environment, Lightformer } from '@react-three/drei';

export function Atmosphere() {
  const key = useRef<DirectionalLight>(null);
  const [warm, cool] = useMemo(() => [new Color(sceneConfig.colors.gold), new Color(sceneConfig.colors.cool)], []);
  useFrame(() => {
    if (!key.current) return;
    const { progress } = useJourneyStore.getState();
    const safety = safetyEnvelope(progress);
    key.current.color.copy(warm).lerp(cool, safety);
    key.current.intensity = sceneConfig.lighting.key * (1 - safety * 0.45);
  });
  return (
    <>
      <ambientLight intensity={sceneConfig.lighting.ambient} color={sceneConfig.colors.cool} />
      <directionalLight ref={key} position={[...sceneConfig.world.sunPosition]} intensity={sceneConfig.lighting.key} color={sceneConfig.colors.gold} />
      <hemisphereLight args={[sceneConfig.colors.sun, sceneConfig.colors.forest, sceneConfig.lighting.fill]} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} color={sceneConfig.colors.cream} position={[0, 12, -8]} rotation={[Math.PI / 2, 0, 0]} scale={[18, 12, 1]} />
        <Lightformer form="rect" intensity={3} color={sceneConfig.colors.gold} position={[12, 4, -12]} rotation={[0, -Math.PI / 4, 0]} scale={[4, 14, 1]} />
        <Lightformer form="rect" intensity={1} color={sceneConfig.colors.cool} position={[-12, 2, 4]} rotation={[0, Math.PI / 2, 0]} scale={[10, 14, 1]} />
      </Environment>
    </>
  );
}
