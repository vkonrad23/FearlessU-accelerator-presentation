import { CameraRig } from './CameraRig';
import { Particles } from './Particles';
import { ResearchCore } from './ResearchCore';
import { ResearchEnvironment } from './ResearchEnvironment';

export function Scene() {
  return (
    <>
      <CameraRig />
      <ResearchCore />
      <Particles />
      <ResearchEnvironment />
    </>
  );
}
