'use client';

import { ArrowDown, ShieldCheck } from 'lucide-react';
import { processSteps } from '@/data/content';
import { useJourneyStore } from '@/store/journey';

export function HowItWorks() {
  const active = useJourneyStore((state) => state.activeStep);
  return (
    <section id="how-it-works" className="process-section page-width" data-camera-stop="0.4" aria-labelledby="how-title">
      <div className="reading-panel process-intro">
        <p className="eyebrow"><span className="chapter-number">03</span>A loop you can see</p>
        <h2 id="how-title">Clear structure.<br /><em>Choices you control.</em></h2>
        <p className="section-description">The intended AI workflow keeps each suggestion connected to user input and a visible boundary. The working demonstration uses predefined local rules.</p>
        <p className="implementation-note">The preview uses fixed choices, not free-text risk screening. Crisis guidance is always visible; production safety controls require qualified review.</p>
        <a href="#step-1" className="text-link">Understand the goal <ArrowDown size={17} aria-hidden="true" /></a>
      </div>
      <ol className="process-list">
        {processSteps.map((step, index) => (
          <li key={step.title} id={`step-${index + 1}`} className="process-step" data-process-step={index} data-camera-stop={0.4 + index * 0.08} aria-current={active === index ? 'step' : undefined}>
            <article className="reading-panel step-card">
              <div className="step-card-top"><span className="large-step">0{index + 1}</span><div className="step-dots" aria-hidden="true">{processSteps.map((_, dot) => <span key={dot} data-lit={dot <= index} />)}</div><span className="step-count">0{index + 1} / 04</span></div>
              <h3>{step.title}</h3>
              <p className="step-description">{step.function}</p>
              <dl>
                <div><dt>Your starting point</dt><dd>{step.input}</dd></div>
                <div><dt>You receive</dt><dd>{step.output}</dd></div>
              </dl>
              <p className="boundary-line"><ShieldCheck size={17} strokeWidth={1.4} aria-hidden="true" />{step.safety}</p>
              {index < 3 && <a className="text-link" href={`#step-${index + 2}`}>{processSteps[index + 1].title}<ArrowDown size={16} aria-hidden="true" /></a>}
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
