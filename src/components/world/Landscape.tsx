import { useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Group } from 'three';
import { useJourneyStore } from '@/store/journey';
import { prepareShaders } from '@/lib/prepare-shaders';
import { Atmosphere } from './Atmosphere';
import { Cards } from './Cards';
import { Figure } from './Figure';
import { Mountains } from './Mountains';
import { Sky } from './Sky';
import { Stairs } from './Stairs';
import { HopefulRight } from './HopefulRight';
import { RuinedLeft } from './RuinedLeft';
import { Platforms } from './Platforms';

const Effects = lazy(() => import('./Effects'));

export default function Landscape() {
  const root = useRef<Group>(null);
  const { gl, scene, camera, invalidate } = useThree();
  const ready = useJourneyStore((state) => state.landscapeReady);
  const chapter = useJourneyStore((state) => state.chapter);
  const quality = useJourneyStore((state) => state.quality);

  useEffect(() => {
    const group = root.current;
    if (!group) return;
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
      <Atmosphere />
      <group ref={root} name="spatial-landscape" visible={ready}>
        <Sky />
        <Mountains />
        <RuinedLeft />
        <HopefulRight />
        <Stairs />
        <Platforms />
        <Figure />
        <Cards />
      </group>
      {ready && chapter > 0 && quality !== 'low' && <Suspense fallback={null}><Effects /></Suspense>}
    </>
  );
}
