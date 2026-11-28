import { useRef } from 'react';
import { Group } from 'three';
import { useJourneyStore } from '@/store/journey';
import { Cards } from './Cards';
import { Figure } from './Figure';
import { Mountains } from './Mountains';
import { Sky } from './Sky';
import { Stairs } from './Stairs';
import { HopefulRight } from './HopefulRight';
import { RuinedLeft } from './RuinedLeft';
import { Platforms } from './Platforms';

export default function Landscape() {
  const root = useRef<Group>(null);
  const ready = useJourneyStore((state) => state.landscapeReady);

  return (
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
  );
}
