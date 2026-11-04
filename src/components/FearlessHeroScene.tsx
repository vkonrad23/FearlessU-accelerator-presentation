import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const particleCount = 220;

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(151,255,224,.8)');
  gradient.addColorStop(1, 'rgba(151,255,224,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function addHologram(scene: THREE.Scene, position: THREE.Vector3, icon: string, label: string) {
  const group = new THREE.Group();
  group.position.copy(position);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 0.86),
    new THREE.MeshBasicMaterial({ color: 0x9fffe3, transparent: true, opacity: 0.1, side: THREE.DoubleSide }),
  );
  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.7, 0.86)),
    new THREE.LineBasicMaterial({ color: 0x8cffe1, transparent: true, opacity: 0.72 }),
  );
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    context.font = 'bold 82px Arial';
    context.fillStyle = '#baffec';
    context.shadowColor = '#49ffe0';
    context.shadowBlur = 18;
    context.fillText(icon, 34, 105);
    context.font = '500 28px Arial';
    context.shadowBlur = 0;
    context.fillText(label, 36, 166);
  }
  const text = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 0.86),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0.9 }),
  );
  group.add(panel, border, text);
  scene.add(group);
  return group;
}

export function FearlessHeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined' || !window.WebGLRenderingContext) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 767px)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.4, 10.5);
    const renderer = new THREE.WebGLRenderer({ antialias: !isSmall, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.2 : 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xfff4d0, 0x21133c, 2.2);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffe6a1, 3.8);
    sun.position.set(5, 6, 4);
    scene.add(sun);
    const violet = new THREE.PointLight(0x7e4cff, 8, 12);
    violet.position.set(-5, 2, 1);
    scene.add(violet);

    const world = new THREE.Mesh(
      new THREE.SphereGeometry(12, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { time: { value: 0 } },
        vertexShader: 'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: `varying vec3 vPosition; uniform float time;
          void main(){float split=smoothstep(-1.3,1.5,vPosition.x); vec3 dark=vec3(.055,.025,.13); vec3 light=vec3(.08,.38,.42);
          float glow=pow(max(0.,dot(normalize(vPosition),normalize(vec3(.4,.8,1.)))),4.); gl_FragColor=vec4(mix(dark,light,split)+glow*vec3(.7,.5,.15),1.);}`,
      }),
    );
    scene.add(world);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 16, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x152d2a, roughness: 0.74, metalness: 0.12, transparent: true, opacity: 0.82 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1.25, -1);
    scene.add(floor);

    const glow = createGlowTexture();
    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ size: 0.16, map: glow ?? undefined, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xbaffec }),
    );
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 15;
      particlePositions[index * 3 + 1] = Math.random() * 7 - 1;
      particlePositions[index * 3 + 2] = Math.random() * 5 - 4;
    }
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    scene.add(particles);

    const portal = new THREE.Group();
    portal.position.set(0, 1.1, -0.5);
    portal.rotation.y = -0.1;
    const portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.075, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xffd66b, transparent: true, opacity: 0.88 }),
    );
    const portalCore = new THREE.Mesh(
      new THREE.CircleGeometry(2.05, 64),
      new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.08, side: THREE.DoubleSide }),
    );
    portal.add(portalRing, portalCore);
    scene.add(portal);

    const path = new THREE.Group();
    for (let index = 0; index < 8; index += 1) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(1.7 - index * 0.06, 0.08, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x98ffe1, emissive: 0x1bd8b0, emissiveIntensity: 1.5, transparent: true, opacity: 0.54, metalness: 0.6, roughness: 0.16 }),
      );
      step.position.set(-3.3 + index * 0.82, -0.78 + index * 0.16, 1.1 - index * 0.45);
      step.rotation.y = -0.12;
      path.add(step);
    }
    scene.add(path);

    const holograms = [
      addHologram(scene, new THREE.Vector3(2.8, 2.8, -1.4), '✦', 'AI companion'),
      addHologram(scene, new THREE.Vector3(4.5, 1.3, -1.8), '↗', 'confidence growth'),
      addHologram(scene, new THREE.Vector3(-3.7, 2.8, -1.2), '◌', 'breathing space'),
    ];
    holograms.forEach((item, index) => {
      item.rotation.y = index === 2 ? 0.1 : -0.08;
    });

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
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      if (!reducedMotion) {
        portal.rotation.z = elapsed * 0.16;
        portal.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.025);
        path.children.forEach((step, index) => { step.position.y += Math.sin(elapsed * 1.4 + index) * 0.0008; });
        holograms.forEach((item, index) => { item.position.y += Math.sin(elapsed * 0.5 + index) * 0.0015; item.rotation.z = Math.sin(elapsed * 0.35 + index) * 0.025; });
        particles.rotation.y = elapsed * 0.012;
        world.material.uniforms.time.value = elapsed;
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="fearless-scene" aria-hidden="true" />;
}
