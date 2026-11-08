'use client';

import { useEffect, useRef } from 'react';
import { chapters } from '@/config/scene';
import { useJourneyStore } from '@/store/journey';
import { useLanguage } from '@/i18n/LanguageProvider';

export function ChapterRail() {
  const chapter = useJourneyStore((state) => state.chapter);
  const { t } = useLanguage();
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => useJourneyStore.subscribe((state) => {
    if (progress.current) progress.current.style.transform = `scaleX(${state.progress})`;
  }), []);
  return (
    <>
      <nav className="chapter-rail" aria-label={t('Journey chapters')}>
        {chapters.map((item, index) => (
          <a key={item.id} href={`#${item.id}`} aria-label={`${item.number}: ${t(item.label)}`} aria-current={index === chapter ? 'location' : undefined}>
            <span className="rail-dot" /><span className="rail-label">{t(item.label)}</span>
          </a>
        ))}
      </nav>
      <div className="journey-progress" aria-hidden="true"><div ref={progress} /></div>
    </>
  );
}
