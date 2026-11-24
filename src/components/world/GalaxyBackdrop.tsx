'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, ShaderMaterial } from 'three';
import type { Group, Points } from 'three';
import { sceneConfig } from '@/config/scene';
import { seededRandom } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

const vertexShader = `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uDpr;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.z += sin(uTime * 0.055 + aPhase) * 0.07;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    float distance = max(1.0, -viewPosition.z);
    float twinkle = 0.72 + 0.28 * sin(uTime * 0.35 + aPhase);
    vColor = aColor;
    vAlpha = twinkle * (1.0 - smoothstep(52.0, 70.0, distance));
    gl_PointSize = clamp(aSize * uDpr * 30.0 / distance, 1.0, 4.2);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float glow = exp(-radius * radius * 4.6) * (1.0 - smoothstep(0.65, 1.0, radius));
    gl_FragColor = vec4(vColor * (0.74 + glow * 0.56), glow * vAlpha * 0.68);
    #include <colorspace_fragment>
  }
`;

function makeGalaxy() {
  const count = sceneConfig.quality.desktop.particles;
  const random = seededRandom(sceneConfig.world.seed + 907);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const inner = [0.54, 0.84, 1];
  const blue = [0.22, 0.48, 1];
  const violet = [0.58, 0.42, 1];

  for (let index = 0; index < count; index += 1) {
    const arm = index % 5;
    const radius = Math.pow(random(), 0.66) * 14.5;
    const angle = arm * (Math.PI * 2 / 5) + radius * 0.23 + (random() - 0.5) * (0.24 + radius * 0.008);
    const spread = 0.16 + radius * 0.035;
    const x = Math.cos(angle) * radius + (random() - 0.5) * spread;
    const y = Math.sin(angle) * radius * 0.43 + (random() - 0.5) * spread;
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = (random() - 0.5) * (0.3 + radius * 0.045);

    const blend = Math.min(1, radius / 14.5);
    const source = blend < 0.45 ? inner : blue;
    const target = blend < 0.45 ? blue : violet;
    const mix = blend < 0.45 ? blend / 0.45 : (blend - 0.45) / 0.55;
    for (let channel = 0; channel < 3; channel += 1) {
      colors[index * 3 + channel] = source[channel] * (1 - mix) + target[channel] * mix;
    }
    sizes[index] = 0.7 + random() * 1.6 + (1 - blend) * 1.1;
    phases[index] = random() * Math.PI * 2;
  }

  return new BufferGeometry()
    .setAttribute('position', new Float32BufferAttribute(positions, 3))
    .setAttribute('aColor', new Float32BufferAttribute(colors, 3))
    .setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
    .setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
}

export function GalaxyBackdrop() {
  const points = useRef<Points>(null);
  const material = useRef<ShaderMaterial>(null);
  const group = useRef<Group>(null);
  const quality = useJourneyStore((state) => state.quality);
  const geometry = useMemo(() => makeGalaxy(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDpr: { value: 1 } }), []);

  useEffect(() => {
    geometry.setDrawRange(0, sceneConfig.quality[quality].particles);
  }, [geometry, quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ gl }, delta) => {
    const state = useJourneyStore.getState();
    if (!state.motionPaused && !state.reducedMotion && state.visible) {
      if (material.current) material.current.uniforms.uTime.value += Math.min(delta, 0.05);
      if (group.current) group.current.rotation.z += Math.min(delta, 0.05) * 0.0025;
    }
    if (material.current) material.current.uniforms.uDpr.value = gl.getPixelRatio();
    if (points.current) points.current.visible = state.visible;
  });

  return (
    <group ref={group} position={[4.3, 1.35, -25]} rotation={[0.16, -0.08, -0.16]}>
      <points ref={points} geometry={geometry} frustumCulled={false}>
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </points>
      <mesh position={[0, 0, -0.55]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshBasicMaterial color="#6388ff" transparent opacity={0.045} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
