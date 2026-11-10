'use client';

import { ArrowUpRight, Leaf } from 'lucide-react';
import { useState } from 'react';
import { demoScenarios, getHeroRecommendation, type DemoScenarioKey } from '@/data/demoJourneys';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PreviewButton } from './PreviewButton';
import styles from './HeroProductPreview.module.css';

export function HeroProductPreview() {
  const { t } = useLanguage();
  const [scenario, setScenario] = useState<DemoScenarioKey>('speaking');
  const [difficulty, setDifficulty] = useState(4);
  const recommendation = getHeroRecommendation(scenario, difficulty);

  return (
    <section className={styles.preview} aria-labelledby="hero-preview-title" data-hero-preview>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}><Leaf size={13} aria-hidden="true" />{t('Working prototype')}</p>
          <h2 id="hero-preview-title">{t('Today’s Fear Journey')}</h2>
        </div>
        <PreviewButton className={styles.open} scenario={scenario} difficulty={difficulty}>
          <ArrowUpRight size={20} aria-hidden="true" /><span className="sr-only">{t('Open the full local demo')}</span>
        </PreviewButton>
      </div>
      <p className={styles.boundary}>{t('Local rules. No live AI.')} <a href="#ai-safety">{t('Safety & support')}</a></p>
      <label htmlFor="hero-scenario">{t('Illustrative goal')}</label>
      <select id="hero-scenario" value={scenario} onChange={(event) => setScenario(event.target.value as DemoScenarioKey)}>
        {demoScenarios.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
      </select>
      <div className={styles.rangeLabel}>
        <label htmlFor="hero-difficulty">{t('Perceived difficulty')}</label>
        <output htmlFor="hero-difficulty">{difficulty} / 10</output>
      </div>
      <input id="hero-difficulty" type="range" min={0} max={10} value={difficulty} aria-valuetext={t('At {score} out of 10').replace('{score}', String(difficulty))} onChange={(event) => setDifficulty(Number(event.target.value))} />
      <div className={styles.result} role="status" aria-live="polite" aria-atomic="true">
        <span>{t('One optional step')}</span>
        <h3>{t(recommendation.title)}</h3>
        <p>{t(recommendation.activity)}</p>
      </div>
      <p className={styles.privacy}>{t('Illustrative only. Nothing is sent or saved.')}</p>
    </section>
  );
}
