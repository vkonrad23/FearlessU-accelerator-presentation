import { sceneConfig } from '@/config/scene';
import { CameraRig } from './CameraRig';
import { Particles } from './Particles';
import Landscape from './Landscape';

export function Scene() {
  return (
    <>
      <fog attach="fog" args={[sceneConfig.colors.skyTop, sceneConfig.world.fogNear, sceneConfig.world.fogFar]} />
      <CameraRig />
      <Particles />
      <Landscape />
    </>
  );
}
