import { ArrowRight, ArrowUpRight, Check, FlaskConical, Layers, Sparkles } from 'lucide-react';
import { developmentStatus, investorModels, supportPriorities, technicalEvidence, validationPlan } from '@/data/partnerContent';
import { useLanguage } from '@/i18n/LanguageProvider';
import styles from './Partnerships.module.css';

const statusIcons = [Check, Layers, FlaskConical];

export function Partnerships() {
  const { t } = useLanguage();
  return (
    <section id="investors" className={styles.section} aria-labelledby="investors-title">
      <div className="page-width">
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}><span aria-hidden="true" />{t('For Investors & Research Partners')}</p>
            <h2 id="investors-title" className={styles.title}>{t('Build the next step.')}<br /><em>{t('Validate it together.')}</em></h2>
          </div>
          <div className={styles.intro}>
            <p>{t('A working educational prototype. A focused product hypothesis. An invitation to help test what should come next.')}</p>
            <div className={styles.actions}>
              <a className={styles.primaryLink} href="#founder">{t('Discuss a collaboration')} <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className={styles.inlineLink} href="#pitch">{t('Watch the founder pitch')} <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </header>

        <nav className={styles.index} aria-label={t('Partner brief sections')}>
          <a href="#opportunity">{t('Problem & market')}</a>
          <a href="#development-status">{t('Built & planned')}</a>
          <a href="#research-study">{t('Proposed first study')}</a>
          <a href="#validation-plan">{t('Validation plan')}</a>
          <a href="#project-evidence">{t('Project evidence')}</a>
          <a href="#partner-support">{t('Support needed')}</a>
        </nav>

        <section id="opportunity" className={styles.block} aria-labelledby="opportunity-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>01 / {t('Problem & market')}</p>
            <h3 id="opportunity-title">{t('A bridge from intention to practice.')}</h3>
          </div>
          <div className={styles.opportunity}>
            <div className={styles.problem}>
              <p className={styles.label}>{t('The problem we want to understand')}</p>
              <p>{t('Recognizing a fear does not always make the next step feel manageable. Generic advice can leave a gap between knowing what matters and deciding what to try.')}</p>
              <p className={styles.small}>{t('FearlessU explores a structured, optional practice-and-reflection loop. Whether it meets a meaningful user need remains a question to test.')}</p>
            </div>
            <div className={styles.market}>
              <span className={styles.badge}>{t('Market-entry hypothesis')}</span>
              <h4>{t('Adult students. Everyday speaking confidence.')}</h4>
              <p>{t('Initial beachhead hypothesis: adult university students navigating everyday speaking and social-confidence goals. A possible first buyer is a university wellbeing or student-success team.')}</p>
              <p className={styles.small}>{t('Test this alongside existing student support, never as its replacement. Audience size, demand, purchasing pathways, and pricing are unvalidated; no market-size or revenue figure is claimed.')}</p>
            </div>
          </div>
          <div className={styles.subheading}>
            <h4>{t('Business-model hypotheses')}</h4>
            <span className={styles.badge}>{t('To validate, not current revenue')}</span>
          </div>
          <div className={styles.modelGrid}>
            {investorModels.map((model) => (
              <article key={model.name} className={styles.model}>
                <h5>{t(model.name)}</h5>
                <p>{t(model.model)}</p>
                <p className={styles.question}><span>{t('Key question')}</span>{t(model.question)}</p>
              </article>
            ))}
          </div>
          <div className={styles.subheading}>
            <h4>{t('Potential differentiation to test')}</h4>
            <span className={styles.badge}>{t('Design hypothesis, not a proven advantage')}</span>
          </div>
          <div className={styles.differentiationGrid}>
            <article><h5>{t('Compared with static wellness content')}</h5><p>{t('The prototype connects one chosen goal to an explained, optional example action and reflection.')}</p></article>
            <article><h5>{t('Compared with open-ended AI chat')}</h5><p>{t('This demo uses fixed choices and deterministic local rules, with no free-text prompt or live model.')}</p></article>
            <article><h5>{t('Alongside professional support')}</h5><p>{t('A future self-guided practice step could complement existing services; this prototype does not provide care.')}</p></article>
          </div>
          <p className={styles.competitorNote}>{t('These are hypotheses to evaluate with users and independent reviewers. No head-to-head competitor audit, validated moat, or superiority claim is presented.')}</p>
        </section>

        <section id="development-status" className={styles.block} aria-labelledby="status-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>02 / {t('Built & planned')}</p>
            <h3 id="status-title">{t('Clear about today. Ambitious about tomorrow.')}</h3>
          </div>
          <div className={styles.statusGrid}>
            {developmentStatus.map((status, index) => {
              const Icon = statusIcons[index];
              return (
                <article key={status.id} className={styles.status} data-status={status.id}>
                  <span className={styles.statusIcon}><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>
                  <h4>{t(status.title)}</h4>
                  <p className={styles.statusLabel}>{t(status.label)}</p>
                  <ul>{status.items.map((item) => <li key={item}>{t(item)}</li>)}</ul>
                  <p className={styles.statusBoundary}>{t(status.boundary)}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="validation-plan" className={styles.block} aria-labelledby="validation-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>03 / {t('Validation plan')}</p>
            <h3 id="validation-title">{t('The next milestone is better evidence.')}</h3>
            <p>{t('A proposed sequence, not completed research or a promise of clinical benefit. Each stage should inform whether and how to proceed.')}</p>
          </div>
          <aside id="research-study" className={styles.study} aria-labelledby="study-title">
            <div className={styles.studyIntro}>
              <p className={styles.label}>{t('Proposed first study · Not recruited')}</p>
              <h4 id="study-title">{t('Can people understand and use the demo as intended?')}</h4>
              <p>{t('A small, non-clinical usability study would test clarity and user control, not treatment benefit.')}</p>
            </div>
            <div className={styles.studyGrid}>
              <div><h5>{t('Proposed participants')}</h5><p>{t('8–12 adult students and 3–5 student-support staff, subject to recruitment, consent, and any required ethics review.')}</p></div>
              <div><h5>{t('Prototype tasks')}</h5><ul>
                <li>{t('Choose an everyday example and find the optional practice.')}</li>
                <li>{t('Explain why the suggestion appeared and how to pause or decline it.')}</li>
                <li>{t('Record an illustrative reflection and identify what the demo remembers.')}</li>
              </ul></div>
              <div><h5>{t('What to report')}</h5><p>{t('Recruitment and completion counts, task success and time, boundary comprehension, accessibility issues, and participant feedback. No clinical outcome claim.')}</p></div>
            </div>
            <p className={styles.studyBoundary}>{t('Protocol review, consent, and any required approvals come before recruitment. No sessions or results are reported as completed.')}</p>
          </aside>
          <ol className={styles.timeline}>
            {validationPlan.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                <div><h4>{t(step.title)}</h4><p>{t(step.method)}</p></div>
                <p className={styles.decision}><span>{t('Decision to inform')}</span>{t(step.decision)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="project-evidence" className={styles.block} aria-labelledby="evidence-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>04 / {t('Project evidence')}</p>
            <h3 id="evidence-title">{t('Show the work. Do not invent the traction.')}</h3>
          </div>
          <div className={styles.evidenceGrid}>
            {technicalEvidence.map((proof) => (
              <article className={styles.proof} key={proof.title}>
                <Check size={20} aria-hidden="true" />
                <h4>{t(proof.title)}</h4>
                <p>{t(proof.detail)}</p>
                <a className={styles.inlineLink} href={proof.href} {...(proof.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {t(proof.link)} <ArrowUpRight size={16} aria-hidden="true" />
                  {proof.href.startsWith('https:') && <span className="sr-only">{t(' (opens in a new tab)')}</span>}
                </a>
              </article>
            ))}
          </div>
          <aside className={styles.evidenceNote}>
            <p className={styles.label}>{t('User and clinical evidence: not published yet')}</p>
            <p>{t('Interview findings, usability results, and permissioned feedback will be added with dates, sample sizes, methods, and limitations. No invented testimonials, user counts, or clinical outcomes are presented.')}</p>
            <p className={styles.small}>{t('Technical checks demonstrate software behavior, not effectiveness, clinical safety, or product-market fit.')}</p>
          </aside>
        </section>

        <section id="partner-support" className={styles.support} aria-labelledby="support-title">
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}><Sparkles size={16} aria-hidden="true" />{t('Support needed')}</p>
            <h3 id="support-title">{t('The right collaborators, before the next claims.')}</h3>
          </div>
          <div className={styles.supportGrid}>
            {supportPriorities.map((priority) => <article key={priority.title}><h4>{t(priority.title)}</h4><p>{t(priority.detail)}</p></article>)}
          </div>
          <aside className={styles.ask}>
            <h4>{t('The immediate ask')}</h4>
            <p>{t('Seeking two university wellbeing or student-success research partners, one qualified clinical reviewer, and one usability-research collaborator to shape this small adult-student study.')}</p>
            <p>{t('For early-stage investors: feedback and introductions to these partners are the immediate request. A funding amount is not set. None of these partners is represented as confirmed.')}</p>
          </aside>
          <a className={styles.primaryLink} href="#founder">{t('Meet the founder & get in touch')} <ArrowUpRight size={18} aria-hidden="true" /></a>
          <p className={styles.small}>{t('No funding amount, institutional partnership, accelerator acceptance, or clinical endorsement is claimed.')}</p>
        </section>
      </div>
    </section>
  );
}
