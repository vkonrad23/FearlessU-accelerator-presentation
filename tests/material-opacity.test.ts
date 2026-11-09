import assert from 'node:assert/strict';
import test from 'node:test';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import { createOpacityFade } from '../src/lib/material-opacity.ts';

test('landscape fades preserve authored opacity, including arrays and shared materials', () => {
  const root = new Group();
  const nested = new Group();
  const geometry = new BoxGeometry();
  const solid = new MeshBasicMaterial({ transparent: true });
  const beam = new MeshBasicMaterial({ transparent: true, opacity: 0.055 });
  const haze = new MeshBasicMaterial({ transparent: true, opacity: 0.04 });
  const ground = new MeshBasicMaterial({ transparent: true, opacity: 0.34 });
  nested.add(new Mesh(geometry, [beam, haze, ground]));
  root.add(new Mesh(geometry, solid), nested, new Mesh(geometry, beam));
  const fade = createOpacityFade(root);
  for (const factor of [0, 0.5, 0.5, 1, 0.25, 1]) {
    fade(factor);
    assert.equal(solid.opacity, factor);
    assert.equal(beam.opacity, 0.055 * factor);
    assert.equal(haze.opacity, 0.04 * factor);
    assert.equal(ground.opacity, 0.34 * factor);
  }
  geometry.dispose();
  for (const material of [solid, beam, haze, ground]) material.dispose();
});

test('fades clamp their range and restore materials before being recaptured', () => {
  const root = new Group();
  const geometry = new BoxGeometry();
  const material = new MeshBasicMaterial({ transparent: true, opacity: 0.055 });
  root.add(new Mesh(geometry, material));
  const fade = createOpacityFade(root);
  fade(-1);
  assert.equal(material.opacity, 0);
  fade(2);
  assert.equal(material.opacity, 0.055);
  fade(0.5);
  fade(1);
  const remountedFade = createOpacityFade(root);
  remountedFade(0.5);
  assert.equal(material.opacity, 0.0275);
  remountedFade(1);
  assert.equal(material.opacity, 0.055);
  geometry.dispose();
  material.dispose();
});
