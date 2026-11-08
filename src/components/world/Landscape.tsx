import { useThree } from '@react-three/fiber';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Group } from 'three';
import { useJourneyStore } from '@/store/journey';
import { Atmosphere } from './Atmosphere';
import { Cards } from './Cards';
import { Figure } from './Figure';
import { Mountains } from './Mountains';
import { Sky } from './Sky';
import { Stairs } from './Stairs';
import { HopefulRight } from './HopefulRight';
import { RuinedLeft } from './RuinedLeft';

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
    let cancelled = false;
    void gl.compileAsync(group, camera, scene).then(() => {
      if (cancelled) return;
      useJourneyStore.setState({ landscapeReady: true });
      invalidate();
    }).catch(() => {
      if (!cancelled) useJourneyStore.setState({ mode: 'static' });
    });
    return () => {
      cancelled = true;
      useJourneyStore.setState({ landscapeReady: false });
    };
  }, [gl, scene, camera, invalidate]);

  return (
    <>
      <Atmosphere />
      <group ref={root} visible={ready}>
        <Sky />
        <Mountains />
        <RuinedLeft />
        <HopefulRight />
        <Stairs />
        <Figure />
        <Cards />
      </group>
      {ready && chapter > 0 && quality !== 'low' && <Suspense fallback={null}><Effects /></Suspense>}
    </>
  );
}
