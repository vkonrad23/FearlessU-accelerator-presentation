import { useEffect, useMemo } from 'react';
import { Color, Float32BufferAttribute, PlaneGeometry } from 'three';
import { sceneConfig } from '@/config/scene';
import { clamp, seededRandom } from '@/lib/scene-math';

function Mountain({ layer }: { layer: number }) {
  const geometry = useMemo(() => {
    const random = seededRandom(sceneConfig.world.seed + layer * 100);
    const mesh = new PlaneGeometry(300, 110, sceneConfig.world.mountainSegments, 25);
    mesh.rotateX(-Math.PI / 2);
    const position = mesh.attributes.position;
    const centerZ = -145 + layer * 43;
    const height = 33 - layer * 3;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const valley = Math.pow(clamp(Math.abs(x - 22) / 73), 0.65);
      const ridge = Math.sin(x * 0.041 + layer * 2) * 0.3 + Math.sin(x * 0.117 + z * 0.09) * 0.15;
      const peak = Math.sin(x * 0.19 + z * 0.14) * 0.11 + random() * 0.14;
      const depth = 0.65 + Math.cos(z * 0.043) * 0.35;
      position.setXYZ(i, x, -12 - layer * 4 + (valley + ridge + peak) * height * depth, z + centerZ);
    }
    const flat = mesh.toNonIndexed();
    mesh.dispose();
    flat.computeVertexNormals();
    const colors = [];
    const base = new Color(sceneConfig.colors.mountains[layer]);
    const tint = new Color(sceneConfig.colors.gold);
    const points = flat.attributes.position;
    for (let i = 0; i < points.count; i += 3) {
      const color = base.clone().lerp(tint, clamp((points.getY(i) + 8) / 70) * 0.26).multiplyScalar(0.85 + random() * 0.26);
      for (let vertex = 0; vertex < 3; vertex += 1) colors.push(color.r, color.g, color.b);
    }
    flat.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return flat;
  }, [layer]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={1} flatShading metalness={0.03} />
    </mesh>
  );
}

export function Mountains() {
  return <group>{[0, 1, 2, 3].map((layer) => <Mountain key={layer} layer={layer} />)}</group>;
}
