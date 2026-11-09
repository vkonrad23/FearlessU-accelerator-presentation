import type { Material, Mesh, Object3D } from 'three';

export function createOpacityFade(root: Object3D) {
  const opacities = new Map<Material, number>();
  root.traverse((object) => {
    const material = (object as Mesh).material;
    if (!material) return;
    for (const entry of Array.isArray(material) ? material : [material]) {
      if (!opacities.has(entry)) opacities.set(entry, entry.opacity);
    }
  });

  return (opacity: number) => {
    const factor = Math.max(0, Math.min(1, opacity));
    for (const [material, baseOpacity] of opacities) {
      material.opacity = baseOpacity * factor;
    }
  };
}
