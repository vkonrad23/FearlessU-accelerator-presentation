import { use, useEffect, useRef } from 'react';
import { LoadingManager, Material, Mesh, Texture } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { sceneConfig } from '@/config/scene';
import { isLocalModelPath } from '@/lib/model-assets';

const cache = new Map<string, Promise<GLTF>>();
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

async function loadModel(src: string) {
  if (!isLocalModelPath(src)) throw new Error('Optional models must be local /models/*.glb files.');
  const response = await fetch(`${base}${src}`, { signal: AbortSignal.timeout(sceneConfig.quality.loadTimeoutMs) });
  if (!response.ok || !response.body) throw new Error('Optional model unavailable.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > sceneConfig.models.maxBytes) {
        await reader.cancel();
        throw new Error('Optional model exceeds the configured byte budget.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const decoderPath = `${base}${sceneConfig.models.dracoPath}`;
  const manager = new LoadingManager();
  manager.setURLModifier((url) => {
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    const resolved = new URL(url, window.location.origin);
    if (resolved.origin === window.location.origin && resolved.pathname.startsWith(decoderPath)) return resolved.href;
    throw new Error('Use a self-contained GLB, without external buffers or textures.');
  });
  const draco = new DRACOLoader(manager).setDecoderPath(decoderPath).setWorkerLimit(2);
  try {
    return await new GLTFLoader(manager).setDRACOLoader(draco).parseAsync(bytes.buffer, `${base}/models/`);
  } finally { draco.dispose(); }
}

function disposeModel(model: GLTF) {
  const resources = new Set<{ dispose: () => void }>();
  model.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    resources.add(object.geometry);
    const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      resources.add(material);
      Object.values(material).forEach((value) => { if (value instanceof Texture) resources.add(value); });
    });
  });
  resources.forEach((resource) => resource.dispose());
}

export default function OptionalModel({ src }: { src: string }) {
  if (!cache.has(src)) cache.set(src, loadModel(src));
  const model = use(cache.get(src)!);
  const cleanupTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(cleanupTimer.current);
    return () => {
      // A deferred release also tolerates React's development effect replay.
      cleanupTimer.current = window.setTimeout(() => {
        disposeModel(model);
        cache.delete(src);
      }, 0);
    };
  }, [model, src]);
  return <primitive object={model.scene} dispose={null} />;
}
