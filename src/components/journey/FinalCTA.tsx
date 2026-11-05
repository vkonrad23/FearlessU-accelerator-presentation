'use client';

import { ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Brand } from './Brand';

const JourneyPreview = lazy(() => import('./JourneyPreview'));

export function FinalCTA() {
  const [preview, setPreview] = useState(false);
  return (
    <>
      <section id="begin" className="content-section final-section page-width" data-camera-stop="1" aria-labelledby="begin-title">
        <div className="reading-panel final-panel">
          <p className="eyebrow"><span className="chapter-number">05</span>A guided first step</p>
          <h2 id="begin-title">Experience the<br /><em>FearlessU Journey.</em></h2>
          <p className="section-description">Explore the working prototype below. It uses transparent local rules to demonstrate how a small reflection can become an optional, bounded practice step.</p>
          <button className="button button-primary" onClick={() => setPreview(true)}>Explore the fear journey <ArrowUpRight size={19} aria-hidden="true" /></button>
          <p className="final-note">Inputs stay in this session and are not sent to a live AI model.</p>
          <p className="disclaimer-chip">Experimental prototype · Not clinically validated · Not medical advice</p>
        </div>
        <footer className="site-footer">
          <Brand />
          <p>Early-stage concept. Educational prototype, not medical advice.</p>
          <a href="#ai-safety">AI & safety <ArrowUpRight size={15} aria-hidden="true" /></a>
        </footer>
      </section>
      {preview && <Suspense fallback={<p className="preview-loading" role="status">Loading the local preview…</p>}><JourneyPreview onClose={() => setPreview(false)} /></Suspense>}
    </>
  );
}
