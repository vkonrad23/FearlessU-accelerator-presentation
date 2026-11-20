import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  MeshBasicMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import type { Group, Mesh } from 'three';
import { smoothstep } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

export function AICompanion() {
  const root = useRef<Group>(null);
  const headOrbit = useRef<Mesh>(null);
  const waistOrbit = useRef<Mesh>(null);
  const baseRing = useRef<Mesh>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const compact = width < 560 || width / Math.max(height, 1) < 0.78;

  const materials = useMemo(() => ({
    shell: new MeshBasicMaterial({ color: 0x42cbbb, transparent: true, opacity: 0.13, depthWrite: false, toneMapped: false }),
    wire: new MeshBasicMaterial({ color: 0x4df5e5, transparent: true, opacity: 0.64, wireframe: true, depthWrite: false, toneMapped: false }),
    hair: new MeshBasicMaterial({ color: 0x6398f5, transparent: true, opacity: 0.38, wireframe: true, depthWrite: false, toneMapped: false }),
    detail: new MeshBasicMaterial({ color: 0x8bfff3, transparent: true, opacity: 0.82, depthWrite: false, toneMapped: false }),
    ring: new MeshBasicMaterial({ color: 0x50e8e8, transparent: true, opacity: 0.34, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
  }), []);
  const animatedMaterials = useRef(materials);
  const smile = useMemo(() => new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(-0.085, 2.99, 0.365),
      new Vector3(0, 2.955, 0.385),
      new Vector3(0.085, 2.99, 0.365),
    ]),
    12,
    0.009,
    5,
    false,
  ), []);

  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
    smile.dispose();
  }, [materials, smile]);

  useFrame(({ clock }) => {
    const group = root.current;
    if (!group) return;

    const { progress, motionPaused } = useJourneyStore.getState();
    const visibility = 1 - smoothstep((progress - 0.1) / 0.16);
    group.visible = visibility > 0.001;
    group.position.set(compact ? 2.15 : 4.2, compact ? 10.7 : 3.2, 5.5);
    group.scale.setScalar(compact ? 0.66 : 1.18);

    const time = motionPaused ? 0 : clock.elapsedTime;
    group.position.y += Math.sin(time * 0.72) * 0.055;
    group.rotation.y = Math.sin(time * 0.34) * 0.045;
    if (headOrbit.current) headOrbit.current.rotation.y = time * 0.2;
    if (waistOrbit.current) waistOrbit.current.rotation.z = Math.sin(time * 0.24) * 0.16;
    if (baseRing.current) baseRing.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.035);

    animatedMaterials.current.shell.opacity = 0.13 * visibility;
    animatedMaterials.current.wire.opacity = 0.64 * visibility;
    animatedMaterials.current.hair.opacity = 0.38 * visibility;
    animatedMaterials.current.detail.opacity = 0.82 * visibility;
    animatedMaterials.current.ring.opacity = 0.34 * visibility;
  });

  return (
    <group ref={root} position={[4.2, 3.2, 5.5]} scale={compact ? 0.66 : 1.18} renderOrder={8}>
      {/* A translucent human outline keeps the companion clearly illustrative. */}
      <mesh position={[0, 3.08, 0]} material={materials.shell}>
        <sphereGeometry args={[0.39, 20, 14]} />
      </mesh>
      <mesh position={[0, 3.08, 0]} material={materials.wire}>
        <sphereGeometry args={[0.405, 18, 12]} />
      </mesh>
      <mesh position={[0, 3.19, -0.035]} material={materials.hair}>
        <sphereGeometry args={[0.445, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`lock-${side}`} position={[side * 0.31, 2.74, -0.02]} scale={[0.8, 1.35, 0.75]} material={materials.hair}>
          <capsuleGeometry args={[0.12, 0.42, 4, 8]} />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.135, 3.105, 0.365]} scale={[1, 0.7, 0.55]} material={materials.detail}>
          <sphereGeometry args={[0.035, 10, 8]} />
        </mesh>
      ))}
      <mesh geometry={smile} material={materials.detail} />

      <mesh position={[0, 2.65, 0]} material={materials.shell}>
        <cylinderGeometry args={[0.13, 0.16, 0.3, 12]} />
      </mesh>
      <mesh position={[0, 1.62, 0]} scale={[1, 1.1, 0.8]} material={materials.wire}>
        <capsuleGeometry args={[0.31, 0.78, 5, 12]} />
      </mesh>
      <mesh position={[0, 0.78, 0]} material={materials.shell}>
        <cylinderGeometry args={[0.2, 0.48, 0.96, 18, 1, true]} />
      </mesh>
      <mesh position={[0, 0.78, 0]} material={materials.wire}>
        <cylinderGeometry args={[0.205, 0.485, 0.97, 18, 1, true]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} position={[side * 0.45, 1.68, 0]} rotation={[0, 0, side * -0.32]}>
          <mesh material={materials.wire}>
            <capsuleGeometry args={[0.085, 0.58, 4, 8]} />
          </mesh>
          <mesh position={[side * 0.12, -0.47, 0]} material={materials.detail}>
            <sphereGeometry args={[0.075, 10, 8]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * 0.17, 0.23, 0]} material={materials.wire}>
          <capsuleGeometry args={[0.105, 0.36, 4, 8]} />
        </mesh>
      ))}

      <mesh ref={headOrbit} position={[0, 3.08, 0]} rotation={[Math.PI / 2, 0.3, 0]} material={materials.ring}>
        <torusGeometry args={[0.62, 0.009, 5, 48]} />
      </mesh>
      <mesh ref={waistOrbit} position={[0, 1.45, 0]} rotation={[1.15, 0, 0.4]} material={materials.ring}>
        <torusGeometry args={[0.86, 0.008, 5, 56]} />
      </mesh>
      <mesh ref={baseRing} position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.ring}>
        <torusGeometry args={[0.66, 0.012, 5, 56]} />
      </mesh>
      <mesh position={[0, 0.07, 0]} material={materials.ring}>
        <cylinderGeometry args={[0.48, 0.48, 0.018, 36]} />
      </mesh>
    </group>
  );
}
