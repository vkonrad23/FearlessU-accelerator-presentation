import Image from 'next/image';
import { sceneConfig } from '@/config/scene';

export function Poster() {
  return (
    <div className="world-poster" aria-hidden="true">
      <div className="poster-halo" />
      <div className="poster-sun" />
      <div className="poster-mountain mountain-far" />
      <div className="poster-mountain mountain-mid" />
      <div className="poster-mountain mountain-near" />
      <div className="poster-mountain mountain-front" />
      <div className="poster-stairs">{Array.from({ length: 30 }, (_, i) => <span key={i} style={{ '--step': i } as React.CSSProperties} />)}</div>
      <div className="poster-haze" />
      <Image className="photo-poster" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${sceneConfig.artwork.src}`} alt="" fill sizes="100vw" priority />
    </div>
  );
}
