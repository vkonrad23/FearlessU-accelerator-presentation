'use client';

import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PreviewButton } from './PreviewButton';

export function FinalCTA() {
  const { t } = useLanguage();
  return (
      <section id="begin" className="content-section final-section page-width" data-camera-stop="1" aria-labelledby="begin-title">
        <div className="reading-panel final-panel">
          <p className="eyebrow"><span className="chapter-number">06</span>{t('A guided first step')}</p>
          <h2 id="begin-title">{t('Experience the')}<br /><em>{t('FearlessU Journey.')}</em></h2>
          <p className="section-description">{t('Explore the working prototype below. It uses transparent local rules to demonstrate how a small reflection can become an optional, bounded practice step.')}</p>
          <PreviewButton>{t('Explore the fear journey')} <ArrowUpRight size={19} aria-hidden="true" /></PreviewButton>
          <p className="final-note">{t('Inputs stay in this session and are not sent to a live AI model.')}</p>
          <p className="disclaimer-chip">{t('Experimental prototype · Not clinically validated · Not medical advice')}</p>
        </div>
      </section>
  );
}
