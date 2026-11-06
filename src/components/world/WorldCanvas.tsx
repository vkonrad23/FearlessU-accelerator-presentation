'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { useEffect, useRef } from 'react';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { Scene } from './Scene';

function ContextGuard() {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      useJourneyStore.setState({ mode: 'static' });
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl]);
  return null;
}

export default function WorldCanvas() {
  const host = useRef<HTMLDivElement>(null);
  const quality = useJourneyStore((state) => state.quality);
  const visible = useJourneyStore((state) => state.visible);
  const paused = useJourneyStore((state) => state.motionPaused);
  const mode = useJourneyStore((state) => state.mode);
  const landscapeReady = useJourneyStore((state) => state.landscapeReady);
  const profile = sceneConfig.quality[quality];
  const maxDpr = landscapeReady ? sceneConfig.quality.maxDpr : sceneConfig.quality.artworkDpr;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let intersecting = true;
    const update = () => useJourneyStore.setState({ visible: intersecting && !document.hidden });
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <div ref={host} className="webgl-host" data-quality={quality} data-motion={paused ? 'paused' : 'running'} data-visible={visible}>
      <Canvas
        aria-hidden="true"
        tabIndex={-1}
        dpr={[0.75, Math.min(profile.dpr, maxDpr, sceneConfig.quality.maxDpr)]}
        camera={{ position: [...sceneConfig.camera.keyframes[0].position], fov: sceneConfig.camera.fov, near: sceneConfig.camera.near, far: sceneConfig.camera.far }}
        gl={{ antialias: quality !== 'low', alpha: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}
        frameloop={visible && mode === 'webgl' ? (paused ? 'demand' : 'always') : 'never'}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = sceneConfig.effects.exposure;
        }}
      >
        <ContextGuard />
        <PerformanceMonitor
          bounds={() => [...sceneConfig.quality.fpsBounds]}
          flipflops={2}
          onDecline={() => useJourneyStore.setState((state) => ({ quality: state.quality === 'desktop' ? 'mobile' : 'low' }))}
          onFallback={() => useJourneyStore.setState({ quality: 'low' })}
        >
          <Scene />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
