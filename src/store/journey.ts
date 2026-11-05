import { create } from 'zustand';

export type Quality = 'desktop' | 'mobile' | 'low';
export type RenderMode = 'loading' | 'webgl' | 'static';

type JourneyState = {
  progress: number;
  chapter: number;
  activeStep: number;
  selectedFeature: number;
  quality: Quality;
  mode: RenderMode;
  motionPaused: boolean;
  reducedMotion: boolean;
  visible: boolean;
  intro: number;
  landscapeRequested: boolean;
  landscapeReady: boolean;
  setProgress: (progress: number) => void;
};

export const useJourneyStore = create<JourneyState>((set) => ({
  progress: 0,
  chapter: 0,
  activeStep: 0,
  selectedFeature: 0,
  quality: 'desktop',
  mode: 'loading',
  motionPaused: false,
  reducedMotion: false,
  visible: true,
  intro: 1,
  landscapeRequested: false,
  landscapeReady: false,
  setProgress: (progress) => set({ progress }),
}));
