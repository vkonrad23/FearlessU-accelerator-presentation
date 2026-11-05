import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TrustBar } from './TrustBar';

export function Hero() {
  return (
    <section id="top" className="hero-section page-width" aria-labelledby="hero-title" data-camera-stop="0">
      <div className="hero-main">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="small-orbit" aria-hidden="true" />Interactive prototype · CBT-informed</p>
          <h1 id="hero-title"><span className="headline-mask"><span>Beyond fear.</span></span>{' '}<span className="headline-mask"><em>Beyond limits.</em></span></h1>
          <p className="hero-description">FearlessU is an early-stage AI-powered mental wellness platform exploring personalized, CBT-informed tools to help people understand fears, challenge unhelpful thoughts, and build emotional resilience.</p>
          <p className="disclaimer-chip"><span aria-hidden="true" />Experimental prototype · Not clinically validated · Not medical advice</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#product">Explore the fear journey <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></a>
            <a className="text-link" href="#how-it-works">How it works <ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="world-caption" aria-hidden="true"><span className="caption-line" /><span>A little courage.<br />A new perspective.</span></div>
      </div>
      <div className="hero-bottom">
        <div className="hero-meta">
          <a href="#product" className="scroll-cue"><span><ArrowDown size={16} strokeWidth={1.4} aria-hidden="true" /></span>SCROLL TO EXPLORE</a>
          <span className="scene-coordinate">01 / 05 <span>THE BEGINNING</span></span>
        </div>
        <TrustBar />
      </div>
    </section>
  );
}
