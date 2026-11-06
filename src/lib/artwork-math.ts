import { sceneConfig } from '../config/scene.ts';

export function artworkCover(width: number, height: number) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const coverX = Math.min(1, aspect / sceneConfig.artwork.aspect);
  const coverY = Math.min(1, sceneConfig.artwork.aspect / aspect);
  const focalPoint = width <= sceneConfig.quality.mobileBreakpoint
    ? sceneConfig.artwork.focalPoint.mobile : sceneConfig.artwork.focalPoint.desktop;
  return {
    coverX,
    coverY,
    offsetX: (1 - coverX) * focalPoint[0],
    // CSS positions start at the top; texture UVs start at the bottom.
    offsetY: (1 - coverY) * (1 - focalPoint[1]),
  };
}
