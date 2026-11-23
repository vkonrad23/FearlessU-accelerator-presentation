'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  BufferGeometry,
  DodecahedronGeometry,
  Float32BufferAttribute,
  MathUtils,
  MeshBasicMaterial,
  ShaderMaterial,
  TorusGeometry,
} from 'three';
import type { Group } from 'three';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { seededRandom } from '@/lib/scene-math';
import { usePointer } from './usePointer';

const surfaceVertex = `
  varying vec3 vNormal;
  varying vec3 vPoint;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPoint = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const surfaceFragment = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uActivity;
  uniform float uValidation;
  varying vec3 vNormal;
  varying vec3 vPoint;
  void main() {
    vec3 viewDirection = normalize(vec3(0.0, 0.0, 1.0));
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 2.2);
    float scan = pow(max(0.0, sin(vPoint.y * 68.0 + uTime * 0.35)), 15.0);
    float web = 0.5 + 0.5 * sin(vPoint.x * 17.0 + sin(vPoint.z * 15.0 + uTime * 0.12));
    vec3 blue = vec3(0.17, 0.61, 1.0);
    vec3 cyan = vec3(0.36, 0.91, 1.0);
    vec3 violet = vec3(0.57, 0.43, 1.0);
    vec3 color = mix(blue, violet, smoothstep(-0.75, 0.85, vPoint.y + vPoint.x * 0.25));
    color = mix(color, cyan, fresnel * 0.52 + scan * 0.28 + uActivity * web * 0.18);
    color = mix(color, vec3(0.43, 1.0, 0.75), uValidation * 0.8);
    float alpha = (0.12 + fresnel * 0.38 + scan * (0.06 + uActivity * 0.13) + web * 0.04) * uOpacity;
    gl_FragColor = vec4(color * (0.95 + fresnel * 1.4 + uActivity * 0.6), alpha);
    #include <colorspace_fragment>
  }
`;

const networkVertex = `
  attribute float aMode;
  attribute float aPhase;
  uniform float uTime;
  uniform float uActivity;
  uniform float uHypothesis;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vMode;
  void main() {
    vMode = aMode;
    float pulse = 0.62 + 0.38 * sin(uTime * 0.68 + aPhase);
    float state = mix(0.32 + uActivity * 0.6, uHypothesis, aMode);
    vAlpha = pulse * state * uOpacity;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const networkFragment = `
  uniform float uValidation;
  varying float vAlpha;
  varying float vMode;
  void main() {
    vec3 cyan = vec3(0.36, 0.88, 1.0);
    vec3 violet = vec3(0.66, 0.56, 1.0);
    vec3 color = mix(cyan, violet, vMode * 0.72);
    color = mix(color, vec3(0.45, 1.0, 0.76), uValidation * 0.8);
    gl_FragColor = vec4(color, vAlpha * (0.74 + vMode * 0.26));
    #include <colorspace_fragment>
  }
`;

const pointVertex = `
  attribute float aPhase;
  attribute float aSize;
  uniform float uTime;
  uniform float uDpr;
  uniform float uOpacity;
  uniform float uActivity;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p += normalize(position) * sin(uTime * 0.18 + aPhase) * 0.045;
    p.x += sin(uTime * 0.13 + aPhase) * 0.025;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.42 + 0.58 * sin(uTime * 0.65 + aPhase);
    vAlpha = (0.2 + uActivity * 0.38) * twinkle * uOpacity;
    gl_PointSize = clamp(aSize * uDpr * (1.0 + uActivity * 0.25), 1.0, 4.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const pointFragment = `
  uniform float uValidation;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float glow = exp(-radius * radius * 5.0) * (1.0 - smoothstep(0.68, 1.0, radius));
    vec3 color = mix(vec3(0.42, 0.84, 1.0), vec3(0.74, 0.63, 1.0), gl_PointCoord.x);
    color = mix(color, vec3(0.47, 1.0, 0.77), uValidation * 0.8);
    gl_FragColor = vec4(color, glow * vAlpha);
    #include <colorspace_fragment>
  }
`;

function fibonacciSphere(count: number, radius: number) {
  const points: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    points.push([Math.cos(theta) * ring * radius, y * radius, Math.sin(theta) * ring * radius]);
  }
  return points;
}

