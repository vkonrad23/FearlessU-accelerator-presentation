import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PerspectiveCamera, Vector3 } from 'three';
import { sceneConfig } from '../src/config/scene.ts';
import { artworkFrame } from '../src/lib/artwork-math.ts';
import { stairPosition } from '../src/lib/scene-math.ts';
import { capeVertex, cardWorldPosition, spatialFrameHeight, type SpatialPoint } from '../src/lib/spatial-math.ts';

test('the real cloth remains attached to the shoulders at every wind strength', () => {
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    const anchor = capeVertex(u, 0, 0, 0, [0, 0, 0]);
    for (const time of [0, 0.5, 10, 90]) {
      for (const wind of [0, 0.5, 1]) {
        assert.deepEqual(capeVertex(u, 0, time, wind, [0, 0, 0]), anchor);
      }
    }
  }
});

test('cloth has bounded three-dimensional folds and continuous motion', () => {
  const point: SpatialPoint = [0, 0, 0];
  const next: SpatialPoint = [0, 0, 0];
  for (let time = 0; time < 15; time += 0.5) {
    for (let u = 0; u <= 1; u += 0.1) {
      for (let v = 0; v <= 1; v += 0.1) {
        capeVertex(u, v, time, 1, point);
        assert.ok(point.every(Number.isFinite));
        assert.ok(point[0] >= -1.5 && point[0] <= 0.8);
        assert.ok(point[1] >= 0.2 && point[1] <= 1.63);
        assert.ok(point[2] >= 0.12 && point[2] <= 1.4);
        assert.ok(Math.hypot(point[0], point[1] - 0.95, point[2] - 0.7) < 1.85);
        capeVertex(u, v, time + 0.001, 1, next);
        assert.ok(Math.hypot(...point.map((value, index) => value - next[index])) < 0.003);
      }
    }
  }
  assert.notDeepEqual(capeVertex(0.2, 0.8, 0, 0, point), capeVertex(0.2, 0.8, 1, 1, next));
  assert.ok(Math.abs(capeVertex(0.2, 0.8, 0, 0, point)[2] - 0.19) > 0.3);
});

test('cloth and platform geometry stay within small adaptive budgets', () => {
  const counts = Object.values(sceneConfig.figure.capeSegments).map(([x, y]) => (x + 1) * (y + 1));
  assert.ok(counts[0] < 1400);
  assert.ok(counts[1] < counts[0] && counts[2] < counts[1]);
  assert.ok(sceneConfig.world.platformSteps.length <= 6);
  for (const step of sceneConfig.world.platformSteps) {
    assert.ok(step >= 0 && step < sceneConfig.world.stairCount);
  }
});

test('the mobile 3D viewport opens continuously into the full landscape', () => {
  for (const [width, height] of [[390, 732], [320, 456], [667, 263]]) {
    assert.equal(spatialFrameHeight(width, height, 0), artworkFrame(width, height).height);
    assert.equal(spatialFrameHeight(width, height, 1), height);
    let previous = spatialFrameHeight(width, height, 0);
    for (let i = 1; i <= 1000; i += 1) {
      const next = spatialFrameHeight(width, height, i / 1000);
      assert.ok(next >= previous && next <= height);
      assert.ok(next - previous < 4);
      previous = next;
    }
  }
  assert.equal(spatialFrameHeight(1440, 774, 0), 774);
  assert.equal(spatialFrameHeight(1440, 774, 0.5), 774);
});

test('the 3D figure stays inside desktop and mobile hero framing', () => {
  const key = sceneConfig.camera.keyframes[0];
  const base = stairPosition(sceneConfig.models.figureStep);
  for (const [width, height] of [[1440, 774], [1280, 594], [390, 732], [320, 456]]) {
    const frameHeight = spatialFrameHeight(width, height, 0);
    for (const intro of [0, 1]) {
      const camera = new PerspectiveCamera(sceneConfig.camera.fov, width / height, 0.1, 420);
      camera.position.set(...key.position);
      camera.position.z += (1 - intro) * sceneConfig.motion.introDolly;
      camera.lookAt(new Vector3(...key.target));
      camera.setViewOffset(width, frameHeight, 0, 0, width, height);
      camera.updateMatrixWorld();
      for (const figureHeight of [0, 1, 1.98]) {
        const point = new Vector3(base[0] - 0.3, base[1] + 0.2 + figureHeight * sceneConfig.figure.scale, base[2]).project(camera);
        const y = (1 - point.y) * height / 2;
        assert.ok(point.x > -1 && point.x < 1, `Figure outside ${width}px frame`);
        assert.ok(y > 0 && y < frameHeight, `Figure cropped at ${width}px: ${y} / ${frameHeight}`);
      }
    }
  }
});

test('glass cards occupy world depth and retrace their route exactly', () => {
  const start = Array.from({ length: 6 }, (_, index) => cardWorldPosition(index, 0, [0, 0, 0]));
  assert.ok(Math.max(...start.map((point) => point[2])) - Math.min(...start.map((point) => point[2])) > 5);
  for (let index = 0; index < 6; index += 1) {
    const forward = Array.from({ length: 101 }, (_, i) => cardWorldPosition(index, i / 100, [0, 0, 0]));
    const reverse = Array.from({ length: 101 }, (_, i) => cardWorldPosition(index, (100 - i) / 100, [0, 0, 0])).reverse();
    assert.deepEqual(forward, reverse);
    assert.ok(forward.flat().every(Number.isFinite));
  }
});

test('the primary WebGL scene uses the landscape rather than an image plane', () => {
  const scene = readFileSync(new URL('../src/components/world/Scene.tsx', import.meta.url), 'utf8');
  assert.match(scene, /<Landscape\s*\/>/);
  assert.doesNotMatch(scene, /ArtworkBackdrop/);
});
