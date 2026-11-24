import { useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect } from 'react';
import { sceneConfig } from '@/config/scene';
import { prepareShaders } from '@/lib/prepare-shaders';
import { useJourneyStore } from '@/store/journey';
import { Atmosphere } from './Atmosphere';

const Effects = lazy(() => import('./Effects'));

export function ResearchEnvironment() {
  const { gl, scene, camera, invalidate } = useThree();
  const chapter = useJourneyStore((state) => state.chapter);
  const quality = useJourneyStore((state) => state.quality);

  useEffect(() => {
    const controller = new AbortController();
    useJourneyStore.setState({ landscapeRequested: true });
    void prepareShaders(gl, scene, camera, controller.signal).then(() => {
      if (controller.signal.aborted) return;
      useJourneyStore.setState({ landscapeReady: true, mode: 'webgl' });
      invalidate();
    }).catch(() => {
      if (!controller.signal.aborted) useJourneyStore.setState({ mode: 'static' });
    });
    return () => {
      controller.abort();
      useJourneyStore.setState({ landscapeReady: false });
    };
  }, [gl, scene, camera, invalidate]);

  return (
    <>
      <fog attach="fog" args={[sceneConfig.colors.skyTop, 42, 120]} />
      <Atmosphere />
      {chapter > 0 && quality !== 'low' && <Suspense fallback={null}><Effects /></Suspense>}
    </>
  );
}
