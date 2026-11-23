import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { TrustBar } from './TrustBar';
import { useLanguage } from '@/i18n/LanguageProvider';

export function Hero() {
  const { t } = useLanguage();
  return (
    <section id="top" className="hero-section page-width" aria-labelledby="hero-title" data-camera-stop="0">
      <div className="hero-main">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="hero-signal" aria-hidden="true" />{t('AI-assisted CBT research · Early-stage concept')}</p>
          <h1 id="hero-title" className="hero-title"><span className="hero-title-line">{t('Beyond Existing CBT.')}</span><span className="hero-title-line"><em>{t('Toward New Possibilities in Psychological Science.')}</em></span></h1>
          <p className="hero-description">{t('An AI-powered platform exploring personalized psychological support and the discovery of new evidence-informed CBT approaches.')}</p>
          <p className="disclaimer-chip"><span aria-hidden="true" />{t('Research vision · Working demo uses local rules · No live AI or clinical validation')}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#product">{t('Explore FearlessU')} <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></a>
            <a className="text-link" href="#ai-architecture">{t('Research & Innovation')} <ArrowRight size={17} strokeWidth={1.4} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <div className="hero-bottom">
        <div className="hero-meta">
          <a href="#product" className="scroll-cue"><span><ArrowDown size={16} strokeWidth={1.4} aria-hidden="true" /></span>{t('SCROLL TO EXPLORE')}</a>
          <span className="scene-coordinate">{t('RESEARCH · 01')}</span>
        </div>
        <TrustBar />
      </div>
    </section>
  );
}
