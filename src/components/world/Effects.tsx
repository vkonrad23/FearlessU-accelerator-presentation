import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { sceneConfig } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';

export default function Effects() {
  const quality = useJourneyStore((state) => state.quality);
  const chapter = useJourneyStore((state) => state.chapter);
  const config = sceneConfig.effects;
  if (quality === 'low') return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={config.bloomIntensity} luminanceThreshold={config.bloomThreshold} luminanceSmoothing={config.bloomSmoothing} mipmapBlur />
      {quality === 'desktop' && chapter > 0 ? <DepthOfField focusDistance={config.focusDistance} focalLength={config.focalLength} bokehScale={config.bokehScale} height={360} /> : null}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.25} darkness={config.vignetteDarkness} />
    </EffectComposer>
  );
}
