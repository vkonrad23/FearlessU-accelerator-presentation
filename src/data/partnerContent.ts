import { buyerHypotheses } from './businessContent.ts';

export const projectRepository = 'https://github.com/vkonrad23/FearlessU-accelerator-presentation';

export const founderContact = {
  email: 'vladkonrad11@gmail.com',
  linkedin: 'https://www.linkedin.com/in/vladyslav-konrad',
} as const;

export const pitchMedia = {
  video: '/media/fearlessu-pitch.mp4',
  poster: '/media/fearlessu-pitch-poster.webp',
  captions: {
    en: '/media/fearlessu-pitch.en.vtt',
    uk: '/media/fearlessu-pitch.uk.vtt',
  },
  durationSeconds: 61.233,
} as const;

export const investorModels = [
  buyerHypotheses[0],
  buyerHypotheses[2],
  buyerHypotheses[4],
] as const;

export const developmentStatus = [
  {
    id: 'built',
    title: 'Built Today',
    label: 'Available in this prototype',
    items: [
      'Three predefined everyday goals with transparent, local step-selection rules.',
      'Difficulty controls, optional reflection, and a clear choice to prepare, repeat, or pause.',
      'English and Ukrainian interfaces, keyboard controls, and a static alternative to 3D.',
    ],
    boundary: 'No live AI, accounts, clinical assessment, or storage of demo entries.',
  },
  {
    id: 'planned',
    title: 'Planned Next',
    label: 'Not available yet',
    items: [
      'User and buyer interviews, usability testing, and qualified content review.',
      'A privacy-first production architecture and an evaluation framework for constrained AI personalization.',
      'A narrowly scoped pilot proposal, subject to partner agreement and appropriate review.',
    ],
    boundary: 'Demand, pricing, safety processes, and the production AI system still need validation.',
  },
  {
    id: 'research',
    title: 'Research Ambitions',
    label: 'A separate, long-term track',
    items: [
      'Explore original CBT-inspired exercise candidates and testable intervention hypotheses.',
      'Investigate trauma-informed support and PTSD-related resources for war-affected civilians and military personnel.',
      'Work with qualified researchers on safety, ethics, study design, and appropriate clinical validation.',
    ],
    boundary: 'No trauma processing or PTSD treatment is provided. Research candidates are not validated therapies.',
  },
] as const;

export const validationPlan = [
  {
    title: 'Listen before expanding',
    method: 'Interview intended users and potential buyers about everyday goals, existing support, unmet needs, and willingness to engage.',
    decision: 'Is there a specific problem and a credible first audience?',
  },
  {
    title: 'Test the interaction',
    method: 'Run consent-based usability sessions. Observe task completion, comprehension of the limits, and feedback on the interface.',
    decision: 'Can people use the flow and explain what it does not do?',
  },
  {
    title: 'Review the boundaries',
    method: 'Ask qualified clinical, research, privacy, and security collaborators to review intended use, content, risks, and evaluation criteria.',
    decision: 'What must change before a responsible pilot is considered?',
  },
  {
    title: 'Prepare a bounded pilot',
    method: 'Agree a protocol, participant criteria, consent, meaningful measures, and safety monitoring. Obtain applicable approvals before recruitment.',
    decision: 'Is there an appropriate, reviewable basis for learning further?',
  },
] as const;

export const supportPriorities = [
  { title: 'Accelerators & investors', detail: 'Early-stage mentorship, introductions, commercialization feedback, and support for a clearly scoped validation phase.' },
  { title: 'Clinical & research partners', detail: 'Intended-use review, behavioral expertise, research methods, and independent safety and ethics guidance.' },
  { title: 'Design & pilot partners', detail: 'Access to relevant user and buyer perspectives, usability feedback, and help defining a feasible institutional workflow.' },
] as const;

export const technicalEvidence = [
  { title: 'A working interaction', detail: 'The same local rules power the first-screen preview and the full practice-and-reflection demo.', href: '#top', link: 'Try the interface' },
  { title: 'An inspectable implementation', detail: 'The public project includes TypeScript source, deterministic scene logic, and tests for recommendation and rendering boundaries.', href: projectRepository, link: 'Inspect the source' },
  { title: 'Built for more than one device', detail: 'Responsive English/Ukrainian layouts, keyboard navigation, reduced-motion support, and no-WebGL fallback are implemented.', href: '#product', link: 'Explore the product' },
] as const;
