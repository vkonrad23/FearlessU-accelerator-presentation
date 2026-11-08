import { ArrowUpRight, HeartHandshake } from 'lucide-react';
import { crisisMessage } from '@/data/demoJourneys';
import { useLanguage } from '@/i18n/LanguageProvider';

export function CrisisSupport({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <aside className={`crisis-support${compact ? ' compact' : ''}`} aria-label={t('Crisis support')}>
      <HeartHandshake size={22} strokeWidth={1.4} aria-hidden="true" />
      <div>
        <h3>{t('Professional support routes')}</h3>
        <p>{t(crisisMessage)}</p>
        <a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer">{t('Find a helpline')} <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">{t(' (opens in a new tab)')}</span></a>
      </div>
    </aside>
  );
}
