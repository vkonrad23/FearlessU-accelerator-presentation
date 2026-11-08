import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { MathUtils, Mesh, PerspectiveCamera, ShaderMaterial, SRGBColorSpace, Vector2, Vector3, Vector4 } from 'three';
import { sceneConfig } from '@/config/scene';
import { ambientDelta, artworkOpacity } from '@/lib/scene-math';
import { artworkCover } from '@/lib/artwork-math';
import { useJourneyStore } from '@/store/journey';
import { usePointer } from './usePointer';

const vertexShader = `
  varying vec2 vUv;
  uniform vec2 uPointer;
  uniform vec2 uCover;
  uniform vec2 uOffset;
  uniform vec4 uSubject;
  uniform sampler2D uImage;
  uniform float uDepth;
  uniform float uTime;
  void main() {
    vUv = uv * uCover + uOffset;
    vec3 transformed = position;
    float foreground = pow(1.0 - vUv.y, 2.35);
    float subject = 1.0 - smoothstep(0.72, 1.0, length((vUv - uSubject.xy) / uSubject.zw));
    float depth = mix(foreground, 0.42, subject);
    // Color-key the red fabric inside its source-image bounds so the man stays rigid.
    vec3 fabricColor = texture2D(uImage, vUv).rgb;
    float capeRed = min(fabricColor.r - fabricColor.g, fabricColor.r - fabricColor.b);
    float capeHue = 1.0 - smoothstep(0.0, 0.018, max(fabricColor.g - fabricColor.b, 0.0));
    float capePigment = smoothstep(0.02, 0.1, capeRed) * capeHue;
    float capeBounds = smoothstep(0.38, 0.4, vUv.x)
      * (1.0 - smoothstep(0.48, 0.5, vUv.x))
      * smoothstep(0.66, 0.68, vUv.y)
      * (1.0 - smoothstep(0.77, 0.8, vUv.y));
    float capeRegion = capeBounds * capePigment;
    float capeTrail = capeRegion
      * smoothstep(0.65, 0.67, vUv.y)
      * (1.0 - smoothstep(0.71, 0.74, vUv.y));
    // Keep the cape attached at the shoulder; let the outer tail carry the wind.
    float trailingEdge = 1.0 - smoothstep(0.39, 0.46, vUv.x);
    float clothWeight = trailingEdge * trailingEdge;
    float windWave = sin(uTime * 0.92 - trailingEdge * 5.6 + (vUv.y - 0.72) * 10.5);
    float foldWave = sin(uTime * 1.38 - trailingEdge * 10.2 + (vUv.y - 0.72) * 18.0);
    float flutter = sin(uTime * 2.05 - trailingEdge * 15.0 + vUv.y * 27.0);
    float gust = 0.76 + 0.15 * sin(uTime * 0.29 + 0.7) + 0.09 * sin(uTime * 0.47 + 2.1);
    float billow = capeRegion * clothWeight * gust * (windWave * 0.016 + foldWave * 0.0035 + flutter * 0.0015);
    float hemLift = capeTrail * clothWeight * gust * (0.006 + trailingEdge * 0.01) * (0.5 + 0.5 * windWave);
    transformed.x -= billow * (0.35 + trailingEdge * 0.65);
    transformed.y += billow * 0.62 + hemLift;
    transformed.z += capeRegion * clothWeight * (0.005 + trailingEdge * 0.012) * windWave;
    transformed.z += depth * uDepth;
    transformed.xy += uPointer * depth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform float uOpacity;
  void main() {
    vec4 image = texture2D(uImage, vUv);
    gl_FragColor = vec4(image.rgb, uOpacity);
    #include <colorspace_fragment>
  }
`;

export function ArtworkBackdrop() {
  const size = useThree((state) => state.size);
  const quality = useJourneyStore((state) => state.quality);
  const framing = useMemo(() => artworkCover(size.width, size.height), [size.width, size.height]);
  const segments = useMemo<[number, number]>(() => quality === 'desktop'
    ? [320, 220]
    : quality === 'mobile' ? [224, 160] : [160, 112], [quality]);
  const image = useTexture(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${sceneConfig.artwork.src}`, (texture) => {
    texture.colorSpace = SRGBColorSpace;
  });
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const landscapeBlend = useRef(0);
  const pointer = usePointer();
  const pointerTarget = useMemo(() => new Vector2(), []);
  const direction = useMemo(() => new Vector3(), []);
  const uniforms = useMemo(() => ({
    uImage: { value: image },
    uCover: { value: new Vector2(1, 1) },
    uOffset: { value: new Vector2() },
    uSubject: { value: new Vector4(...sceneConfig.artwork.subject) },
    uPointer: { value: new Vector2() },
    uDepth: { value: sceneConfig.artwork.depth },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  }), [image]);

  useFrame(({ camera, size }, delta) => {
    if (!mesh.current || !material.current) return;
    const { progress, motionPaused, intro, landscapeReady, visible } = useJourneyStore.getState();
    if (material.current) {
      material.current.uniforms.uTime.value += ambientDelta(delta, progress, motionPaused, visible);
    }
    const ready = landscapeReady ? 1 : 0;
    landscapeBlend.current = motionPaused ? ready
      : MathUtils.damp(landscapeBlend.current, ready, sceneConfig.artwork.fadeSmoothing, Math.min(delta, 0.05));
    const opacity = artworkOpacity(progress, landscapeBlend.current);
    mesh.current.visible = opacity > 0.001;
    material.current.uniforms.uOpacity.value = opacity;
    if (!mesh.current.visible) return;
    const distance = 90;
    const height = 2 * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360) * distance;
    const aspect = size.width / size.height;
    const zoom = sceneConfig.artwork.overscan - (1 - intro) * sceneConfig.artwork.introZoom;
    mesh.current.scale.set(height * aspect * zoom * 0.5, height * zoom * 0.5, 1);
    camera.getWorldDirection(direction);
    mesh.current.position.copy(camera.position).addScaledVector(direction, distance);
    mesh.current.quaternion.copy(camera.quaternion);
    material.current.uniforms.uCover.value.set(framing.coverX, framing.coverY);
    material.current.uniforms.uOffset.value.set(framing.offsetX, framing.offsetY);
    if (!motionPaused) {
      pointerTarget.set(pointer.current.x, pointer.current.y).multiplyScalar(sceneConfig.artwork.parallax);
      material.current.uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-Math.min(delta, 0.05) * sceneConfig.motion.parallaxLerp));
    }
  });

  return (
    <mesh ref={mesh} renderOrder={5} frustumCulled={false}>
      <planeGeometry args={[2, 2, ...segments]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
