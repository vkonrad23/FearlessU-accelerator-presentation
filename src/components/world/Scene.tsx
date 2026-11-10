import { sceneConfig } from '@/config/scene';
import { useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect } from 'react';
import { useJourneyStore } from '@/store/journey';
import { prepareShaders } from '@/lib/prepare-shaders';
import { CameraRig } from './CameraRig';
import { ArtworkBackdrop } from './ArtworkBackdrop';
import { Particles } from './Particles';

const Landscape = lazy(() => import('./Landscape'));

export function Scene() {
  const { gl, scene, camera, invalidate } = useThree();
  const landscapeRequested = useJourneyStore((state) => state.landscapeRequested);
  useEffect(() => {
    const controller = new AbortController();
    void prepareShaders(gl, scene, camera, controller.signal).then(() => {
      if (controller.signal.aborted) return;
      useJourneyStore.setState({ mode: 'webgl' });
      invalidate();
    }).catch(() => {
      if (!controller.signal.aborted) useJourneyStore.setState({ mode: 'static' });
    });
    return () => controller.abort();
  }, [gl, scene, camera, invalidate]);
  return (
    <>
      <fog attach="fog" args={[sceneConfig.colors.skyTop, sceneConfig.world.fogNear, sceneConfig.world.fogFar]} />
      <CameraRig />
      <ArtworkBackdrop />
      <Particles />
      {landscapeRequested && <Suspense fallback={null}><Landscape /></Suspense>}
    </>
  );
}
