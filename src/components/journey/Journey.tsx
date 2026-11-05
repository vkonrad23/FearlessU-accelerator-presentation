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
        <Hero />
        <Product />
        <HowItWorks />
        <Safety />
        <FinalCTA />
      </main>
    </div>
  );
}
