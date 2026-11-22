import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import type { Group, Mesh, Texture } from 'three';
import { smoothstep } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

const HOLOGRAM_HEIGHT = 5.65;
const HOLOGRAM_WIDTH = HOLOGRAM_HEIGHT * (512 / 1184);

export function AICompanion() {
  const root = useRef<Group>(null);
  const scanBeam = useRef<Mesh>(null);
  const imageMaterial = useRef<MeshBasicMaterial>(null);
  const haloMaterial = useRef<MeshBasicMaterial>(null);
  const scanMaterial = useRef<MeshBasicMaterial>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const compact = width < 560 || width / Math.max(height, 1) < 0.78;
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let active = true;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const loadedTexture = new TextureLoader().load(`${basePath}/ai-companion-hologram.webp`, (loaded) => {
      loaded.colorSpace = SRGBColorSpace;
      loaded.generateMipmaps = true;
      if (active) setTexture(loaded);
      else loaded.dispose();
    });
    return () => {
      active = false;
      loadedTexture.dispose();
    };
  }, []);

  useFrame(({ clock }) => {
    const group = root.current;
    if (!group) return;

    const { progress, motionPaused } = useJourneyStore.getState();
    const visibility = 1 - smoothstep((progress - 0.1) / 0.16);
    group.visible = visibility > 0.001 && texture !== null;
    group.position.set(compact ? 2.15 : 4.2, compact ? 10.7 : 3.2, 5.5);
    group.scale.setScalar(compact ? 0.43 : 1);

    const time = motionPaused ? 0 : clock.elapsedTime;
    group.position.y += Math.sin(time * 0.72) * 0.045;
    group.rotation.y = Math.sin(time * 0.34) * 0.035;
    group.rotation.x = Math.sin(time * 0.27) * 0.012;

    if (imageMaterial.current) imageMaterial.current.opacity = visibility;
    if (haloMaterial.current) haloMaterial.current.opacity = 0.1 * visibility;
    if (scanBeam.current) {
      scanBeam.current.position.y = 0.14 + (Math.sin(time * 0.42) + 1) * (HOLOGRAM_HEIGHT * 0.47);
    }
    if (scanMaterial.current) {
      scanMaterial.current.opacity = (0.11 + Math.sin(time * 2) * 0.025) * visibility;
    }
  });

  return (
    <group ref={root} position={[4.2, 3.2, 5.5]} renderOrder={8}>
      <mesh position={[0, HOLOGRAM_HEIGHT / 2, -0.025]} scale={[1.035, 1.012, 1]} renderOrder={8}>
        <planeGeometry args={[HOLOGRAM_WIDTH, HOLOGRAM_HEIGHT]} />
        <meshBasicMaterial
          ref={haloMaterial}
          map={texture}
          color="#77caff"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, HOLOGRAM_HEIGHT / 2, 0]} renderOrder={9}>
        <planeGeometry args={[HOLOGRAM_WIDTH, HOLOGRAM_HEIGHT]} />
        <meshBasicMaterial
          ref={imageMaterial}
          map={texture}
          transparent
          opacity={1}
          alphaTest={0.012}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={scanBeam}
        position={[0, 0.14, 0.035]}
        renderOrder={10}
      >
        <planeGeometry args={[HOLOGRAM_WIDTH * 0.96, 0.012]} />
        <meshBasicMaterial
          ref={scanMaterial}
          color="#bcecff"
          transparent
          opacity={0.11}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
