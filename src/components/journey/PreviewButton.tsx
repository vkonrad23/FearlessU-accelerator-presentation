'use client';

import { lazy, Suspense, useState, type ReactNode } from 'react';
import type { DemoScenarioKey } from '@/data/demoJourneys';
import { useLanguage } from '@/i18n/LanguageProvider';

const JourneyPreview = lazy(() => import('./JourneyPreview'));

export function PreviewButton({ children, className = 'button button-primary', scenario = 'speaking', difficulty = 5 }: {
  children: ReactNode;
  className?: string;
  scenario?: DemoScenarioKey;
  difficulty?: number;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => setOpen(true)}>{children}</button>
      {open && (
        <Suspense fallback={<p className="preview-loading" role="status">{t('Loading the local preview…')}</p>}>
          <JourneyPreview initialScenario={scenario} initialDifficulty={difficulty} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
