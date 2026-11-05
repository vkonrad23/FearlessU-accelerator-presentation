import assert from 'node:assert/strict';
import test from 'node:test';
import { ambientDelta, artworkOpacity, cameraCurveT, progressFromStops, safetyEnvelope, seededRandom, stairPosition } from '../src/lib/scene-math.ts';
import { sceneConfig } from '../src/config/scene.ts';
import { getHeroRecommendation } from '../src/data/demoJourneys.ts';
import { isLocalModelPath } from '../src/lib/model-assets.ts';

test('camera visits all five scenes and holds exact keyframes', () => {
  sceneConfig.camera.keyframes.forEach((key, index) => {
    assert.equal(cameraCurveT(key.at), index / (sceneConfig.camera.keyframes.length - 1));
  });
  assert.equal(cameraCurveT(-1), 0);
  assert.equal(cameraCurveT(2), 1);
});

test('camera interpolation is continuous, monotonic, and reversible', () => {
  const forward = Array.from({ length: 10001 }, (_, index) => cameraCurveT(index / 10000));
  for (let i = 1; i < forward.length; i += 1) {
    assert.ok(forward[i] >= forward[i - 1]);
    assert.ok(forward[i] - forward[i - 1] < 0.001);
  }
  const backward = Array.from({ length: 10001 }, (_, index) => cameraCurveT((10000 - index) / 10000)).reverse();
  assert.deepEqual(forward, backward);
});

test('DOM stop mapping is bounded and tolerates a duplicate stop', () => {
  const stops = [{ top: 0, progress: 0 }, { top: 100, progress: 0.22 }, { top: 100, progress: 0.22 }, { top: 500, progress: 1 }];
  assert.equal(progressFromStops(-100, stops), 0);
  assert.equal(progressFromStops(50, stops), 0.11);
  assert.equal(progressFromStops(100, stops), 0.22);
  assert.equal(progressFromStops(900, stops), 1);
  assert.equal(progressFromStops(100, []), 0);
});

test('every procedural stair rises and moves forward without invalid geometry', () => {
  let previous = stairPosition(0);
  for (let index = 1; index < sceneConfig.world.stairCount; index += 1) {
    const point = stairPosition(index);
    assert.ok(point.every(Number.isFinite));
    assert.ok(point[1] > previous[1]);
    assert.ok(point[2] < previous[2]);
    previous = point;
  }
});

test('procedural randomness is reproducible', () => {
  const first = seededRandom(46);
  const second = seededRandom(46);
  for (let i = 0; i < 100; i += 1) assert.equal(first(), second());
});

test('high-difficulty educational previews stay with preparation', () => {
  for (const scenario of ['speaking', 'social', 'conversation'] as const) {
    const result = getHeroRecommendation(scenario, 9);
    assert.equal(result.title, 'Preparation is progress, too.');
    assert.match(result.reason, /qualified support/);
  }
});

test('safety lighting and motion ease in and back out', () => {
  assert.equal(safetyEnvelope(0), 0);
  assert.equal(safetyEnvelope(0.8), 1);
  assert.equal(safetyEnvelope(1), 0);
  for (let i = 0; i <= 100; i += 1) {
    const envelope = safetyEnvelope(i / 100);
    assert.ok(envelope >= 0 && envelope <= 1);
  }
  assert.ok(ambientDelta(0.016, 0.8, false, true) < ambientDelta(0.016, 0, false, true));
});

test('ambient motion stops when paused or hidden without a resume jump', () => {
  assert.equal(ambientDelta(1, 0, true, true), 0);
  assert.equal(ambientDelta(1, 0, false, false), 0);
  assert.equal(ambientDelta(30, 0, false, true), 0.05);
  assert.equal(ambientDelta(-1, 0, false, true), 0);
});

test('the original artwork covers the world until lazy landscape shaders are ready', () => {
  for (const progress of [0, 0.1, 0.22, 0.8, 1]) {
    assert.equal(artworkOpacity(progress, 0), 1);
  }
  assert.equal(artworkOpacity(0, 1), 1);
  assert.equal(artworkOpacity(1, 0.5), 0.5);
  assert.equal(artworkOpacity(1, 1), 0);
});

test('optional models cannot request remote or parent-directory assets', () => {
  assert.equal(isLocalModelPath('/models/figure.glb'), true);
  assert.equal(isLocalModelPath('/models/figures/person-01.glb'), true);
  for (const path of ['https://example.com/model.glb', '//example.com/a.glb', '/models/../secret.glb', '/models/%2e%2e/a.glb', '/models/figure.gltf']) {
    assert.equal(isLocalModelPath(path), false);
  }
});

test('reading colors retain AA contrast over the brightest possible backdrop', () => {
  const rgb = (hex: string) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = (color: number[]) => color.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const contrast = (foreground: number[], background: number[]) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  const brightestPanel = rgb(sceneConfig.colors.background).map((value) => value * 0.88 + 0.12);
  for (const color of [sceneConfig.colors.cream, sceneConfig.colors.muted, sceneConfig.colors.gold]) {
    assert.ok(contrast(rgb(color), brightestPanel) >= 4.5);
  }
  assert.ok(contrast(rgb(sceneConfig.colors.forest), rgb(sceneConfig.colors.cream)) >= 4.5);
  assert.ok(contrast(rgb(sceneConfig.colors.background), rgb(sceneConfig.colors.gold)) >= 4.5);
});
