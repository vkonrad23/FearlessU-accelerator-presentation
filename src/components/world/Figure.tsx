import { stairPosition } from '@/lib/scene-math';
import { sceneConfig } from '@/config/scene';
import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Cape } from './Cape';

const OptionalModel = lazy(() => import('./OptionalModel'));

class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function Figure() {
  const [x, y, z] = stairPosition(sceneConfig.models.figureStep);
  const fallback = <ProceduralFigure />;
  return (
    <group name="journey-figure" position={[x - 0.3, y + 0.2, z]} rotation={[0, -0.24, 0]} scale={sceneConfig.models.figure ? sceneConfig.models.figureScale : sceneConfig.figure.scale}>
      {sceneConfig.models.figure ? (
        <ModelBoundary fallback={fallback}><Suspense fallback={fallback}><OptionalModel src={sceneConfig.models.figure} /></Suspense></ModelBoundary>
      ) : fallback}
    </group>
  );
}

function ProceduralFigure() {
  return (
    <group>
      <Cape />
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.19, 20, 16]} />
        <meshStandardMaterial color="#b6a68c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.86, 0.015]} scale={[1, 0.68, 1]}>
        <sphereGeometry args={[0.2, 20, 12]} />
        <meshStandardMaterial color="#162921" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.073, 0.085, 0.2, 12]} />
        <meshStandardMaterial color="#b6a68c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.17, 0]} scale={[1, 1.35, 0.65]}>
        <capsuleGeometry args={[0.25, 0.35, 8, 16]} />
        <meshStandardMaterial color="#34574b" roughness={0.72} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.12, 0.48, side * 0.1]} rotation={[side * 0.12, 0, side * -0.08]}>
            <capsuleGeometry args={[0.085, 0.69, 4, 8]} />
            <meshStandardMaterial color="#263b32" roughness={0.88} />
          </mesh>
          <mesh position={[side * 0.32, 1.1, 0.015]} rotation={[0.1, 0, side * 0.13]}>
            <capsuleGeometry args={[0.067, 0.54, 4, 8]} />
            <meshStandardMaterial color="#34574b" roughness={0.82} />
          </mesh>
          <mesh position={[side * 0.15, 0.095, side * 0.1 - 0.06]} scale={[0.1, 0.095, 0.2]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#14231d" roughness={0.64} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
