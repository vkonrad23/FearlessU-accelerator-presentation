import Image from 'next/image';
import type { CSSProperties } from 'react';
import { sceneConfig } from '@/config/scene';

export function Poster() {
  const focalPoint = sceneConfig.artwork.focalPoint;
  const artworkStyle = {
    '--artwork-focal-desktop': `${focalPoint.desktop[0] * 100}% ${focalPoint.desktop[1] * 100}%`,
    '--artwork-focal-mobile': `${focalPoint.mobile[0] * 100}% ${focalPoint.mobile[1] * 100}%`,
  } as CSSProperties;
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
      <div className="artwork-poster">
        <Image className="photo-poster" style={artworkStyle} src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${sceneConfig.artwork.src}`} alt="" fill sizes="100vw" priority />
      </div>
    </div>
  );
}
