'use client';

import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { Poster } from './Poster';

const WorldCanvas = lazy(() => import('../world/WorldCanvas'));

class WorldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { useJourneyStore.setState({ mode: 'static' }); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function WorldLoader() {
  const [enabled, setEnabled] = useState(false);
  const mode = useJourneyStore((state) => state.mode);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia(`(max-width: ${sceneConfig.quality.mobileBreakpoint}px)`);
    const navigatorInfo = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    let cancelled = false;
    const check = () => {
      const lowEnd = (navigatorInfo.deviceMemory !== undefined && navigatorInfo.deviceMemory <= sceneConfig.quality.lowMemoryGb)
        || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= sceneConfig.quality.lowConcurrency)
        || navigatorInfo.connection?.saveData === true;
      useJourneyStore.setState({ reducedMotion: media.matches, quality: mobile.matches ? 'mobile' : 'desktop' });
      let supported = false;
      if (!media.matches && !lowEnd) {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
          supported = !!gl;
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch { supported = false; }
      }
      if (!cancelled) {
        setEnabled(supported);
        useJourneyStore.setState({ mode: supported ? 'loading' : 'static' });
      }
    };
    const resize = () => {
      if (useJourneyStore.getState().quality !== 'low') {
        useJourneyStore.setState({ quality: mobile.matches ? 'mobile' : 'desktop' });
      }
    };
    const timer = window.setTimeout(check, sceneConfig.quality.loadDelayMs);
    media.addEventListener('change', check);
    mobile.addEventListener('change', resize);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      media.removeEventListener('change', check);
      mobile.removeEventListener('change', resize);
    };
  }, []);

  useEffect(() => {
    if (mode !== 'loading') return;
    const timeout = window.setTimeout(() => {
      setEnabled(false);
      useJourneyStore.setState({ mode: 'static' });
    }, sceneConfig.quality.loadTimeoutMs);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  return (
    <div className="world-layer" aria-hidden="true" data-render-mode={mode}>
      <Poster />
      {enabled && mode !== 'static' && <WorldBoundary><Suspense fallback={null}><WorldCanvas /></Suspense></WorldBoundary>}
    </div>
  );
}
