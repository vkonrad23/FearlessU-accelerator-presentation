import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, Color, Group, ShaderMaterial, Vector3 } from 'three';
import { useMemo, useRef } from 'react';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { ambientDelta, safetyEnvelope } from '@/lib/scene-math';

const vertexShader = `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`;

const skyFragment = `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform float uTime;
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.,0.)), f.x),
      mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    for(int i = 0; i < 4; i++) { value += amplitude * noise(p); p = p * 2.03 + 13.4; amplitude *= 0.5; }
    return value;
  }
  void main() {
    vec3 direction = normalize(vWorld - cameraPosition);
    float horizon = 1.0 - smoothstep(-0.12, 0.62, direction.y);
    float distanceToSun = distance(direction, normalize(uSun - cameraPosition));
    float glow = exp(-distanceToSun * 3.8);
    vec3 color = mix(uTop, uHorizon, horizon * (0.58 + glow * 0.40));
    color += vec3(0.52,0.30,0.10) * pow(glow, 2.0);
    vec2 cloudUV = direction.xz / max(0.12, direction.y + 0.26);
    float cloud = fbm(cloudUV * 2.6 + vec2(uTime, uTime * 0.23));
    cloud = smoothstep(0.44, 0.72, cloud) * smoothstep(-0.05, 0.25, direction.y);
    color = mix(color, mix(uTop * 0.7, uHorizon, glow * 0.68), cloud * 0.37);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const glowFragment = `
  varying vec2 vUv;
  uniform vec3 uColor;
  void main() {
    float radius = length(vUv - 0.5) * 2.0;
    float halo = exp(-radius * radius * 5.5) * (1.0 - smoothstep(0.65, 1.0, radius));
    gl_FragColor = vec4(uColor, halo * 0.3);
  }
`;

const sunFragment = `
  varying vec2 vUv;
  uniform vec3 uColor;
  void main() {
    float radius = length(vUv - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.72, 1.0, radius);
    gl_FragColor = vec4(uColor * 2.1, core);
    #include <colorspace_fragment>
  }
`;

export function Sky() {
  const material = useRef<ShaderMaterial>(null);
  const sun = useRef<Group>(null);
  const [warmHorizon, coolHorizon] = useMemo(() => [
    new Color(sceneConfig.colors.skyHorizon), new Color(sceneConfig.colors.skyCoolHorizon),
  ], []);
  const uniforms = useMemo(() => ({
    uTop: { value: new Color(sceneConfig.colors.skyTop) },
    uHorizon: { value: new Color(sceneConfig.colors.skyHorizon) },
    uSun: { value: new Vector3(...sceneConfig.world.sunPosition) },
    uTime: { value: 0 },
  }), []);
  const glowUniforms = useMemo(() => ({ uColor: { value: new Color(sceneConfig.colors.gold) } }), []);
  const sunUniforms = useMemo(() => ({ uColor: { value: new Color(sceneConfig.colors.sun) } }), []);

  useFrame(({ camera }, delta) => {
    const { progress, motionPaused, visible } = useJourneyStore.getState();
    if (material.current) {
      material.current.uniforms.uTime.value += ambientDelta(delta, progress, motionPaused, visible) * sceneConfig.world.cloudSpeed;
      material.current.uniforms.uHorizon.value.copy(warmHorizon).lerp(coolHorizon, safetyEnvelope(progress) * 0.8);
    }
    sun.current?.quaternion.copy(camera.quaternion);
  });

  return (
    <>
      <mesh renderOrder={-100}>
        <sphereGeometry args={[320, 40, 24]} />
        <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={skyFragment} uniforms={uniforms} side={BackSide} depthWrite={false} />
      </mesh>
      <group ref={sun} position={[...sceneConfig.world.sunPosition]}>
        <mesh>
          <planeGeometry args={[sceneConfig.world.sunRadius * 2, sceneConfig.world.sunRadius * 2]} />
          <shaderMaterial vertexShader={vertexShader} fragmentShader={sunFragment} uniforms={sunUniforms} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 1]}>
          <planeGeometry args={[sceneConfig.world.sunHaloSize, sceneConfig.world.sunHaloSize]} />
          <shaderMaterial vertexShader={vertexShader} fragmentShader={glowFragment} uniforms={glowUniforms} transparent depthWrite={false} blending={AdditiveBlending} />
        </mesh>
      </group>
    </>
  );
}
