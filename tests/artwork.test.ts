import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { artworkCover, artworkFrame } from '../src/lib/artwork-math.ts';
import { sceneConfig } from '../src/config/scene.ts';

test('artwork cover preserves image proportions and samples within its edges', () => {
  for (const [width, height] of [[320, 732], [390, 732], [768, 900], [900, 774], [1280, 594], [1440, 774], [1920, 954]]) {
    const crop = artworkCover(width, height);
    assert.ok(Math.abs(crop.coverX / crop.coverY * sceneConfig.artwork.aspect - width / height) < 1e-10);
    assert.ok(crop.offsetX >= 0 && crop.offsetX + crop.coverX <= 1);
    assert.ok(crop.offsetY >= 0 && crop.offsetY + crop.coverY <= 1);
  }
});

test('WebGL crop follows the same focal point as the CSS poster', () => {
  for (const [width, height] of [[390, 732], [900, 774], [1920, 954]]) {
    const crop = artworkCover(width, height);
    const point = width <= sceneConfig.quality.mobileBreakpoint
      ? sceneConfig.artwork.focalPoint.mobile : sceneConfig.artwork.focalPoint.desktop;
    assert.equal(crop.offsetX, (1 - crop.coverX) * point[0]);
    assert.equal(crop.offsetY, (1 - crop.coverY) * (1 - point[1]));
  }
});

test('portrait framing retains the standing figure and sunlit valley', () => {
  for (const width of [320, 390, 430]) {
    const frame = artworkFrame(width, 732);
    const crop = artworkCover(frame.width, frame.height);
    for (const subjectX of [0.46, 0.55, 0.655]) {
      assert.ok(subjectX >= crop.offsetX && subjectX <= crop.offsetX + crop.coverX);
    }
  }
});

test('mobile artwork leaves room for the copy without changing desktop framing', () => {
  for (const [width, height] of [[320, 456], [390, 732], [430, 820], [667, 263], [760, 318]]) {
    const frame = artworkFrame(width, height);
    assert.equal(frame.width, width);
    assert.ok(frame.height > 0 && frame.height <= height);
    if (width < height) assert.ok(frame.height <= height * sceneConfig.artwork.mobileHeightRatio);
    const crop = artworkCover(frame.width, frame.height);
    const visibleTop = 1 - crop.offsetY - crop.coverY;
    const visibleBottom = 1 - crop.offsetY;
    assert.ok(visibleTop < 0.17 && visibleBottom > 0.58, `figure cropped at ${width}x${height}`);
  }
  for (const [width, height] of [[768, 900], [900, 774], [1440, 774], [1920, 954]]) {
    assert.deepEqual(artworkFrame(width, height), { width, height });
  }
});

test('wide framing keeps the full figure visible with room around the head and feet', () => {
  const headTop = 0.17;
  const feetBottom = 0.58;
  for (const [width, height] of [[760, 430], [1440, 774], [1920, 954], [1920, 1080]]) {
    const crop = artworkCover(width, height);
    const visibleTop = 1 - (crop.offsetY + crop.coverY);
    const visibleBottom = 1 - crop.offsetY;
    assert.ok(headTop - visibleTop >= 0.06, `head margin too small at ${width}x${height}`);
    assert.ok(visibleBottom - feetBottom >= 0.06, `foot margin too small at ${width}x${height}`);
  }
});

test('the selected hero is a local, optimized WebP', () => {
  assert.match(sceneConfig.artwork.src, /^\/fearlessu-[a-z-]+\.webp$/);
  const image = readFileSync(new URL(`../public${sceneConfig.artwork.src}`, import.meta.url));
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(image.length < 250_000);
});
