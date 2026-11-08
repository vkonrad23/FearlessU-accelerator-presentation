import { useLanguage } from '@/i18n/LanguageProvider';

export function Brand() {
  const { t } = useLanguage();
  return (
    <a className="brand" href="#top" aria-label={t('FearlessU, back to the beginning')}>
      <svg width="35" height="38" viewBox="0 0 35 38" fill="none" aria-hidden="true">
        <path d="M17.5 32V16M17.5 23C8 23 4 16 5 7c9 0 13 5 12.5 16ZM17.5 17C17.5 8 22 3 30 3c1 9-4 14-12.5 14Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m10 13 7.5 10M25 9l-7.5 8" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      <span>Fearless<span className="brand-u">U</span><span className="brand-period">.</span></span>
    </a>
  );
}
