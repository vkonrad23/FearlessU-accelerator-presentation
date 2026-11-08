'use client';

import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useJourneyStore } from '@/store/journey';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Brand } from './Brand';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const menu = useRef<HTMLButtonElement>(null);
  const paused = useJourneyStore((state) => state.motionPaused);
  const reduced = useJourneyStore((state) => state.reducedMotion);
  const mode = useJourneyStore((state) => state.mode);
  const links = [
    [t('Product'), '#product'],
    [t('How it works'), '#how-it-works'],
    [t('AI & safety'), '#ai-safety'],
  ];

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">{t('Skip to content')}</a>
      <div className="prototype-banner">
        <span className="banner-dot" aria-hidden="true" />
        {t('Early-stage concept. Educational prototype, not medical advice.')}
      </div>
      <div className="nav-shell page-width">
        <Brand />
        <nav aria-label={t('Main navigation')} className="desktop-nav">
          {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <div className="language-toggle" role="group" aria-label={t('Choose language')}>
            <button type="button" lang="en" aria-label={t('Switch language to English')} aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
            <span aria-hidden="true">/</span>
            <button type="button" lang="uk" aria-label={t('Switch language to Ukrainian')} aria-pressed={locale === 'uk'} onClick={() => setLocale('uk')}>УКР</button>
          </div>
          <button className="motion-toggle" data-enabled={!reduced && mode === 'webgl'} disabled={reduced || mode !== 'webgl'} aria-label={paused ? t('Resume ambient motion') : t('Pause ambient motion')} aria-pressed={paused} onClick={() => useJourneyStore.setState({ motionPaused: !paused })}>
            {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
          <a className="nav-cta" href="#begin">{t('Explore the prototype')} <ArrowUpRight size={15} aria-hidden="true" /></a>
          <button ref={menu} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? t('Close navigation') : t('Open navigation')} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}>
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label={t('Mobile navigation')} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); menu.current?.focus(); } }}>
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
          <a href="#begin" onClick={() => setOpen(false)}>{t('Explore the prototype')}<ArrowUpRight size={17} aria-hidden="true" /></a>
        </nav>
      )}
    </header>
  );
}
