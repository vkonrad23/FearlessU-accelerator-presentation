import { stairPosition } from '@/lib/scene-math';
import { sceneConfig } from '@/config/scene';
import { Component, lazy, Suspense, type ReactNode } from 'react';

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
    <group position={[x - 0.3, y + 0.2, z]} rotation={[0, -0.4, 0]} scale={sceneConfig.models.figureScale}>
      {sceneConfig.models.figure ? (
        <ModelBoundary fallback={fallback}><Suspense fallback={fallback}><OptionalModel src={sceneConfig.models.figure} /></Suspense></ModelBoundary>
      ) : fallback}
    </group>
  );
}

function ProceduralFigure() {
  return (
    <group>
      <mesh position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.2, 14, 12]} />
        <meshStandardMaterial color={sceneConfig.colors.deep} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.17, 0]} scale={[1, 1.35, 0.65]}>
        <capsuleGeometry args={[0.25, 0.35, 6, 12]} />
        <meshStandardMaterial color={sceneConfig.colors.deep} roughness={0.85} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.12, 0.48, side * 0.1]} rotation={[side * 0.12, 0, side * -0.08]}>
            <capsuleGeometry args={[0.085, 0.69, 4, 8]} />
            <meshStandardMaterial color={sceneConfig.colors.background} roughness={0.9} />
          </mesh>
          <mesh position={[side * 0.32, 1.1, 0.015]} rotation={[0.1, 0, side * 0.13]}>
            <capsuleGeometry args={[0.067, 0.54, 4, 8]} />
            <meshStandardMaterial color={sceneConfig.colors.deep} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
