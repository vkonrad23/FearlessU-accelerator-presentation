import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';

export const HERO_SCENE_CONFIG = {
  parallaxStrength: 16,
  particleCount: 120,
  mobileParticleCount: 40,
  animationSpeed: 1,
  introDuration: 3500,
} as const;

const holograms = [
  { icon: '✦', label: 'AI companion', className: 'hologram-ai' },
  { icon: '☑', label: 'small next step', className: 'hologram-check' },
  { icon: '☼', label: 'reframe the thought', className: 'hologram-reframe' },
  { icon: '◌', label: 'breathing space', className: 'hologram-breathe' },
  { icon: '↗', label: 'confidence grows', className: 'hologram-growth' },
  { icon: '⌁', label: 'personal progress', className: 'hologram-sprout' },
] as const;

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
    if (!host || typeof window === 'undefined') return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const introKey = 'fearlessu-hero-intro-played';
    const alreadyPlayed = window.sessionStorage.getItem(introKey) === '1';
    host.classList.toggle('is-intro-complete', alreadyPlayed || reducedMotion);

    let introTimer: number | undefined;
    const finishIntro = () => {
      host.classList.add('is-intro-complete');
      window.sessionStorage.setItem(introKey, '1');
      if (introTimer) window.clearTimeout(introTimer);
    };
    const skip = host.querySelector<HTMLButtonElement>('.hero-skip-intro');
    skip?.addEventListener('click', finishIntro);
    if (!alreadyPlayed && !reducedMotion) introTimer = window.setTimeout(finishIntro, HERO_SCENE_CONFIG.introDuration);

    if (reducedMotion || !window.WebGLRenderingContext) {
      return () => {
        if (introTimer) window.clearTimeout(introTimer);
        skip?.removeEventListener('click', finishIntro);
      };
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5));
    host.appendChild(renderer.domElement);

    const count = mobile ? HERO_SCENE_CONFIG.mobileParticleCount : HERO_SCENE_CONFIG.particleCount;
    const texture = makeParticleTexture();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
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

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let active = true;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * HERO_SCENE_CONFIG.parallaxStrength;
      targetY = (event.clientY / window.innerHeight - 0.5) * -HERO_SCENE_CONFIG.parallaxStrength * 0.55;
      host.style.setProperty('--pointer-x', `${targetX}px`);
      host.style.setProperty('--pointer-y', `${targetY}px`);
    };
    const onVisibilityChange = () => { active = !document.hidden; };
    const intersectionObserver = new IntersectionObserver(([entry]) => { active = entry.isIntersecting && !document.hidden; }, { threshold: 0.05 });
    intersectionObserver.observe(host);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (active) {
        currentX += (targetX - currentX) * 0.025;
        currentY += (targetY - currentY) * 0.025;
        camera.position.x = currentX * 0.012;
        camera.position.y = currentY * 0.008;
        camera.lookAt(currentX * 0.003, currentY * 0.003, 0);
        particles.rotation.z = elapsed * 0.008 * HERO_SCENE_CONFIG.animationSpeed;
        particles.position.y = Math.sin(elapsed * 0.35) * 0.04;
        trail.material.opacity = 0.6 + Math.sin(elapsed * 1.5) * 0.2;
        renderer.render(scene, camera);
      }
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      skip?.removeEventListener('click', finishIntro);
      if (introTimer) window.clearTimeout(introTimer);
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
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={hostRef} className="fearless-scene" aria-label="Animated cinematic journey from fear toward possibility">
      <div className="hero-atmosphere hero-clouds" aria-hidden="true" />
      <div className="hero-atmosphere hero-rays" aria-hidden="true" />
      <div className="hero-reference-wrap" aria-hidden="true">
        <img className="hero-reference-art" src={`${import.meta.env.BASE_URL}fearlessu-reference-hero.png`} alt="" loading="eager" decoding="async" fetchPriority="high" />
      </div>
      <div className="hero-art-vignette" aria-hidden="true" />
      <div className="hero-holograms" aria-hidden="true">
        {holograms.map((card, index) => <div className={`hero-hologram ${card.className}`} style={{ '--card-index': index } as CSSProperties} key={card.label}><span>{card.icon}</span><small>{card.label}</small></div>)}
      </div>
      <div className="hero-staircase" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} style={{ '--step-index': index } as CSSProperties} />)}</div>
      <div className="hero-film-grain" aria-hidden="true" />
      <div className="hero-art-label">Cinematic concept · FearlessU</div>
      <button type="button" className="hero-skip-intro">Skip intro</button>
    </div>
  );
}
