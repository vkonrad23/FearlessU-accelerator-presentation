import { Suspense } from 'react';
import { CameraRig } from './CameraRig';
import { GalaxyBackdrop } from './GalaxyBackdrop';
import { HolographicGuide } from './HolographicGuide';
import { Particles } from './Particles';
import { ResearchCore } from './ResearchCore';
import { ResearchEnvironment } from './ResearchEnvironment';

export function Scene() {
  return (
    <>
      <CameraRig />
      <GalaxyBackdrop />
      <ResearchCore />
      <Particles />
      <Suspense fallback={null}><HolographicGuide /></Suspense>
      <ResearchEnvironment />
    </>
  );
}
