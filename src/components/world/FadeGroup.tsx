import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { createOpacityFade } from '@/lib/material-opacity';
import { smoothstep } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

export function FadeGroup({ children, start, end, reverse = false }: {
  children: ReactNode;
  start: number;
  end: number;
  reverse?: boolean;
}) {
  const group = useRef<Group>(null);
  const fade = useRef<ReturnType<typeof createOpacityFade> | null>(null);

  useLayoutEffect(() => {
    if (!group.current) return;
    const update = createOpacityFade(group.current);
    fade.current = update;
    return () => {
      update(1);
      fade.current = null;
    };
  }, [children]);

  useFrame(() => {
    const opacity = smoothstep((useJourneyStore.getState().progress - start) / (end - start));
    fade.current?.(reverse ? 1 - opacity : opacity);
  });

  return <group ref={group}>{children}</group>;
}
