export const HERO_GUIDE_WIDTH = 3.4;
export const HERO_GUIDE_HEIGHT = HERO_GUIDE_WIDTH * 1184 / 512;
export const HERO_CORE_RADIUS = 2.18;

export function heroSceneLayout(width: number) {
  const mobile = width < 768;
  const compact = width < 1100;

  return {
    mobile,
    compact,
    guide: {
      position: [mobile ? 0.75 : compact ? 4.9 : 7.3, mobile ? 4.4 : 0, -1.6] as [number, number, number],
      scale: mobile ? 0.36 : compact ? 0.77 : 1.05,
    },
    core: {
      position: [mobile ? -1.05 : compact ? 2.1 : 3.1, mobile ? 4.2 : 0.18, 0] as [number, number, number],
      scale: mobile ? 0.38 : compact ? 0.9 : 1.15,
    },
  };
}
