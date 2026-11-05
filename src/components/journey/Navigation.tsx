'use client';

import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useJourneyStore } from '@/store/journey';
import { Brand } from './Brand';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  const paused = useJourneyStore((state) => state.motionPaused);
  const reduced = useJourneyStore((state) => state.reducedMotion);
  const mode = useJourneyStore((state) => state.mode);
  const links = [
    ['Product', '#product'],
    ['How it works', '#how-it-works'],
    ['AI & safety', '#ai-safety'],
  ];

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="prototype-banner">
        <span className="banner-dot" aria-hidden="true" />
        Early-stage concept. Educational prototype, not medical advice.
      </div>
      <div className="nav-shell page-width">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <button className="motion-toggle" data-enabled={!reduced && mode === 'webgl'} disabled={reduced || mode !== 'webgl'} aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'} aria-pressed={paused} onClick={() => useJourneyStore.setState({ motionPaused: !paused })}>
            {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
          <a className="nav-cta" href="#begin">Explore the prototype <ArrowUpRight size={15} aria-hidden="true" /></a>
          <button ref={menu} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); menu.current?.focus(); } }}>
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
          <a href="#begin" onClick={() => setOpen(false)}>Explore the prototype<ArrowUpRight size={17} aria-hidden="true" /></a>
        </nav>
      )}
    </header>
  );
}
