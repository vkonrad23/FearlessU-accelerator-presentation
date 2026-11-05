import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { MathUtils, Mesh, PerspectiveCamera, ShaderMaterial, SRGBColorSpace, Vector2, Vector3 } from 'three';
import { sceneConfig } from '@/config/scene';
import { artworkOpacity } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';
import { usePointer } from './usePointer';

const vertexShader = `
  varying vec2 vUv;
  uniform vec2 uPointer;
  uniform float uDepth;
  void main() {
    vUv = uv;
    vec3 transformed = position;
    float mountainDepth = pow(1.0 - uv.y, 2.0) * 0.6;
    float figureDepth = exp(-pow((uv.x - 0.27) * 7.0, 2.0)) * (1.0 - uv.y) * 0.4;
    float depth = mountainDepth + figureDepth;
    transformed.z += depth * uDepth;
    transformed.xy += uPointer * depth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uCover;
  uniform float uOpacity;
  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    vec4 image = texture2D(uImage, uv);
    gl_FragColor = vec4(image.rgb, uOpacity);
    #include <colorspace_fragment>
  }
`;

export function ArtworkBackdrop() {
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
    uPointer: { value: new Vector2() },
    uDepth: { value: sceneConfig.artwork.depth },
    uOpacity: { value: 1 },
  }), [image]);

  useFrame(({ camera, size }, delta) => {
    if (!mesh.current || !material.current) return;
    const { progress, motionPaused, intro, landscapeReady } = useJourneyStore.getState();
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
    material.current.uniforms.uCover.value.set(
      Math.min(1, aspect / sceneConfig.artwork.aspect),
      Math.min(1, sceneConfig.artwork.aspect / aspect),
    );
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
