import { sceneConfig } from '@/config/scene';
import { useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect } from 'react';
import { useJourneyStore } from '@/store/journey';
import { CameraRig } from './CameraRig';
import { ArtworkBackdrop } from './ArtworkBackdrop';
import { Particles } from './Particles';

const Landscape = lazy(() => import('./Landscape'));

export function Scene() {
  const { gl, scene, camera, invalidate } = useThree();
  const landscapeRequested = useJourneyStore((state) => state.landscapeRequested);
  useEffect(() => {
    let cancelled = false;
    void gl.compileAsync(scene, camera).then(() => {
      if (cancelled) return;
      useJourneyStore.setState({ mode: 'webgl' });
      invalidate();
    }).catch(() => {
      if (!cancelled) useJourneyStore.setState({ mode: 'static' });
    });
    return () => { cancelled = true; };
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
