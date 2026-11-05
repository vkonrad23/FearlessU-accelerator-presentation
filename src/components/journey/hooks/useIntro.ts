'use client';

import { useEffect } from 'react';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';

export function useIntro() {
  const ready = useJourneyStore((state) => state.mode === 'webgl' && state.visible);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let cleanup = () => {};
    const start = async () => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      let seen = false;
      try { seen = sessionStorage.getItem(sceneConfig.motion.introStorageKey) === 'seen'; } catch { seen = true; }
      if (seen || media.matches || window.scrollY > 30) return;
      const { gsap } = await import('gsap');
      if (cancelled || media.matches || window.scrollY > 30 || useJourneyStore.getState().motionPaused) return;
      try { sessionStorage.setItem(sceneConfig.motion.introStorageKey, 'seen'); } catch { return; }
      const intro = { progress: 0 };
      performance.mark('fearlessu:intro-start');
      useJourneyStore.setState({ intro: 0 });
      const context = gsap.context(() => {
        gsap.fromTo('.headline-mask > *',
          { yPercent: sceneConfig.motion.introTextOffset, opacity: 0.8 },
          { yPercent: 0, opacity: 1, duration: 1.35, stagger: 0.16, ease: 'power3.out', clearProps: 'all' },
        );
        gsap.to(intro, {
          progress: 1,
          duration: sceneConfig.motion.introDuration,
          ease: 'power2.inOut',
          onUpdate: () => useJourneyStore.setState({ intro: intro.progress }),
          onComplete: () => {
            performance.mark('fearlessu:intro-end');
            performance.measure('fearlessu:intro', 'fearlessu:intro-start', 'fearlessu:intro-end');
          },
        });
      });
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        context.revert();
        useJourneyStore.setState({ intro: 1 });
      };
      const unsubscribe = useJourneyStore.subscribe((state) => {
        if (state.motionPaused || state.reducedMotion || !state.visible || state.progress > 0.005) finish();
      });
      cleanup = () => { unsubscribe(); finish(); };
    };
    void start();
    return () => { cancelled = true; cleanup(); };
  }, [ready]);
}
