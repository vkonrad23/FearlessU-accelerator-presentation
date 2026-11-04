import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const particleCount = 180;

function makeParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  const gradient = context.createRadialGradient(24, 24, 0, 24, 24, 24);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.18, 'rgba(255,224,132,.95)');
  gradient.addColorStop(1, 'rgba(255,224,132,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 48, 48);
  return new THREE.CanvasTexture(canvas);
}

function makeEnergyTrail() {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index < 70; index += 1) {
    const progress = index / 69;
    points.push(new THREE.Vector3(
      -3.2 + progress * 7.2,
      -1.6 + Math.sin(progress * Math.PI * 3) * 0.18 + progress * 1.65,
      0.8 - progress * 2.4,
    ));
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffd66e, transparent: true, opacity: 0.82 }),
  );
}

export function FearlessHeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined' || !window.WebGLRenderingContext) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75));
    host.appendChild(renderer.domElement);

    const texture = makeParticleTexture();
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const progress = Math.random();
      positions[index * 3] = -4 + progress * 8 + (Math.random() - 0.5) * 0.8;
      positions[index * 3 + 1] = -1.5 + progress * 3.2 + (Math.random() - 0.5) * 1.2;
      positions[index * 3 + 2] = -1.5 + Math.random() * 2.5;
    }
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)),
      new THREE.PointsMaterial({ color: 0xffd97d, size: mobile ? 0.075 : 0.105, map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.72 }),
    );
    scene.add(particles);

    const trail = makeEnergyTrail();
    scene.add(trail);

    const portalGlow = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 1.13, 96),
      new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending }),
    );
    portalGlow.position.set(-0.15, 0.35, -1.1);
    portalGlow.scale.set(1.5, 1.55, 1);
    scene.add(portalGlow);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.18;
      targetY = (event.clientY / window.innerHeight - 0.5) * -0.1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (!reducedMotion) {
        currentX += (targetX - currentX) * 0.025;
        currentY += (targetY - currentY) * 0.025;
        camera.position.x = currentX;
        camera.position.y = currentY;
        camera.lookAt(currentX * 0.25, currentY * 0.25, 0);
        particles.rotation.z = elapsed * 0.008;
        particles.position.y = Math.sin(elapsed * 0.35) * 0.04;
        trail.material.opacity = 0.6 + Math.sin(elapsed * 1.5) * 0.2;
        portalGlow.rotation.z = elapsed * 0.08;
        portalGlow.scale.setScalar(1.5 + Math.sin(elapsed * 1.4) * 0.025);
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      texture?.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={hostRef} className="fearless-scene" aria-hidden="true">
      <img className="hero-reference-art" src={`${import.meta.env.BASE_URL}fearlessu-reference-hero.png`} alt="" loading="eager" decoding="async" fetchPriority="high" />
      <div className="hero-art-vignette" />
      <div className="hero-art-label">Cinematic concept · FearlessU</div>
    </div>
  );
}
