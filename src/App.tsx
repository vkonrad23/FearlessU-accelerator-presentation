import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { usePageMotion } from './hooks/useMotion';
import { navigateToSection, useSectionNavigation } from './hooks/useSectionNavigation';
import { Header } from './components/Header';
import { PresentationControls } from './components/PresentationControls';
import { Hero, HeroJourneySection, HowItWorks, ProblemSection, SolutionSection } from './components/Introduction';
import { JourneyDemo, SampleJourney } from './components/JourneyExperience';
import { AISystem, EvidenceRoadmap, SafetySection } from './components/SafetyEvidence';
import { AcceleratorFit, ApplicationSnapshot, BusinessOverview, CompetitiveLandscape, DevelopmentRoadmap, TeamSection } from './components/BusinessSections';
import { ImpactDashboard } from './components/ImpactDashboard';
import { ContactSection, FAQ, Footer } from './components/ContactFooter';

const PitchTimer = lazy(() => import('./components/PitchTimer').then(module => ({ default: module.PitchTimer })));

export default function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [presenting, setPresenting] = useState(false);
  usePageMotion(pageRef);
  useSectionNavigation(pageRef);
  // The presentation now starts from the footer; begin its walkthrough at the overview.
  useEffect(() => { if (presenting) navigateToSection('top', { focus: false }); }, [presenting]);
  return (
    <div id="top" ref={pageRef}>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <HeroJourneySection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <JourneyDemo />
        <div className="sample-brief-wrap">
          <div className="container">
            <details className="sample-brief">
              <summary><span><span className="eyebrow">A closer look at the product</span>Explore an illustrative five-step speaking journey</span><span className="disclosure-mark" aria-hidden="true">+</span></summary>
              <SampleJourney />
            </details>
          </div>
        </div>
        <AISystem />
        <SafetySection />
        <EvidenceRoadmap />
        <ImpactDashboard />
        <BusinessOverview />
        <CompetitiveLandscape />
        <AcceleratorFit />
        <DevelopmentRoadmap />
        <TeamSection />
        <ApplicationSnapshot />
        <Suspense fallback={<section id="pitch" className="section pitch-placeholder" aria-busy="true"><div className="container"><p className="eyebrow">The founder story</p><h2 className="section-heading">Loading the pitch rehearsal…</h2></div></section>}>
          <PitchTimer />
        </Suspense>
        <FAQ />
        <ContactSection />
      </main>
      <Footer onPresent={() => setPresenting(true)} presentationActive={presenting} />
      <PresentationControls active={presenting} onExit={() => setPresenting(false)} />
    </div>
  );
}
