import Image from 'next/image';
import { ArrowUpRight, Mail } from 'lucide-react';
import { founder } from '@/data/businessContent';
import { founderContact } from '@/data/partnerContent';
import { useLanguage } from '@/i18n/LanguageProvider';
import styles from './Founder.module.css';

export function Founder() {
  const { t } = useLanguage();
  return (
    <section id="founder" className={styles.section} aria-labelledby="founder-title">
      <div className={`page-width ${styles.layout}`}>
        <figure className={styles.portrait}>
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/media/vladyslav-konrad.webp`} width={600} height={750} sizes="(max-width: 767px) calc(100vw - 44px), 420px" alt={t('Vladyslav Konrad, founder of FearlessU')} />
          <figcaption>{t(founder.name)} <span>{t(founder.role)}</span></figcaption>
        </figure>
        <div className={styles.copy}>
          <p className="eyebrow">{t('Meet the Founder')}</p>
          <h2 id="founder-title">{t('Vladyslav')}<br /><em>{t('Konrad.')}</em></h2>
          <p className={styles.bio}>{t(founder.bio)}</p>
          <p>{t('My focus is software engineering, product prototyping, and turning an early idea into something people can inspect and test.')}</p>
          <blockquote>{t(founder.motivation)}</blockquote>
          <p className={styles.note}>{t(founder.expertise)}</p>
          <p className={styles.note}>{t(founder.institutionalContext)}</p>
          <section id="contact" className={styles.contact} aria-labelledby="contact-title">
            <h3 id="contact-title">{t('Let’s talk about a responsible next step.')}</h3>
            <p>{t('For research, accelerator, investor, and design-partner conversations. These are direct contact links, not a demo form.')}</p>
            <div className={styles.links}>
              <a href={`mailto:${founderContact.email}?subject=${encodeURIComponent(t('FearlessU collaboration'))}`}>
                <span><Mail size={17} aria-hidden="true" />{t('Email the founder')}</span>
                <strong>{founderContact.email}</strong>
              </a>
              <a href={founderContact.linkedin} target="_blank" rel="noopener noreferrer">
                <span>{t('Connect on LinkedIn')} <ArrowUpRight size={17} aria-hidden="true" /></span>
                <strong>{t(founder.name)}</strong>
                <span className="sr-only">{t(' (opens in a new tab)')}</span>
              </a>
            </div>
            <p className={styles.note}>{t('Please do not send sensitive health information. These channels do not provide care or emergency support.')}</p>
          </section>
        </div>
      </div>
    </section>
  );
}