function makeNetwork() {
  const nodes = fibonacciSphere(44, 1.62);
  const segments: number[] = [];
  const modes: number[] = [];
  const phases: number[] = [];
  for (let from = 0; from < nodes.length; from += 1) {
    const nearest = nodes.map((point, to) => ({ to, distance: from === to ? Infinity : Math.hypot(
      point[0] - nodes[from][0], point[1] - nodes[from][1], point[2] - nodes[from][2],
    ) })).sort((a, b) => a.distance - b.distance).slice(0, 3);
    for (const edge of nearest) {
      if (edge.to < from) continue;
      segments.push(...nodes[from], ...nodes[edge.to]);
      const hypothesis = (from * 7 + edge.to * 3) % 5 === 0 ? 1 : 0;
      modes.push(hypothesis, hypothesis);
      const phase = (from * 13 + edge.to * 5) * 0.27;
      phases.push(phase, phase);
    }
  }
  const lines = new BufferGeometry()
    .setAttribute('position', new Float32BufferAttribute(segments, 3))
    .setAttribute('aMode', new Float32BufferAttribute(modes, 1))
    .setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
  const vertices = new Float32Array(nodes.flat());
  const dots = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3));
  return { lines, dots };
}

function makeParticles() {
  const random = seededRandom(sceneConfig.world.seed + 311);
  const count = sceneConfig.quality.desktop.particles;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 1.78 + random() * 1.05;
    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[index * 3 + 1] = Math.cos(phi) * radius;
    positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    phases[index] = random() * Math.PI * 2;
    sizes[index] = 0.7 + random() * 1.1;
  }
  return new BufferGeometry()
    .setAttribute('position', new Float32BufferAttribute(positions, 3))
    .setAttribute('aPhase', new Float32BufferAttribute(phases, 1))
    .setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
}

