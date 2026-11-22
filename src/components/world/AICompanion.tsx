import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  LatheGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Vector2,
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
  const scanBeam = useRef<Mesh>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const compact = width < 560 || width / Math.max(height, 1) < 0.78;

  const materials = useMemo(() => ({
    face: new MeshPhysicalMaterial({
      color: '#fff0f2', emissive: '#a72b43', emissiveIntensity: 0.82,
      roughness: 0.48, metalness: 0.04, clearcoat: 0.22,
      transparent: true, opacity: 0.88, depthWrite: false, toneMapped: false,
    }),
    shell: new MeshPhysicalMaterial({
      color: '#e7a3af', emissive: '#762034', emissiveIntensity: 0.26,
      roughness: 0.43, metalness: 0.2, clearcoat: 0.5,
      transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false,
    }),
    wire: new MeshBasicMaterial({ color: '#ff7089', transparent: true, opacity: 0.62, wireframe: true, depthWrite: false, toneMapped: false }),
    hair: new MeshPhysicalMaterial({
      color: '#701a31', emissive: '#bd2444', emissiveIntensity: 0.42,
      roughness: 0.28, metalness: 0.28, clearcoat: 0.72,
      transparent: true, opacity: 0.76, depthWrite: false, toneMapped: false,
    }),
    hairWire: new MeshBasicMaterial({ color: '#ff7990', transparent: true, opacity: 0.38, wireframe: true, depthWrite: false, toneMapped: false }),
    detail: new MeshBasicMaterial({ color: '#ffe9ec', transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }),
    iris: new MeshBasicMaterial({ color: '#ad1538', transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false }),
    pupil: new MeshBasicMaterial({ color: '#390b19', transparent: true, opacity: 0.94, depthWrite: false, toneMapped: false }),
    lips: new MeshBasicMaterial({ color: '#ff8fa1', transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }),
    ring: new MeshBasicMaterial({ color: '#ff526f', transparent: true, opacity: 0.36, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
    scan: new MeshBasicMaterial({ color: '#ffd0d8', transparent: true, opacity: 0.2, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
  }), []);
  const animatedMaterials = useRef(materials);
  const dressGeometry = useMemo(() => new LatheGeometry([
    new Vector2(0.16, 0.02),
    new Vector2(0.22, 0.14),
    new Vector2(0.34, 0.42),
    new Vector2(0.39, 0.68),
    new Vector2(0.28, 0.84),
    new Vector2(0.24, 1.08),
    new Vector2(0.31, 1.3),
    new Vector2(0.4, 1.5),
    new Vector2(0.32, 1.65),
    new Vector2(0.15, 1.76),
  ], 24), []);
  const faceCurves = useMemo(() => ({
    smile: new CatmullRomCurve3([
      new Vector3(-0.075, 2.955, 0.248),
      new Vector3(0, 2.935, 0.267),
      new Vector3(0.075, 2.955, 0.248),
    ]),
    brows: [-1, 1].map((side) => new CatmullRomCurve3([
      new Vector3(side * 0.17, 3.17, 0.247),
      new Vector3(side * 0.12, 3.19, 0.265),
      new Vector3(side * 0.07, 3.18, 0.27),
    ])),
  }), []);

  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
    dressGeometry.dispose();
  }, [dressGeometry, materials]);

  useFrame(({ clock }) => {
    const group = root.current;
    if (!group) return;

    const { progress, motionPaused } = useJourneyStore.getState();
    const visibility = 1 - smoothstep((progress - 0.1) / 0.16);
    group.visible = visibility > 0.001;
    group.position.set(compact ? 2.15 : 4.2, compact ? 10.7 : 3.2, 5.5);
    group.scale.setScalar(compact ? 0.66 : 1.32);

    const time = motionPaused ? 0 : clock.elapsedTime;
    group.position.y += Math.sin(time * 0.72) * 0.055;
    group.rotation.y = Math.sin(time * 0.34) * 0.045;
    if (headOrbit.current) headOrbit.current.rotation.y = time * 0.2;
    if (waistOrbit.current) waistOrbit.current.rotation.z = Math.sin(time * 0.24) * 0.16;
    if (baseRing.current) baseRing.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.035);
    if (scanBeam.current) scanBeam.current.position.y = 0.55 + (Math.sin(time * 0.48) + 1) * 0.68;

    animatedMaterials.current.face.opacity = 0.88 * visibility;
    animatedMaterials.current.shell.opacity = 0.22 * visibility;
    animatedMaterials.current.wire.opacity = 0.62 * visibility;
    animatedMaterials.current.hair.opacity = 0.76 * visibility;
    animatedMaterials.current.hairWire.opacity = 0.38 * visibility;
    animatedMaterials.current.detail.opacity = 0.9 * visibility;
    animatedMaterials.current.iris.opacity = 0.92 * visibility;
    animatedMaterials.current.pupil.opacity = 0.94 * visibility;
    animatedMaterials.current.lips.opacity = 0.9 * visibility;
    animatedMaterials.current.ring.opacity = 0.36 * visibility;
    animatedMaterials.current.scan.opacity = (0.15 + Math.sin(time * 2.2) * 0.035) * visibility;
  });

  return (
    <group ref={root} position={[4.2, 3.2, 5.5]} scale={compact ? 0.66 : 1.32} renderOrder={8}>
      {/* Original calm, human-like projection; red scan lines make it read as a hologram. */}
      <pointLight color="#ff6079" intensity={1.1} distance={4.2} decay={2} position={[0, 2, 0.4]} />
      <mesh position={[0, 3.08, 0.015]} scale={[0.82, 1.12, 0.78]} material={materials.face}>
        <sphereGeometry args={[0.32, 28, 20]} />
      </mesh>
      <mesh position={[0, 3.1, 0.01]} scale={[0.835, 1.13, 0.79]} material={materials.hairWire}>
        <sphereGeometry args={[0.325, 20, 16]} />
      </mesh>

      {/* Long auburn cap and locks give the projection a distinctly feminine silhouette. */}
      <mesh position={[0, 3.19, -0.045]} scale={[1.06, 1.08, 0.94]} material={materials.hair}>
        <sphereGeometry args={[0.405, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
      </mesh>
      <mesh position={[0, 3.37, 0.18]} scale={[1.3, 0.37, 0.72]} material={materials.hair}>
        <sphereGeometry args={[0.22, 18, 12]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`hair-lock-${side}`}>
          <mesh position={[side * 0.285, 2.73, -0.015]} scale={[0.8, 1.48, 0.78]} material={materials.hair}>
            <capsuleGeometry args={[0.105, 0.38, 5, 10]} />
          </mesh>
          <mesh position={[side * 0.3, 2.73, -0.012]} scale={[0.82, 1.48, 0.8]} material={materials.hairWire}>
            <capsuleGeometry args={[0.107, 0.38, 5, 10]} />
          </mesh>
        </group>
      ))}

      {/* Soft eye whites, red irises, brows, nose and lips add a readable face at hero scale. */}
      {[-1, 1].map((side) => (
        <group key={`eye-${side}`}>
          <mesh position={[side * 0.106, 3.105, 0.219]} scale={[1.18, 0.78, 0.72]} material={materials.detail}>
            <sphereGeometry args={[0.052, 14, 10]} />
          </mesh>
          <mesh position={[side * 0.106, 3.105, 0.258]} material={materials.iris}>
            <sphereGeometry args={[0.026, 12, 10]} />
          </mesh>
          <mesh position={[side * 0.106, 3.105, 0.279]} material={materials.pupil}>
            <sphereGeometry args={[0.012, 10, 8]} />
          </mesh>
          <mesh position={[side * 0.17, 3.045, 0.16]} rotation={[0, 0, side * -0.2]} material={materials.face}>
            <sphereGeometry args={[0.035, 12, 10]} />
          </mesh>
        </group>
      ))}
      {faceCurves.brows.map((curve, index) => (
        <mesh key={`brow-${index}`}>
          <tubeGeometry args={[curve, 8, 0.012, 5, false]} />
          <meshBasicMaterial color="#8f2940" transparent opacity={0.82} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 3.035, 0.25]} scale={[0.68, 1.2, 0.7]} material={materials.face}>
        <sphereGeometry args={[0.052, 12, 10]} />
      </mesh>
      <mesh>
        <tubeGeometry args={[faceCurves.smile, 12, 0.009, 5, false]} />
        <meshBasicMaterial color="#bd5166" transparent opacity={0.94} toneMapped={false} />
      </mesh>

      <mesh position={[0, 2.58, 0]} material={materials.face}>
        <cylinderGeometry args={[0.13, 0.15, 0.39, 16]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} geometry={dressGeometry} material={materials.shell} />
      <mesh position={[0, 0.3, 0]} geometry={dressGeometry} material={materials.wire} />

      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} position={[side * 0.42, 1.78, 0]} rotation={[0, 0, side * -0.24]}>
          <mesh material={materials.shell}>
            <capsuleGeometry args={[0.095, 0.5, 5, 10]} />
          </mesh>
          <mesh position={[side * 0.085, -0.42, 0.025]} material={materials.face}>
            <sphereGeometry args={[0.073, 12, 10]} />
          </mesh>
          <mesh material={materials.wire}>
            <capsuleGeometry args={[0.098, 0.51, 5, 10]} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * 0.145, 0.31, 0]} material={materials.wire}>
          <capsuleGeometry args={[0.095, 0.39, 5, 10]} />
        </mesh>
      ))}

      <mesh ref={scanBeam} position={[0, 1.15, 0.48]} material={materials.scan} renderOrder={10}>
        <planeGeometry args={[0.92, 0.014]} />
      </mesh>
      <mesh ref={headOrbit} position={[0, 3.08, 0]} rotation={[Math.PI / 2, 0.3, 0]} material={materials.ring}>
        <torusGeometry args={[0.62, 0.009, 5, 48]} />
      </mesh>
      <mesh ref={waistOrbit} position={[0, 1.5, 0]} rotation={[1.15, 0, 0.4]} material={materials.ring}>
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
