import { useFrame } from '@react-three/fiber';
import { Color, DirectionalLight } from 'three';
import { useMemo, useRef } from 'react';
import { sceneConfig } from '@/config/scene';
import { safetyEnvelope } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

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
      <directionalLight ref={key} position={[20, 45, -50]} intensity={sceneConfig.lighting.key} color={sceneConfig.colors.gold} />
      <hemisphereLight args={[sceneConfig.colors.sun, sceneConfig.colors.forest, sceneConfig.lighting.fill]} />
    </>
  );
}
