'use client';

import { Hero } from './Hero';
import { Navigation } from './Navigation';
import { WorldLoader } from './WorldLoader';
import { useScrollJourney } from './hooks/useScrollJourney';
import { useIntro } from './hooks/useIntro';
import { Product } from './Product';
import { HowItWorks } from './HowItWorks';
import { Safety } from './Safety';
import { FinalCTA } from './FinalCTA';
import { ChapterRail } from './ChapterRail';
import { Partnerships } from './Partnerships';
import { PitchVideo } from './PitchVideo';
import { Founder } from './Founder';
import { SiteFooter } from './SiteFooter';
import { AIArchitecture } from './AIArchitecture';

export function Journey() {
  useScrollJourney();
  useIntro();

  return (
    <div className="journey-shell">
      <Navigation />
      <WorldLoader />
      <div className="world-scrim" aria-hidden="true" />
      <ChapterRail />
      <main id="main" tabIndex={-1}>
        <div data-scenic-journey>
          <Hero />
          <Product />
          <AIArchitecture />
          <HowItWorks />
          <Safety />
          <FinalCTA />
        </div>
        <Partnerships />
        <PitchVideo />
        <Founder />
      </main>
      <SiteFooter />
    </div>
  );
}
