import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import type { Camera, Object3D, WebGLRenderer } from 'three';
import { prepareShaders } from '../src/lib/prepare-shaders.ts';
import { sceneConfig } from '../src/config/scene.ts';

function fixture(parallel = true) {
  const state = { ready: false, lost: false, queries: 0, compiled: 0 };
  const live = { program: {} as object | undefined };
  const renderer = {
    compile: () => { state.compiled += 1; },
    info: { programs: [live] },
    getContext: () => ({
      getExtension: () => parallel ? { COMPLETION_STATUS_KHR: 0x91b1 } : null,
      isContextLost: () => state.lost,
      isProgram: (program: object) => program === live.program,
      getProgramParameter: () => { state.queries += 1; return state.ready; },
    }),
  } as unknown as WebGLRenderer;
  const controller = new AbortController();
  const run = (timeout = 1000) => prepareShaders(renderer, {} as Object3D, {} as Camera, controller.signal, undefined, timeout);
  return { state, live, renderer, controller, run };
}

test('shader readiness yields and waits for the GPU before resolving', async () => {
  const { state, run } = fixture();
  let complete = false;
  const pending = run().then(() => { complete = true; });
  await delay(20);
  assert.equal(complete, false);
  assert.ok(state.queries > 0);
  state.ready = true;
  await pending;
  assert.equal(state.compiled, 1);
});

test('shader preparation cancels polling when the scene unmounts', async () => {
  const { state, controller, run } = fixture();
  const pending = run();
  controller.abort();
  await pending;
  await delay(20);
  assert.equal(state.queries, 0);
  await run();
  assert.equal(state.compiled, 1, 'An already-aborted request must not compile.');
});

test('disposed GPU programs are skipped rather than reading stale material properties', async () => {
  const { live, state, run } = fixture();
  const pending = run();
  live.program = undefined;
  await pending;
  assert.equal(state.queries, 0);
});

test('lost contexts and preparation timeouts reject for static fallback', async () => {
  const lost = fixture();
  lost.state.lost = true;
  await assert.rejects(lost.run(), /context lost/);
  await assert.rejects(fixture().run(0), /timed out/);
});

test('preparation still resolves when parallel shader compilation is unavailable', async () => {
  const { state, run } = fixture(false);
  await run();
  assert.equal(state.compiled, 1);
  assert.equal(state.queries, 0);
});

test('artwork mesh density stays bounded across quality tiers', () => {
  const counts = Object.values(sceneConfig.artwork.segments).map(([x, y]) => (x + 1) * (y + 1));
  assert.ok(counts[0] < 26_000);
  assert.ok(counts[1] < counts[0] && counts[2] < counts[1]);
});
