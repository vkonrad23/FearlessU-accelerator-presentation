import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  DoubleSide,
  LatheGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Vector2,
  Vector3,
} from 'three';
import type { Group, Mesh } from 'three';
import { smoothstep } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

const MODEL_HEIGHT = 5.65;

export function AICompanion() {
  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const skirt = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const eyes = useRef<Group[]>([]);
  const scanBeam = useRef<Mesh>(null);
  const baseRing = useRef<Mesh>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const compact = width < 560 || width / Math.max(height, 1) < 0.78;

  const materials = useMemo(() => ({
    skin: new MeshPhysicalMaterial({
      color: '#c3eaff', emissive: '#5ba0f3', emissiveIntensity: 1.45,
      roughness: 0.38, metalness: 0.08, clearcoat: 0.28,
      transparent: true, opacity: 0.84, depthWrite: false, toneMapped: false,
    }),
    dress: new MeshPhysicalMaterial({
      color: '#88d4ff', emissive: '#2677c9', emissiveIntensity: 0.7,
      roughness: 0.28, metalness: 0.18, clearcoat: 0.55,
      transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide, toneMapped: false,
    }),
    dressWire: new MeshBasicMaterial({
      color: '#9beaff', transparent: true, opacity: 0.1,
      wireframe: true, depthWrite: false, polygonOffset: true,
      polygonOffsetFactor: -1, polygonOffsetUnits: -1, toneMapped: false,
    }),
    hair: new MeshPhysicalMaterial({
      color: '#536fd3', emissive: '#4c72e8', emissiveIntensity: 0.72,
      roughness: 0.24, metalness: 0.18, clearcoat: 0.72,
      transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false,
    }),
    eye: new MeshBasicMaterial({ color: '#e8fbff', transparent: true, opacity: 0.98, depthWrite: false, toneMapped: false }),
    iris: new MeshBasicMaterial({ color: '#42c9ff', transparent: true, opacity: 0.98, depthWrite: false, toneMapped: false }),
    pupil: new MeshBasicMaterial({ color: '#133a77', transparent: true, opacity: 0.98, depthWrite: false, toneMapped: false }),
    mouth: new MeshBasicMaterial({ color: '#f0a5d9', transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false }),
    accent: new MeshBasicMaterial({ color: '#8ce6ff', transparent: true, opacity: 0.38, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
    scan: new MeshBasicMaterial({ color: '#d5f8ff', transparent: true, opacity: 0.19, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
    projector: new MeshPhysicalMaterial({
      color: '#132e57', emissive: '#123e80', emissiveIntensity: 0.42,
      roughness: 0.3, metalness: 0.74, clearcoat: 0.7,
      transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false,
    }),
  }), []);
  const animatedMaterials = useRef(materials);

  const torsoGeometry = useMemo(() => new LatheGeometry([
    new Vector2(0.27, 0.02),
    new Vector2(0.3, 0.2),
    new Vector2(0.31, 0.43),
    new Vector2(0.38, 0.72),
    new Vector2(0.36, 0.98),
    new Vector2(0.25, 1.22),
    new Vector2(0.14, 1.38),
  ], 36), []);
  const dressGeometry = useMemo(() => new LatheGeometry([
    new Vector2(0.68, -3.06),
    new Vector2(0.72, -2.82),
    new Vector2(0.66, -2.48),
    new Vector2(0.56, -2.05),
    new Vector2(0.46, -1.58),
    new Vector2(0.37, -1.12),
    new Vector2(0.31, -0.62),
    new Vector2(0.28, -0.12),
    new Vector2(0.34, 0.17),
    new Vector2(0.4, 0.5),
    new Vector2(0.39, 0.78),
    new Vector2(0.34, 1.06),
    new Vector2(0.23, 1.3),
    new Vector2(0.14, 1.42),
  ], 24), []);
  const faceCurves = useMemo(() => ({
    smile: new CatmullRomCurve3([
      new Vector3(-0.062, -0.17, 0.231),
      new Vector3(0, -0.188, 0.247),
      new Vector3(0.062, -0.17, 0.231),
    ]),
    brows: [-1, 1].map((side) => new CatmullRomCurve3([
      new Vector3(side * 0.17, 0.105, 0.194),
      new Vector3(side * 0.115, 0.128, 0.22),
      new Vector3(side * 0.06, 0.115, 0.22),
    ])),
    hairLocks: [-1, 1].map((side) => new CatmullRomCurve3([
      new Vector3(side * 0.16, 0.28, 0.045),
      new Vector3(side * 0.255, 0.16, 0.11),
      new Vector3(side * 0.25, -0.04, 0.12),
      new Vector3(side * 0.3, -0.27, 0.04),
      new Vector3(side * 0.38, -0.48, -0.035),
    ])),
    backLocks: [-1, 1].map((side) => new CatmullRomCurve3([
      new Vector3(side * 0.2, 0.27, -0.07),
      new Vector3(side * 0.34, 0.09, -0.08),
      new Vector3(side * 0.32, -0.17, -0.11),
      new Vector3(side * 0.4, -0.43, -0.12),
    ])),
    bangs: new CatmullRomCurve3([
      new Vector3(-0.2, 0.2, 0.1),
      new Vector3(-0.12, 0.29, 0.2),
      new Vector3(0.02, 0.25, 0.24),
      new Vector3(0.17, 0.18, 0.13),
    ]),
  }), []);

  useEffect(() => () => {
    Object.values(materials).forEach((material) => material.dispose());
    torsoGeometry.dispose();
    dressGeometry.dispose();
  }, [dressGeometry, materials, torsoGeometry]);

  useFrame(({ clock }) => {
    const group = root.current;
    if (!group) return;

    const { progress, motionPaused } = useJourneyStore.getState();
    const visibility = 1 - smoothstep((progress - 0.1) / 0.16);
    group.visible = visibility > 0.001;
    group.position.set(compact ? 2.15 : 5.6, compact ? 10.7 : 3.2, 5.5);
    group.scale.setScalar(compact ? 0.43 : 1.25);

    const time = motionPaused ? 0 : clock.elapsedTime;
    const breath = motionPaused ? 0 : Math.sin(time * 1.15);
    group.position.y += Math.sin(time * 0.72) * 0.045;
    group.rotation.y = Math.sin(time * 0.34) * 0.035;
    group.rotation.x = Math.sin(time * 0.27) * 0.012;

    if (torso.current) torso.current.scale.set(1 + breath * 0.004, 1 + breath * 0.002, 1 + breath * 0.006);
    if (head.current) {
      head.current.rotation.y = Math.sin(time * 0.42) * 0.055;
      head.current.rotation.z = Math.sin(time * 0.31) * 0.018;
      head.current.rotation.x = Math.sin(time * 0.25) * 0.012;
    }
    if (leftArm.current) leftArm.current.rotation.z = -0.035 + Math.sin(time * 0.48) * 0.012;
    if (rightArm.current) rightArm.current.rotation.z = 0.035 - Math.sin(time * 0.48) * 0.012;
    if (leftLeg.current) leftLeg.current.rotation.z = -0.018 + Math.sin(time * 0.5) * 0.008;
    if (rightLeg.current) rightLeg.current.rotation.z = 0.018 - Math.sin(time * 0.5) * 0.008;
    if (skirt.current) skirt.current.rotation.z = Math.sin(time * 0.46) * 0.014;

    const blinkPhase = time % 5.4;
    const blink = Math.max(0, 1 - Math.abs(blinkPhase - 2.7) / 0.11);
    eyes.current.forEach((eye) => {
      eye.scale.y = 1 - blink * 0.92;
      eye.rotation.y = Math.sin(time * 0.42) * 0.025;
    });
    if (baseRing.current) baseRing.current.scale.setScalar(1 + Math.sin(time * 1.4) * 0.025);
    if (scanBeam.current) scanBeam.current.position.y = 0.18 + (Math.sin(time * 0.42) + 1) * (MODEL_HEIGHT * 0.46);

    const animated = animatedMaterials.current;
    animated.skin.opacity = 0.94 * visibility;
    animated.dress.opacity = 0.17 * visibility;
    animated.dressWire.opacity = 0.1 * visibility;
    animated.hair.opacity = 0.92 * visibility;
    animated.eye.opacity = 0.98 * visibility;
    animated.iris.opacity = 0.98 * visibility;
    animated.pupil.opacity = 0.98 * visibility;
    animated.mouth.opacity = 0.92 * visibility;
    animated.accent.opacity = 0.38 * visibility;
    animated.scan.opacity = (0.17 + Math.sin(time * 2) * 0.025) * visibility;
    animated.projector.opacity = 0.92 * visibility;
  });

  return (
    <group ref={root} position={[4.2, 3.2, 5.5]} renderOrder={8}>
      <pointLight color="#65bfff" intensity={0.7} distance={5} decay={2} position={[0, 2.8, 0.35]} />

      <group ref={torso}>
        <mesh position={[0, 3.15, 0]} geometry={torsoGeometry} material={materials.skin} />
        <mesh position={[0, 4.67, 0]} scale={[0.13, 0.23, 0.12]} material={materials.skin}>
          <sphereGeometry args={[1, 18, 14]} />
        </mesh>
      </group>

      <group ref={skirt} position={[0, 3.15, 0]}>
        <mesh geometry={dressGeometry} material={materials.dress} />
        <mesh position={[0, 0, 0.01]} geometry={dressGeometry} material={materials.dressWire} renderOrder={5} />
      </group>

      {[-1, 1].map((side, index) => (
        <group key={`leg-${side}`} ref={index === 0 ? leftLeg : rightLeg} position={[side * 0.145, 3.12, 0]}>
          <mesh position={[0, -1.46, -0.015]} material={materials.skin}>
            <capsuleGeometry args={[0.09, 2.55, 4, 12]} />
          </mesh>
          <mesh position={[0, -2.91, 0.105]} scale={[1.05, 0.52, 1.62]} material={materials.hair}>
            <sphereGeometry args={[0.12, 14, 10]} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side, index) => (
        <group key={`arm-${side}`} ref={index === 0 ? leftArm : rightArm} position={[side * 0.36, 4.38, 0.1]}>
          <mesh position={[0, -0.32, 0]} rotation={[0, 0, side * 0.08]} material={materials.skin}>
            <capsuleGeometry args={[0.105, 0.5, 4, 12]} />
          </mesh>
          <mesh position={[0, -0.68, 0.005]} material={materials.skin}>
            <sphereGeometry args={[0.105, 14, 12]} />
          </mesh>
          <group position={[-side * 0.15, -0.66, 0.28]} rotation={[0, 0, -side * 0.44]}>
            <mesh position={[0, -0.27, 0]} material={materials.skin}>
              <capsuleGeometry args={[0.082, 0.48, 4, 10]} />
            </mesh>
            <group position={[0, -0.54, 0.24]}>
              <mesh scale={[0.105, 0.14, 0.07]} material={materials.skin}>
                <sphereGeometry args={[1, 14, 10]} />
              </mesh>
              {[-2, -1, 0, 1, 2].map((finger) => (
                <mesh key={`finger-${finger}`} position={[finger * 0.027, -0.12, 0.008]} rotation={[0, 0, -finger * 0.055]} material={materials.skin}>
                  <capsuleGeometry args={[0.016, 0.075, 3, 7]} />
                </mesh>
              ))}
              <mesh position={[-side * 0.09, -0.035, 0.035]} rotation={[0, 0, side * 0.68]} material={materials.skin}>
                <capsuleGeometry args={[0.018, 0.075, 3, 7]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      <group ref={head} position={[0, 5.03, 0]}>
        <mesh scale={[0.86, 1.13, 0.9]} material={materials.skin}>
          <sphereGeometry args={[0.29, 28, 22]} />
        </mesh>
        <mesh position={[0, 0.12, -0.025]} scale={[1.07, 0.92, 0.96]} material={materials.hair}>
          <sphereGeometry args={[0.315, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
        </mesh>
        <mesh position={[0, 0.29, -0.06]} scale={[0.62, 0.34, 0.58]} material={materials.hair}>
          <sphereGeometry args={[0.25, 18, 12]} />
        </mesh>
        {faceCurves.hairLocks.map((curve, index) => (
          <mesh key={`front-lock-${index}`}>
            <tubeGeometry args={[curve, 28, 0.052, 8, false]} />
            <primitive object={materials.hair} attach="material" />
          </mesh>
        ))}
        {faceCurves.backLocks.map((curve, index) => (
          <mesh key={`back-lock-${index}`}>
            <tubeGeometry args={[curve, 28, 0.07, 8, false]} />
            <primitive object={materials.hair} attach="material" />
          </mesh>
        ))}
        <mesh>
          <tubeGeometry args={[faceCurves.bangs, 20, 0.042, 8, false]} />
          <primitive object={materials.hair} attach="material" />
        </mesh>

        {[-1, 1].map((side, index) => (
          <group key={`eye-${side}`} ref={(group) => { if (group) eyes.current[index] = group; }} position={[side * 0.092, 0.025, 0.204]}>
            <mesh scale={[1.4, 0.64, 0.5]} material={materials.eye}>
              <sphereGeometry args={[0.055, 14, 10]} />
            </mesh>
            <mesh position={[0, 0, 0.032]} material={materials.iris}>
              <sphereGeometry args={[0.027, 12, 10]} />
            </mesh>
            <mesh position={[0, 0, 0.052]} material={materials.pupil}>
              <sphereGeometry args={[0.013, 10, 8]} />
            </mesh>
          </group>
        ))}
        {faceCurves.brows.map((curve, index) => (
          <mesh key={`brow-${index}`}>
            <tubeGeometry args={[curve, 10, 0.012, 5, false]} />
            <primitive object={materials.hair} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, -0.065, 0.235]} scale={[0.72, 1.45, 1]} material={materials.skin}>
          <sphereGeometry args={[0.033, 12, 10]} />
        </mesh>
        <mesh>
          <tubeGeometry args={[faceCurves.smile, 12, 0.009, 6, false]} />
          <primitive object={materials.mouth} attach="material" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={`ear-${side}`} position={[side * 0.245, -0.02, 0]} scale={[0.42, 0.72, 0.48]} material={materials.skin}>
            <sphereGeometry args={[0.075, 12, 10]} />
          </mesh>
        ))}
      </group>

      <mesh ref={scanBeam} position={[0, 0.18, 0.62]} material={materials.scan} renderOrder={10}>
        <planeGeometry args={[1.55, 0.014]} />
      </mesh>
      <mesh ref={baseRing} position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.accent}>
        <torusGeometry args={[0.84, 0.018, 5, 56]} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.accent}>
        <torusGeometry args={[0.61, 0.009, 5, 56]} />
      </mesh>
      <mesh position={[0, 0.065, 0]} material={materials.projector}>
        <cylinderGeometry args={[0.7, 0.74, 0.1, 40]} />
      </mesh>
      <mesh position={[0, 2.05, -0.02]} rotation={[Math.PI / 2, 0, 0]} material={materials.accent}>
        <torusGeometry args={[0.54, 0.008, 4, 48]} />
      </mesh>
      <mesh position={[0, 5.04, -0.3]} material={materials.accent}>
        <torusGeometry args={[0.39, 0.007, 4, 48]} />
      </mesh>
    </group>
  );
}
