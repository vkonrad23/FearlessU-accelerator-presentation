'use client';

import { ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Brand } from './Brand';
import { useLanguage } from '@/i18n/LanguageProvider';

const JourneyPreview = lazy(() => import('./JourneyPreview'));

export function FinalCTA() {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(false);
  return (
    <>
      <section id="begin" className="content-section final-section page-width" data-camera-stop="1" aria-labelledby="begin-title">
        <div className="reading-panel final-panel">
          <p className="eyebrow"><span className="chapter-number">05</span>{t('A guided first step')}</p>
          <h2 id="begin-title">{t('Experience the')}<br /><em>{t('FearlessU Journey.')}</em></h2>
          <p className="section-description">{t('Explore the working prototype below. It uses transparent local rules to demonstrate how a small reflection can become an optional, bounded practice step.')}</p>
          <button className="button button-primary" onClick={() => setPreview(true)}>{t('Explore the fear journey')} <ArrowUpRight size={19} aria-hidden="true" /></button>
          <p className="final-note">{t('Inputs stay in this session and are not sent to a live AI model.')}</p>
          <p className="disclaimer-chip">{t('Experimental prototype · Not clinically validated · Not medical advice')}</p>
        </div>
        <footer className="site-footer">
          <Brand />
          <p>{t('Early-stage concept. Educational prototype, not medical advice.')}</p>
          <a href="#ai-safety">{t('AI & safety')} <ArrowUpRight size={15} aria-hidden="true" /></a>
        </footer>
      </section>
      {preview && <Suspense fallback={<p className="preview-loading" role="status">{t('Loading the local preview…')}</p>}><JourneyPreview onClose={() => setPreview(false)} /></Suspense>}
    </>
  );
}
