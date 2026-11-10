import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Brand } from './Brand';

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <div className="site-footer-wrap">
      <footer className="site-footer page-width">
        <Brand />
        <p>{t('Early-stage concept. Educational prototype, not medical advice.')}</p>
        <nav className="footer-links" aria-label={t('Footer navigation')}>
          <a href="#investors">{t('For investors')} <ArrowUpRight size={15} aria-hidden="true" /></a>
          <a href="#contact">{t('Contact')} <ArrowUpRight size={15} aria-hidden="true" /></a>
          <a href="#ai-safety">{t('AI & safety')} <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
      </footer>
    </div>
  );
}
