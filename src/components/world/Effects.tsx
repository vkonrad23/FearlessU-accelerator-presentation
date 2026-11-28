import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Vector2 } from 'three';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';

const chromaticOffset = new Vector2(0.0012, 0.0006);

export default function Effects() {
  const quality = useJourneyStore((state) => state.quality);
  const config = sceneConfig.effects;
  if (quality === 'low') return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={config.bloomIntensity} luminanceThreshold={config.bloomThreshold} luminanceSmoothing={config.bloomSmoothing} mipmapBlur />
      {quality === 'desktop' ? (
        <DepthOfField focusDistance={config.focusDistance} focalLength={config.focalLength} bokehScale={config.bokehScale} height={480} />
      ) : null}
      <ChromaticAberration offset={chromaticOffset} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.22} darkness={config.vignetteDarkness} />
    </EffectComposer>
  );
}
