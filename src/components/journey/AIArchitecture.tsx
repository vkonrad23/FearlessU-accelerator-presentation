'use client';

import { ArrowDown, ArrowRight, BookOpenCheck, Check, CircleDot, LockKeyhole, MessageSquareText, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import styles from './AIArchitecture.module.css';

const modules = [
  { icon: MessageSquareText, title: 'Choose a goal', detail: 'A visitor selects an everyday situation and a comfortable pace.', status: 'In this demo', kind: 'now' },
  { icon: SlidersHorizontal, title: 'Size a practice step', detail: 'Transparent local rules suggest one optional example and explain why.', status: 'In this demo', kind: 'now' },
  { icon: BookOpenCheck, title: 'CBT-informed skills', detail: 'A future library could organize exercises reviewed by qualified experts.', status: 'Planned · review required', kind: 'later' },
  { icon: ShieldCheck, title: 'Apply safety boundaries', detail: 'Scope and crisis links are visible. Clinical screening and monitoring are not built.', status: 'Limited today', kind: 'limited' },
  { icon: Check, title: 'Reflect and choose', detail: 'An optional result and rating shape a local next choice; nothing is sent or retained.', status: 'In this demo', kind: 'now' },
] as const;

export function AIArchitecture() {
  const { t } = useLanguage();
  return (
    <section id="ai-architecture" className={`${styles.section} page-width`} data-camera-stop="0.31" aria-labelledby="architecture-title">
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className="eyebrow"><span className="chapter-number">03</span>{t('Proposed system architecture')}</p>
            <h2 id="architecture-title">{t('Personalization with')}<br /><em>{t('visible guardrails.')}</em></h2>
          </div>
          <p className={styles.description}>{t('See how a future AI-assisted system could connect a person’s goal, CBT-informed skills, safety boundaries, and feedback. Status labels show what this local prototype can do today.')}</p>
        </div>

        <ol className={styles.flow} aria-label={t('Prototype and proposed architecture flow')}>
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <li key={module.title} className={styles.module} data-status={module.kind}>
                <div className={styles.moduleTop}>
                  <span className={styles.icon}><Icon size={19} strokeWidth={1.5} aria-hidden="true" /></span>
                  <span className={styles.index}>0{index + 1}</span>
                  {index < modules.length - 1 && <ArrowRight className={styles.connector} size={15} aria-hidden="true" />}
                </div>
                <h3>{t(module.title)}</h3>
                <p>{t(module.detail)}</p>
                <span className={styles.status}>{module.kind === 'now' ? <Check size={13} aria-hidden="true" /> : <CircleDot size={13} aria-hidden="true" />}{t(module.status)}</span>
              </li>
            );
          })}
        </ol>

        <aside className={styles.boundary}>
          <LockKeyhole size={18} aria-hidden="true" />
          <p><strong>{t('Safety surrounds every step.')}</strong> {t('There is no live generative AI, clinical suitability decision, validated risk detector, or production audit system. Any therapeutic recommendation would need qualified review and appropriate validation first.')}</p>
        </aside>
        <a className={styles.link} href="#validation-plan">{t('See the validation plan')} <ArrowDown size={16} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