export function ResearchCore() {
  const root = useRef<Group>(null);
  const evaluation = useRef<Group>(null);
  const surface = useRef<ShaderMaterial>(null);
  const networkMaterial = useRef<ShaderMaterial>(null);
  const pointMaterial = useRef<ShaderMaterial>(null);
  const shellMaterial = useRef<MeshBasicMaterial>(null);
  const layerMaterials = useRef<MeshBasicMaterial[]>([]);
  const validationMark = useRef<Group>(null);
  const elapsed = useRef(0);
  const evaluationLevelRef = useRef(0);
  const width = useThree((state) => state.size.width);
  const researchMode = useJourneyStore((state) => state.researchMode);
  const validationEvent = useJourneyStore((state) => state.validationEvent);
  const pointer = usePointer();
  const network = useMemo(() => makeNetwork(), []);
  const particles = useMemo(() => makeParticles(), []);
  const surfaceUniforms = useMemo(() => ({
    uTime: { value: 0 }, uOpacity: { value: 0 }, uActivity: { value: 0 }, uValidation: { value: 0 },
  }), []);
  const networkUniforms = useMemo(() => ({
    uTime: { value: 0 }, uActivity: { value: 0 }, uHypothesis: { value: 0 }, uOpacity: { value: 0 }, uValidation: { value: 0 },
  }), []);
  const pointUniforms = useMemo(() => ({
    uTime: { value: 0 }, uDpr: { value: 1 }, uOpacity: { value: 0 }, uActivity: { value: 0 }, uValidation: { value: 0 },
  }), []);
  const layers = useMemo(() => [
    new TorusGeometry(1.95, 0.007, 6, 120),
    new TorusGeometry(1.95, 0.007, 6, 120),
    new TorusGeometry(1.95, 0.007, 6, 120),
  ], []);
  const badge = useMemo(() => new DodecahedronGeometry(0.19, 0), []);

  useEffect(() => () => {
    network.lines.dispose();
    network.dots.dispose();
    particles.dispose();
    layers.forEach((geometry) => geometry.dispose());
    badge.dispose();
  }, [badge, layers, network, particles]);

  useFrame(({ gl }, delta) => {
    if (!root.current) return;
    const coreUniforms = surface.current?.uniforms;
    const linksUniforms = networkMaterial.current?.uniforms;
    const starsUniforms = pointMaterial.current?.uniforms;
    if (!coreUniforms || !linksUniforms || !starsUniforms) return;
    const state = useJourneyStore.getState();
    const moving = !state.motionPaused && !state.reducedMotion && state.visible;
    if (moving) elapsed.current += delta;
    const time = elapsed.current;
    const progress = state.progress;
    const hero = 1 - MathUtils.smoothstep(progress, 0.17, 0.23);
    const research = MathUtils.smoothstep(progress, 0.25, 0.31) * (1 - MathUtils.smoothstep(progress, 0.42, 0.49));
    const visibility = Math.max(hero, research) * (state.visible ? 1 : 0);
    const mobile = width < 768;
    const compact = width < 1100;
    const targetX = mobile ? 0 : compact ? 4.2 : 5.5;
    const targetY = mobile ? 3.9 : 0.18;
    const dt = moving ? Math.min(delta, 0.05) : 0;
    root.current.position.x = MathUtils.damp(root.current.position.x, targetX, 2.2, dt);
    root.current.position.y = MathUtils.damp(root.current.position.y, targetY + Math.sin(time * 0.45) * 0.12, 2, dt);
    const targetScale = mobile ? 0.7 : compact ? 1.3 : 1.8;
    const scale = MathUtils.damp(root.current.scale.x, targetScale, 2.3, dt);
    root.current.scale.setScalar(scale);
    root.current.visible = visibility > 0.006;
    root.current.rotation.y += dt * 0.065;
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, pointer.current.y * 0.045, 2.2, dt);
    root.current.rotation.z = MathUtils.damp(root.current.rotation.z, pointer.current.x * -0.035, 2.2, dt);

    const mode = researchMode;
    const activityTarget = mode === 'idle' ? 0.1 : mode === 'research' ? 0.8 : mode === 'hypothesis' ? 0.72 : mode === 'evaluation' ? 0.68 : 0.85;
    const hypothesisTarget = mode === 'hypothesis' ? 1 : 0;
    const evaluationTarget = mode === 'evaluation' ? 1 : 0;
    const validationTarget = mode === 'validation' && validationEvent ? 1 : 0;
    const opacity = MathUtils.damp(coreUniforms.uOpacity.value, visibility, 2.3, dt);
    const activity = MathUtils.damp(coreUniforms.uActivity.value, activityTarget, 1.6, dt);
    const hypothesis = MathUtils.damp(linksUniforms.uHypothesis.value, hypothesisTarget, 1.8, dt);
    const evaluationLevel = MathUtils.damp(evaluationLevelRef.current, evaluationTarget, 1.8, dt);
    evaluationLevelRef.current = evaluationLevel;
    const validation = MathUtils.damp(coreUniforms.uValidation.value, validationTarget, 1.4, dt);
    coreUniforms.uTime.value = time;
    coreUniforms.uOpacity.value = opacity;
    coreUniforms.uActivity.value = activity;
    coreUniforms.uValidation.value = validation;
    linksUniforms.uTime.value = time;
    linksUniforms.uActivity.value = activity;
    linksUniforms.uHypothesis.value = hypothesis;
    linksUniforms.uOpacity.value = opacity;
    linksUniforms.uValidation.value = validation;
    starsUniforms.uTime.value = time;
    starsUniforms.uDpr.value = gl.getPixelRatio();
    starsUniforms.uOpacity.value = opacity;
    starsUniforms.uActivity.value = activity;
    starsUniforms.uValidation.value = validation;
    if (shellMaterial.current) shellMaterial.current.opacity = opacity * 0.28;
    if (evaluation.current) {
      evaluation.current.scale.setScalar(0.65 + evaluationLevel * 0.35);
      layerMaterials.current.forEach((material, index) => {
        material.opacity = opacity * (0.025 + evaluationLevel * (0.13 + index * 0.035));
      });
      evaluation.current.rotation.z = time * 0.035;
    }
    if (validationMark.current) {
      validationMark.current.visible = Boolean(validationEvent) && mode === 'validation' && visibility > 0.05;
      validationMark.current.rotation.y = time * 0.24;
    }
  });

  return (
    <group ref={root} name="fearlessu-research-core">
      <mesh>
        <icosahedronGeometry args={[1.45, 4]} />
        <shaderMaterial ref={surface} vertexShader={surfaceVertex} fragmentShader={surfaceFragment} uniforms={surfaceUniforms} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh scale={1.04}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshBasicMaterial ref={shellMaterial} color="#9adfff" wireframe transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <lineSegments geometry={network.lines}>
        <shaderMaterial ref={networkMaterial} vertexShader={networkVertex} fragmentShader={networkFragment} uniforms={networkUniforms} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </lineSegments>
      <points geometry={network.dots}>
        <pointsMaterial color="#b9f2ff" size={0.055} sizeAttenuation transparent opacity={0.82} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </points>
      <points geometry={particles} frustumCulled={false}>
        <shaderMaterial ref={pointMaterial} vertexShader={pointVertex} fragmentShader={pointFragment} uniforms={pointUniforms} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </points>
      <group ref={evaluation}>
        {layers.map((geometry, index) => (
          <mesh key={index} geometry={geometry} rotation={[Math.PI * (0.42 + index * 0.13), Math.PI * (index * 0.27), 0]}>
            <meshBasicMaterial ref={(material) => { if (material) layerMaterials.current[index] = material; }} color={index === 1 ? '#ad9cff' : '#83e5ff'} transparent opacity={0.04} depthWrite={false} side={DoubleSide} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={validationMark} position={[0, 1.95, 0]}>
        <mesh geometry={badge}>
          <meshBasicMaterial color="#7df0bd" wireframe transparent opacity={0.86} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.24, 0.012, 6, 40]} />
          <meshBasicMaterial color="#b3ffdc" transparent opacity={0.84} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[2.18, 48, 24]} />
        <meshBasicMaterial color="#6e81ff" transparent opacity={0.012} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
