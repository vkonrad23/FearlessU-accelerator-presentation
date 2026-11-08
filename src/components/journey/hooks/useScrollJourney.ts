'use client';

import { useEffect } from 'react';
import { sceneConfig, chapters } from '@/config/scene';
import { progressFromStops, type ScrollStop } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

export function useScrollJourney() {
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    const start = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'), import('gsap'), import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const lenis = new Lenis({
        duration: sceneConfig.motion.scrollDuration,
        smoothWheel: !media.matches,
        syncTouch: false,
        // Lenis already applies the root's responsive CSS scroll padding.
        anchors: true,
      });
      let stops: ScrollStop[] = [];
      const measure = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        stops = Array.from(document.querySelectorAll<HTMLElement>('[data-camera-stop]'))
          .map((element) => ({
            top: Math.min(max, Math.max(0, element.getBoundingClientRect().top + window.scrollY - (element.id === 'top' ? 0 : scrollPadding))),
            progress: Number(element.dataset.cameraStop),
          }));
      };
      const update = () => {
        const y = window.scrollY;
        const progress = progressFromStops(y, stops);
        let chapter = 0;
        chapters.forEach((item, index) => {
          const element = document.getElementById(item.id);
          if (element && element.getBoundingClientRect().top < window.innerHeight * 0.48) chapter = index;
        });
        let activeStep = 0;
        document.querySelectorAll<HTMLElement>('[data-process-step]').forEach((element, index) => {
          if (element.getBoundingClientRect().top < window.innerHeight * 0.55) activeStep = index;
        });
        useJourneyStore.setState({ progress, chapter, activeStep });
        const shell = document.querySelector<HTMLElement>('.journey-shell');
        if (shell) {
          shell.dataset.chapter = String(chapter);
          shell.dataset.progress = progress.toFixed(4);
          shell.style.setProperty('--sun-progress', String(Math.min(1, Math.max(0, (progress - 0.08) / 0.72))));
        }
      };
      const tick = (time: number) => lenis.raf(time * 1000);
      const onVisibility = () => {
        if (document.hidden) gsap.ticker.remove(tick);
        else gsap.ticker.add(tick);
      };
      const onPreference = () => {
        lenis.options.smoothWheel = !media.matches;
        useJourneyStore.setState({ reducedMotion: media.matches });
      };
      measure();
      update();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: update,
        onRefresh: () => { measure(); update(); },
      });
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(document.body);
      media.addEventListener('change', onPreference);
      document.addEventListener('visibilitychange', onVisibility);
      cleanup = () => {
        observer.disconnect();
        trigger.kill();
        gsap.ticker.remove(tick);
        lenis.destroy();
        media.removeEventListener('change', onPreference);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    };
    void start();
    return () => { cancelled = true; cleanup(); };
  }, []);
}
