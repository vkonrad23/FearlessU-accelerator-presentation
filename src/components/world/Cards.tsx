import { MeshTransmissionMaterial, RoundedBox, useFBO } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, Group, HalfFloatType, MeshBasicMaterial, NoToneMapping, PerspectiveCamera, SRGBColorSpace, Texture, Vector3 } from 'three';
import { featureLabels, sceneConfig } from '@/config/scene';
import { ambientDelta, smoothstep } from '@/lib/scene-math';
import { useJourneyStore } from '@/store/journey';

function CardFace({ index }: { index: number }) {
  const material = useRef<MeshBasicMaterial>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = sceneConfig.colors.gold;
    ctx.fillStyle = sceneConfig.colors.gold;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const x = 256, y = 90;
    ctx.beginPath();
    if (index === 0) {
      ctx.moveTo(x, y - 27); ctx.quadraticCurveTo(x + 5, y - 5, x + 28, y);
      ctx.quadraticCurveTo(x + 5, y + 5, x, y + 27);
      ctx.quadraticCurveTo(x - 5, y + 5, x - 28, y);
      ctx.quadraticCurveTo(x - 5, y - 5, x, y - 27);
    } else if (index === 1) {
      ctx.roundRect(x - 24, y - 24, 48, 48, 9);
      ctx.moveTo(x - 12, y); ctx.lineTo(x - 3, y + 9); ctx.lineTo(x + 14, y - 10);
    } else if (index === 2) {
      ctx.arc(x, y, 19, 0.3, Math.PI * 1.8);
      ctx.moveTo(x + 18, y - 21); ctx.lineTo(x + 18, y - 8); ctx.lineTo(x + 5, y - 9);
    } else if (index === 3) {
      ctx.ellipse(x - 9, y, 14, 23, -0.3, 0, Math.PI * 2);
      ctx.moveTo(x + 22, y); ctx.ellipse(x + 9, y, 14, 23, 0.3, 0, Math.PI * 2);
    } else if (index === 4) {
      ctx.moveTo(x - 24, y + 21); ctx.lineTo(x - 9, y + 5); ctx.lineTo(x + 3, y + 10); ctx.lineTo(x + 24, y - 18);
      ctx.moveTo(x + 9, y - 18); ctx.lineTo(x + 24, y - 18); ctx.lineTo(x + 24, y - 3);
    } else {
      ctx.moveTo(x, y + 24); ctx.lineTo(x, y - 10);
      ctx.moveTo(x, y + 9); ctx.bezierCurveTo(x - 24, y + 9, x - 27, y - 6, x - 24, y - 17);
      ctx.bezierCurveTo(x - 5, y - 17, x, y - 5, x, y + 9);
      ctx.moveTo(x, y); ctx.bezierCurveTo(x, y - 22, x + 18, y - 25, x + 26, y - 25);
      ctx.bezierCurveTo(x + 29, y - 6, x + 10, y, x, y);
    }
    ctx.stroke();
    ctx.fillStyle = sceneConfig.colors.cream;
    ctx.textAlign = 'center';
    ctx.font = '400 42px Arial, sans-serif';
    ctx.fillText(featureLabels[index], 256, 166);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [index]);
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame(() => {
    if (!material.current) return;
    const { progress } = useJourneyStore.getState();
    const config = sceneConfig.cards;
    material.current.opacity = smoothstep((progress - config.ringStart) / (config.ringEnd - config.ringStart))
      * (1 - smoothstep((progress - config.fadeStart) / (config.fadeEnd - config.fadeStart)));
  });
  if (!texture) return null;
  return (
    <mesh position={[0, 0, 0.135]} renderOrder={12}>
      <planeGeometry args={[3.6, 1.8]} />
      <meshBasicMaterial ref={material} map={texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Card({ index, active, buffer }: { index: number; active: boolean; buffer?: Texture }) {
  const group = useRef<Group>(null);
  const glass = useRef<{ opacity?: number } | null>(null);
  const time = useRef(0);
  const scratch = useRef(Array.from({ length: 5 }, () => new Vector3()));
  const selected = useJourneyStore((state) => state.selectedFeature);
  useFrame(({ camera, size }, delta) => {
    if (!group.current) return;
    const [position, right, up, forward, ring] = scratch.current;
    const { progress, motionPaused, visible, intro } = useJourneyStore.getState();
    const config = sceneConfig.cards;
    const opacity = 1 - smoothstep((progress - config.fadeStart) / (config.fadeEnd - config.fadeStart));
    group.current.visible = opacity > 0.001;
    if (!group.current.visible) return;
    time.current += ambientDelta(delta, progress, motionPaused, visible);
    const ringBlend = smoothstep((progress - config.ringStart) / (config.ringEnd - config.ringStart));
    const distance = 22 + index * 0.9;
    const height = 2 * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360) * distance;
    const [u, v] = sceneConfig.cards.heroAnchors[index];
    const aspect = size.width / size.height;
    const coverX = Math.min(1, aspect / sceneConfig.artwork.aspect);
    const coverY = Math.min(1, sceneConfig.artwork.aspect / aspect);
    const zoom = sceneConfig.artwork.overscan - (1 - intro) * sceneConfig.artwork.introZoom;
    camera.getWorldDirection(forward);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    position.copy(camera.position).addScaledVector(forward, distance)
      .addScaledVector(right, (u - 0.5) / coverX * height * aspect * zoom)
      .addScaledVector(up, (0.5 - v) / coverY * height * zoom);
    const angle = index / 6 * Math.PI * 2 + Math.PI / 2;
    const [x, y, z] = sceneConfig.cards.ringCenter;
    ring.set(x + Math.cos(angle) * sceneConfig.cards.ringRadius, y + Math.sin(angle) * sceneConfig.cards.ringRadius, z + Math.cos(angle) * 2);
    position.lerp(ring, ringBlend);
    const phase = time.current * Math.PI * 2 / sceneConfig.motion.floatingPeriods[index] + index * 1.7;
    position.y += Math.sin(phase) * sceneConfig.motion.floatingAmplitude * ringBlend;
    group.current.position.copy(position);
    group.current.quaternion.copy(camera.quaternion);
    group.current.rotateX(Math.sin(phase * 0.7) * sceneConfig.motion.cardTilt * ringBlend);
    group.current.rotateY(Math.cos(phase * 0.5) * sceneConfig.motion.cardTilt * ringBlend);
    const scale = sceneConfig.cards.heroScale + ringBlend * (1 - sceneConfig.cards.heroScale);
    group.current.scale.setScalar(scale * (selected === index ? 1.06 : 1) * (0.9 + opacity * 0.1));
    if (glass.current) glass.current.opacity = opacity * (buffer ? 0.15 + ringBlend * 0.72 : config.fallbackOpacity * (0.4 + ringBlend * 0.6));
  });

  return (
    <group ref={group}>
      <RoundedBox args={[...sceneConfig.cards.size]} radius={0.14} smoothness={3} renderOrder={11}>
        {buffer ? (
          <MeshTransmissionMaterial
            ref={(material) => { glass.current = material; }} buffer={buffer} {...sceneConfig.cards.glass}
            resolution={sceneConfig.quality.desktop.transmissionResolution}
            backsideResolution={sceneConfig.quality.desktop.transmissionResolution}
            color={sceneConfig.colors.cream} chromaticAberration={0} distortion={0}
            temporalDistortion={0} transparent depthWrite={false} clearcoat={1}
          />
        ) : (
          <meshStandardMaterial ref={(material) => { glass.current = material; }} color={sceneConfig.colors.cool} metalness={0.15} roughness={0.22} transparent opacity={sceneConfig.cards.fallbackOpacity} depthWrite={false} />
        )}
      </RoundedBox>
      {active && <CardFace index={index} />}
    </group>
  );
}

export function Cards() {
  const root = useRef<Group>(null);
  const quality = useJourneyStore((state) => state.quality);
  const active = useJourneyStore((state) => state.chapter > 0);
  const resolution = sceneConfig.quality[quality].transmissionResolution;
  const target = useFBO(resolution, resolution, { type: HalfFloatType, samples: 0 });
  useFrame(({ gl, scene, camera }) => {
    if (!active || quality !== 'desktop' || !root.current || useJourneyStore.getState().progress >= sceneConfig.cards.fadeEnd) return;
    // One shared, low-resolution refraction pass for all six cards.
    const previousTarget = gl.getRenderTarget();
    const previousToneMapping = gl.toneMapping;
    root.current.visible = false;
    gl.toneMapping = NoToneMapping;
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(previousTarget);
    gl.toneMapping = previousToneMapping;
    root.current.visible = true;
  });
  return (
    <group ref={root}>
      {featureLabels.map((label, index) => <Card key={label} index={index} active={active} buffer={active && quality === 'desktop' ? target.texture : undefined} />)}
    </group>
  );
}
