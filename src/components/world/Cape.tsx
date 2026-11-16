import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BufferAttribute, DoubleSide, DynamicDrawUsage, MathUtils, PlaneGeometry, Sphere, Vector3 } from 'three';
import { sceneConfig } from '@/config/scene';
import { ambientDelta } from '@/lib/scene-math';
import { capeVertex, type SpatialPoint } from '@/lib/spatial-math';
import { useJourneyStore } from '@/store/journey';
import { usePointer } from './usePointer';

function deform(geometry: PlaneGeometry, time: number, wind: number, point: SpatialPoint) {
  const { position, uv } = geometry.attributes;
  for (let index = 0; index < position.count; index += 1) {
    capeVertex(uv.getX(index), 1 - uv.getY(index), time, wind, point);
    position.setXYZ(index, point[0], point[1], point[2]);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function Cape() {
  const quality = useJourneyStore((state) => state.quality);
  const pointer = usePointer();
  const motion = useRef({ time: 0, wind: 0, x: 0, y: 0, point: [0, 0, 0] as SpatialPoint });
  const geometry = useMemo(() => {
    const [columns, rows] = sceneConfig.figure.capeSegments[quality];
    const cloth = new PlaneGeometry(1, 1, columns, rows);
    for (const attribute of [cloth.attributes.position, cloth.attributes.normal]) {
      if (attribute instanceof BufferAttribute) attribute.setUsage(DynamicDrawUsage);
    }
    deform(cloth, 0, 0, [0, 0, 0]);
    cloth.boundingSphere = new Sphere(new Vector3(0, 0.95, 0.7), 1.85);
    return cloth;
  }, [quality]);
  useLayoutEffect(() => {
    const { time, wind, point } = motion.current;
    deform(geometry, time, wind, point);
  }, [geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const { progress, motionPaused, visible } = useJourneyStore.getState();
    const state = motion.current;
    const travel = Math.hypot(pointer.current.x - state.x, pointer.current.y - state.y);
    state.x = pointer.current.x;
    state.y = pointer.current.y;
    const elapsed = ambientDelta(delta, progress, motionPaused, visible);
    if (elapsed === 0 || progress > sceneConfig.cards.fadeEnd) return;
    state.time += elapsed;
    state.wind = MathUtils.damp(state.wind, Math.min(1, travel * sceneConfig.figure.windSensitivity), sceneConfig.figure.windResponse, elapsed);
    deform(geometry, state.time, state.wind, state.point);
  });

  return (
    <mesh name="flowing-cape" geometry={geometry}>
      <meshPhysicalMaterial
        color={sceneConfig.colors.gold} roughness={0.53} metalness={0.12}
        sheen={1} sheenColor={sceneConfig.colors.sun} sheenRoughness={0.6}
        clearcoat={0.12} side={DoubleSide} envMapIntensity={0.8}
      />
    </mesh>
  );
}
