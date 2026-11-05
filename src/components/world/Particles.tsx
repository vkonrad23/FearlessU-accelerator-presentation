import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, ShaderMaterial } from 'three';
import { sceneConfig } from '@/config/scene';
import { ambientDelta, seededRandom } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

const vertexShader = `
  attribute float aPhase;
  attribute float aScale;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aPhase) * 0.65;
    p.y += sin(uTime * 0.24 + aPhase * 1.7) * 1.2;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    float distanceToCamera = -viewPosition.z;
    vAlpha = smoothstep(1.0, 10.0, distanceToCamera) * (1.0 - smoothstep(75.0, 160.0, distanceToCamera));
    gl_PointSize = clamp(aScale * uSize * uDpr * 32.0 / max(8.0, distanceToCamera), 1.0, 6.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = exp(-radius * radius * 4.0) * (1.0 - smoothstep(0.6, 1.0, radius));
    gl_FragColor = vec4(uColor, alpha * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function Particles() {
  const quality = useJourneyStore((state) => state.quality);
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const random = seededRandom(sceneConfig.world.seed + 17);
    const count = sceneConfig.quality.desktop.particles;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      for (let axis = 0; axis < 3; axis += 1) {
        positions[i * 3 + axis] = (random() - 0.5) * sceneConfig.particles.bounds[axis] + sceneConfig.particles.origin[axis];
      }
      phases[i] = random() * Math.PI * 2;
      scales[i] = 0.6 + random() * 0.8;
    }
    return new BufferGeometry()
      .setAttribute('position', new Float32BufferAttribute(positions, 3))
      .setAttribute('aPhase', new Float32BufferAttribute(phases, 1))
      .setAttribute('aScale', new Float32BufferAttribute(scales, 1));
  }, []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color(sceneConfig.colors.gold).multiplyScalar(1.4) },
    uSize: { value: sceneConfig.particles.size },
    uDpr: { value: 1 },
    uOpacity: { value: sceneConfig.particles.opacity },
  }), []);
  useEffect(() => { geometry.setDrawRange(0, sceneConfig.quality[quality].particles); }, [geometry, quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ gl }, delta) => {
    if (!material.current) return;
    const { progress, motionPaused, visible } = useJourneyStore.getState();
    material.current.uniforms.uTime.value += ambientDelta(delta, progress, motionPaused, visible) * sceneConfig.particles.drift;
    material.current.uniforms.uDpr.value = gl.getPixelRatio();
  });
  return (
    <points geometry={geometry} renderOrder={10} frustumCulled={false}>
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </points>
  );
}
