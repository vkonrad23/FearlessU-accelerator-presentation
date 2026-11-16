import { sceneConfig } from '../config/scene.ts';
import { artworkFrame } from './artwork-math.ts';
import { clamp, smoothstep } from './scene-math.ts';

export type SpatialPoint = [number, number, number];

// The shoulder row stays fixed. The lower cloth moves through actual world depth.
export function capeVertex(u: number, v: number, time: number, wind: number, target: SpatialPoint) {
  const fall = clamp(v);
  const across = clamp(u) - 0.5;
  const weight = fall * fall;
  const gust = 0.78 + Math.sin(time * 0.29 + 0.7) * 0.13 + clamp(wind) * 0.3;
  const wave = Math.sin(time * 0.92 - fall * 5.6 + across * 2.4);
  const fold = Math.sin(across * Math.PI * 8 - fall * 3.2 + time * 1.38);
  target[0] = across * (0.64 + fall * 0.92) - weight * gust * (0.27 + wave * 0.21);
  target[1] = 1.62 - fall * 1.39 + weight * gust * (0.09 + wave * 0.085);
  target[2] = 0.19 + fall * 0.5 + weight * gust * (0.22 + wave * 0.2) + fold * fall * 0.065;
  return target;
}

// Frame the entire mobile diorama above the copy, then open into the full valley.
export function spatialFrameHeight(width: number, height: number, progress: number) {
  const fullHeight = Math.max(1, height);
  const heroHeight = artworkFrame(Math.max(1, width), fullHeight).height;
  const blend = smoothstep(progress / sceneConfig.cards.ringEnd);
  return heroHeight + (fullHeight - heroHeight) * blend;
}

export function cardWorldPosition(index: number, progress: number, target: SpatialPoint) {
  const config = sceneConfig.cards;
  const angle = index / 6 * Math.PI * 2 + Math.PI / 2;
  const blend = smoothstep((progress - config.ringStart) / (config.ringEnd - config.ringStart));
  const hero = config.heroCenter;
  const ring = config.ringCenter;
  const x = hero[0] + Math.cos(angle) * config.heroRadius;
  const y = hero[1] + Math.sin(angle) * config.heroRadius * 0.7;
  const z = hero[2] + Math.cos(angle) * 3.5;
  target[0] = x + (ring[0] + Math.cos(angle) * config.ringRadius - x) * blend;
  target[1] = y + (ring[1] + Math.sin(angle) * config.ringRadius - y) * blend;
  target[2] = z + (ring[2] + Math.cos(angle) * 2 - z) * blend;
  return target;
}
