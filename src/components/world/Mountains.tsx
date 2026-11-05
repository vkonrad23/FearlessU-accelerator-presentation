import { useEffect, useMemo } from 'react';
import { Color, Float32BufferAttribute, PlaneGeometry } from 'three';
import { sceneConfig } from '@/config/scene';
import { clamp } from '@/lib/scene-math';
import { terrainHeight } from '@/lib/terrain';
import { useJourneyStore } from '@/store/journey';

function Mountain({ layer }: { layer: number }) {
  const quality = useJourneyStore((state) => state.quality);
  const segments = quality === 'desktop' ? sceneConfig.world.mountainSegments : quality === 'mobile' ? 64 : 40;
  const geometry = useMemo(() => {
    const mesh = new PlaneGeometry(300, 110, segments, Math.min(segments / 2, sceneConfig.world.mountainDepthSegments));
    mesh.rotateX(-Math.PI / 2);
    const position = mesh.attributes.position;
    const centerZ = -145 + layer * 43;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      position.setXYZ(i, x, terrainHeight(x, z + centerZ, layer), z + centerZ);
    }
    mesh.computeVertexNormals();
    const colors = [];
    const base = new Color(sceneConfig.colors.mountains[layer]);
    const rock = new Color(sceneConfig.colors.rock);
    const snow = new Color(sceneConfig.colors.snow);
    const color = new Color();
    for (let i = 0; i < position.count; i += 1) {
      const elevation = position.getY(i);
      const slope = 1 - Math.abs(mesh.attributes.normal.getY(i));
      color.copy(base).lerp(rock, clamp(slope * 1.8 + (elevation - 12) / 65));
      color.lerp(snow, clamp((elevation - 29) / 12) * clamp(1 - slope * 2));
      color.multiplyScalar(0.9 + clamp((elevation + 16) / 55) * 0.15);
      colors.push(color.r, color.g, color.b);
    }
    mesh.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return mesh;
  }, [layer, segments]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
    </mesh>
  );
}

export function Mountains() {
  return <group>{[0, 1, 2, 3].map((layer) => <Mountain key={layer} layer={layer} />)}</group>;
}
