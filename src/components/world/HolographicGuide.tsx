'use client';

import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, DoubleSide, MathUtils, SRGBColorSpace, ShaderMaterial, TextureLoader } from 'three';
import type { Group, Texture } from 'three';
import { useJourneyStore } from '@/store/journey';
import { usePointer } from './usePointer';

const GUIDE_WIDTH = 3.4;
const GUIDE_HEIGHT = GUIDE_WIDTH * 1184 / 512;

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(uv.y * 9.0 + uTime * 0.38) * 0.012;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    uv.x += sin(vUv.y * 10.0 + uTime * 0.32) * 0.0007;
    vec4 image = texture2D(uMap, uv);
    if (image.a < 0.008) discard;
    float scan = pow(max(0.0, sin(vUv.y * 850.0 - uTime * 1.8)), 22.0);
    float sweep = exp(-pow((vUv.y - fract(uTime * 0.045)) * 75.0, 2.0));
    float right = texture2D(uMap, uv + vec2(0.0025, 0.0)).a;
    float left = texture2D(uMap, uv - vec2(0.0025, 0.0)).a;
    float up = texture2D(uMap, uv + vec2(0.0, 0.002)).a;
    float down = texture2D(uMap, uv - vec2(0.0, 0.002)).a;
    float edge = max(max(image.a - right, image.a - left), max(image.a - up, image.a - down));
    vec3 color = image.rgb * vec3(0.82, 0.92, 1.12);
    color = mix(color, vec3(0.28, 0.77, 1.0), scan * 0.3);
    color += vec3(0.12, 0.43, 1.0) * sweep * 0.24;
    color += vec3(0.24, 0.65, 1.0) * edge * 0.52;
    float alpha = image.a * uOpacity * (0.82 + scan * 0.16 + sweep * 0.12) + edge * uOpacity * 0.24;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

export function HolographicGuide() {
  const root = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const width = useThree((state) => state.size.width);
  const mobile = width < 768;
  const compact = width < 1100;
  const targetX = mobile ? 0.75 : compact ? 4.9 : 7.3;
  const targetY = mobile ? 4.4 : 0;
  const targetScale = mobile ? 0.36 : compact ? 0.77 : 1.05;
  const initialPosition = useMemo(() => [targetX, targetY, -1.6] as [number, number, number], [targetX, targetY]);
  const pointer = usePointer();
  const loadedTexture = useLoader(TextureLoader, '/ai-companion-hologram.webp') as Texture;
  const texture = useMemo(() => {
    const hologram = loadedTexture.clone();
    hologram.colorSpace = SRGBColorSpace;
    hologram.anisotropy = 4;
    hologram.needsUpdate = true;
    return hologram;
  }, [loadedTexture]);
  const uniforms = useMemo(() => ({ uMap: { value: texture }, uTime: { value: 0 }, uOpacity: { value: 0 } }), [texture]);
  const elapsed = useRef(0);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    if (!root.current || !material.current) return;
    const state = useJourneyStore.getState();
    const heroVisibility = 1 - MathUtils.smoothstep(state.progress, 0.17, 0.27);
    const visible = heroVisibility * (state.visible ? 1 : 0);
    const moving = !state.motionPaused && !state.reducedMotion && state.visible;
    if (moving) elapsed.current += Math.min(delta, 0.05);
    const dt = moving ? Math.min(delta, 0.05) : 0;
    root.current.visible = visible > 0.005;
    root.current.position.x = MathUtils.damp(root.current.position.x, targetX + pointer.current.x * 0.1, 2.1, dt);
    root.current.position.y = MathUtils.damp(root.current.position.y, targetY + Math.sin(elapsed.current * 0.58) * (mobile ? 0.035 : 0.065), 2.1, dt);
    root.current.scale.setScalar(MathUtils.damp(root.current.scale.x, targetScale, 2, dt));
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, pointer.current.x * -0.045 + Math.sin(elapsed.current * 0.28) * 0.015, 2.2, dt);
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, pointer.current.y * 0.018, 2.2, dt);
    material.current.uniforms.uTime.value = elapsed.current;
    material.current.uniforms.uOpacity.value = MathUtils.damp(material.current.uniforms.uOpacity.value, visible, 2.2, dt);
  });

  return (
    <group ref={root} position={initialPosition} scale={targetScale}>
      <mesh position={[0, 0, -0.055]} scale={1.035}>
        <planeGeometry args={[GUIDE_WIDTH, GUIDE_HEIGHT]} />
        <meshBasicMaterial map={texture} color="#4f9fff" transparent opacity={0.12} depthWrite={false} side={DoubleSide} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[GUIDE_WIDTH, GUIDE_HEIGHT, 16, 30]} />
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} side={DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}
