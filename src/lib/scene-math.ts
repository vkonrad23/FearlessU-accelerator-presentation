import { sceneConfig } from '../config/scene.ts';

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function stairPosition(index: number): [number, number, number] {
  const { stairStart, stairCount, stairRise, stairRun } = sceneConfig.world;
  const t = index / (stairCount - 1);
  return [
    stairStart[0] + Math.sin(t * Math.PI * 0.85) * 12 + t * 9,
    stairStart[1] + index * stairRise,
    stairStart[2] - index * stairRun,
  ];
}

export type ScrollStop = { top: number; progress: number };

export function progressFromStops(scrollY: number, stops: readonly ScrollStop[]) {
  if (!stops.length || scrollY <= stops[0].top) return stops[0]?.progress ?? 0;
  for (let i = 1; i < stops.length; i += 1) {
    if (scrollY <= stops[i].top) {
      const previous = stops[i - 1];
      const span = stops[i].top - previous.top;
      const local = span > 0 ? clamp((scrollY - previous.top) / span) : 1;
      return previous.progress + (stops[i].progress - previous.progress) * local;
    }
  }
  return stops[stops.length - 1].progress;
}

export function cameraCurveT(progress: number) {
  const keys = sceneConfig.camera.keyframes;
  const value = clamp(progress);
  const next = keys.findIndex((key) => key.at > value);
  if (next === -1) return 1;
  const index = Math.max(0, next - 1);
  const local = (value - keys[index].at) / (keys[index + 1].at - keys[index].at);
  return (index + smoothstep(local)) / (keys.length - 1);
}

export function safetyEnvelope(progress: number) {
  const { safetyStart, safetyPeak, safetyEndStart, safetyEnd } = sceneConfig.motion;
  return smoothstep((progress - safetyStart) / (safetyPeak - safetyStart))
    * (1 - smoothstep((progress - safetyEndStart) / (safetyEnd - safetyEndStart)));
}

export function ambientDelta(delta: number, progress: number, paused: boolean, visible: boolean) {
  if (paused || !visible) return 0;
  const speed = 1 - safetyEnvelope(progress) * (1 - sceneConfig.motion.safetySpeed);
  return clamp(delta, 0, 0.05) * sceneConfig.motion.animationSpeed * speed;
}

export function artworkOpacity(progress: number, landscapeBlend: number) {
  const { fadeStart, fadeEnd } = sceneConfig.artwork;
  return 1 - smoothstep((progress - fadeStart) / (fadeEnd - fadeStart)) * clamp(landscapeBlend);
}
