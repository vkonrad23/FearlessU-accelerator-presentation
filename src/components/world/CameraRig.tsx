import { useFrame, useThree } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3, MathUtils } from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { cameraCurveT } from '@/lib/scene-math';
import { usePointer } from './usePointer';

export function CameraRig() {
  const { invalidate } = useThree();
  const current = useRef(useJourneyStore.getState().progress);
  const frames = useRef(0);
  const pointer = usePointer();
  const offset = useRef({ x: 0, y: 0 });
  const scratch = useRef({ position: new Vector3(), target: new Vector3() });
  const [path, aim] = useMemo(() => [
    new CatmullRomCurve3(sceneConfig.camera.keyframes.map((key) => new Vector3(...key.position)), false, 'catmullrom', 0.35),
    new CatmullRomCurve3(sceneConfig.camera.keyframes.map((key) => new Vector3(...key.target)), false, 'catmullrom', 0.35),
  ] as const, []);

  useEffect(() => useJourneyStore.subscribe((state, previous) => {
    if (state.visible && state.motionPaused && (
      state.progress !== previous.progress || state.selectedFeature !== previous.selectedFeature
      || state.activeStep !== previous.activeStep || state.landscapeReady !== previous.landscapeReady
    )) invalidate();
  }), [invalidate]);

  useFrame(({ camera, gl }, delta) => {
    const state = useJourneyStore.getState();
    if (!state.landscapeRequested && state.progress >= sceneConfig.world.loadAt) {
      useJourneyStore.setState({ landscapeRequested: true });
    }
    const { position, target } = scratch.current;
    current.current = state.motionPaused ? state.progress : MathUtils.damp(current.current, state.progress, sceneConfig.camera.smoothing, Math.min(delta, 0.05));
    const t = cameraCurveT(current.current);
    path.getPoint(t, position);
    aim.getPoint(t, target);
    const dt = Math.min(delta, 0.05);
    if (!state.motionPaused) {
      offset.current.x = MathUtils.damp(offset.current.x, pointer.current.x * sceneConfig.motion.parallaxStrength, sceneConfig.motion.parallaxLerp, dt);
      offset.current.y = MathUtils.damp(offset.current.y, pointer.current.y * sceneConfig.motion.parallaxStrength * 0.45, sceneConfig.motion.parallaxLerp, dt);
    }
    position.x += offset.current.x;
    position.y += offset.current.y;
    position.z += (1 - state.intro) * sceneConfig.motion.introDolly;
    camera.position.copy(position);
    camera.lookAt(target);
    gl.domElement.dataset.cameraProgress = current.current.toFixed(4);
    gl.domElement.dataset.intro = state.intro.toFixed(3);
    gl.domElement.dataset.frameCount = String(++frames.current);
    gl.domElement.dataset.landscapeReady = String(state.landscapeReady);
  });

  return null;
}
