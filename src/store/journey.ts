import { create } from 'zustand';

export type Quality = 'desktop' | 'mobile' | 'low';
export type RenderMode = 'loading' | 'webgl' | 'static';
export type ResearchMode = 'idle' | 'research' | 'hypothesis' | 'evaluation' | 'validation';
export type ResearchValidationEvent = {
  eventId: string;
  studyId: string;
  status: 'validated';
  validatedAt: string;
};

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
  researchMode: ResearchMode;
  validationEvent: ResearchValidationEvent | null;
  setProgress: (progress: number) => void;
  setResearchMode: (mode: Exclude<ResearchMode, 'validation'>) => void;
  provideValidationEvent: (event: ResearchValidationEvent) => void;
  clearValidationEvent: () => void;
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
  researchMode: 'idle',
  validationEvent: null,
  setProgress: (progress) => set({ progress }),
  setResearchMode: (researchMode) => set({ researchMode }),
  // Call only after the application receives a completed, reviewed research event.
  provideValidationEvent: (event) => {
    if (!event.eventId.trim() || !event.studyId.trim() || !Number.isFinite(Date.parse(event.validatedAt))) return;
    set({ validationEvent: event, researchMode: 'validation' });
  },
  clearValidationEvent: () => set((state) => ({
    validationEvent: null,
    researchMode: state.researchMode === 'validation' ? 'idle' : state.researchMode,
  })),
}));
