import { sceneConfig } from '../config/scene.ts';
import { clamp } from './scene-math.ts';

function noise(x: number, z: number, seed: number) {
  const hash = (a: number, b: number) => {
    const value = Math.sin(a * 127.1 + b * 311.7 + seed * 17.3) * 43758.5453;
    return value - Math.floor(value);
  };
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}

export function terrainHeight(x: number, z: number, layer: number) {
  let detail = 0, amplitude = 0.55, frequency = 0.025;
  for (let octave = 0; octave < 5; octave += 1) {
    detail += (1 - Math.abs(noise(x * frequency, z * frequency, sceneConfig.world.seed + layer * 31) * 2 - 1)) * amplitude;
    frequency *= 2.07;
    amplitude *= 0.48;
  }
  const valley = Math.pow(clamp(Math.abs(x - 22) / 72), 0.8);
  const ridge = 0.58 + detail * 0.72;
  return -16 - layer * 3 + valley * (45 - layer * 4) * ridge;
}
