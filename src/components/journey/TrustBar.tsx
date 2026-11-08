import { BookOpen, Heart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { trustPrinciples } from '@/data/content';
import { useLanguage } from '@/i18n/LanguageProvider';

const icons = { book: BookOpen, heart: Heart, shield: ShieldCheck, lock: LockKeyhole };

export function TrustBar() {
  const { t } = useLanguage();
  return (
    <ul className="trust-bar" aria-label={t('Our design principles')}>
      {trustPrinciples.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li className="trust-item" key={item.title}>
            <Icon size={21} strokeWidth={1.35} aria-hidden="true" />
            <div><strong>{t(item.title)}</strong><span>{t(item.detail)}</span></div>
          </li>
        );
      })}
    </ul>
  );
}
