import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { MathUtils, Mesh, PerspectiveCamera, ShaderMaterial, SRGBColorSpace, Vector2, Vector3, Vector4 } from 'three';
import { sceneConfig } from '@/config/scene';
import { artworkOpacity } from '@/lib/scene-math';
import { artworkCover } from '@/lib/artwork-math';
import { useJourneyStore } from '@/store/journey';
import { usePointer } from './usePointer';

const vertexShader = `
  varying vec2 vUv;
  uniform vec2 uPointer;
  uniform vec2 uCover;
  uniform vec2 uOffset;
  uniform vec4 uSubject;
  uniform float uDepth;
  uniform float uTime;
  void main() {
    vUv = uv * uCover + uOffset;
    vec3 transformed = position;
    float foreground = pow(1.0 - vUv.y, 2.35);
    float subject = 1.0 - smoothstep(0.72, 1.0, length((vUv - uSubject.xy) / uSubject.zw));
    float depth = mix(foreground, 0.42, subject);
    float capeRegion = smoothstep(0.1, 0.17, vUv.x)
      * (1.0 - smoothstep(0.38, 0.47, vUv.x))
      * smoothstep(0.2, 0.27, vUv.y)
      * (1.0 - smoothstep(0.47, 0.56, vUv.y));
    float capeTrail = smoothstep(0.12, 0.28, vUv.x)
      * (1.0 - smoothstep(0.36, 0.46, vUv.x))
      * smoothstep(0.27, 0.34, vUv.y)
      * (1.0 - smoothstep(0.5, 0.58, vUv.y));
    float wind = sin(uTime * 1.7 + vUv.x * 17.0 + vUv.y * 8.0)
      + 0.45 * sin(uTime * 2.6 - vUv.x * 31.0);
    float lift = wind * capeRegion * 0.012 + sin(uTime * 1.15 + vUv.y * 14.0) * capeTrail * 0.006;
    transformed.x += lift * (1.0 - vUv.x);
    transformed.y += lift * 0.5;
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
  const framing = useMemo(() => artworkCover(size.width, size.height), [size.width, size.height]);
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
    const { progress, motionPaused, intro, landscapeReady } = useJourneyStore.getState();
    if (!motionPaused && material.current) {
      material.current.uniforms.uTime.value += delta * sceneConfig.motion.animationSpeed;
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
      <planeGeometry args={[2, 2, 80, 48]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
