'use client';

import { ArrowRight, Leaf, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { demoScenarios, getHeroRecommendation, type DemoScenarioKey } from '@/data/demoJourneys';
import { CrisisSupport } from './CrisisSupport';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function JourneyPreview({ onClose, initialScenario = 'speaking', initialDifficulty = 5 }: {
  onClose: () => void;
  initialScenario?: DemoScenarioKey;
  initialDifficulty?: number;
}) {
  type ExampleOutcome = 'tried' | 'prepared' | 'paused';
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const [scenario, setScenario] = useState<DemoScenarioKey>(initialScenario);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [showStep, setShowStep] = useState(false);
  const [reflect, setReflect] = useState(false);
  const [reflected, setReflected] = useState(false);
  const [newDifficulty, setNewDifficulty] = useState(initialDifficulty);
  const [outcome, setOutcome] = useState<ExampleOutcome>('tried');
  const [nextChoice, setNextChoice] = useState('repeat');
  const recommendation = getHeroRecommendation(scenario, difficulty);
  const nextDifficulty = nextChoice === 'prepare' || newDifficulty >= 8 ? Math.max(8, newDifficulty) : newDifficulty;
  const nextRecommendation = getHeroRecommendation(scenario, nextDifficulty);
  const outcomeLabel = { tried: 'I tried the example action', prepared: 'I prepared without doing it', paused: 'I chose to pause or stop' }[outcome];
  const noNextStep = nextChoice === 'pause' || outcome === 'paused';
  const resetResult = () => { setShowStep(false); setReflect(false); setReflected(false); setOutcome('tried'); };

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog} className="journey-preview" aria-labelledby="preview-title" aria-describedby="preview-boundary" data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}
    >
      <button className="dialog-close" aria-label={t('Close the local preview')} onClick={onClose}><X size={22} aria-hidden="true" /></button>
      <p className="eyebrow"><Leaf size={17} aria-hidden="true" />{t('Architecture concept · Local demonstration')}</p>
      <h2 id="preview-title">{t('A little room')} <em>{t('to begin.')}</em></h2>
      <p id="preview-boundary" className="preview-boundary">{t('No autonomous diagnosis. No replacement for professional care. No promise of a clinical outcome.')}</p>
      <CrisisSupport compact />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {reflected ? (noNextStep ? t('You can stop here. No next step is needed.') : t('A possible next choice: {title}').replace('{title}', t(nextRecommendation.title))) : showStep ? `${t(recommendation.title)} ${t(recommendation.activity)}` : ''}
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setShowStep(true); setReflect(false); setReflected(false); setNewDifficulty(difficulty); setOutcome('tried'); setNextChoice('repeat'); }}>
        <label htmlFor="preview-scenario">{t('Choose an illustrative goal')}</label>
        <select id="preview-scenario" value={scenario} onChange={(event) => { setScenario(event.target.value as DemoScenarioKey); resetResult(); }}>
          {demoScenarios.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
        </select>
        <div className="range-label"><label htmlFor="preview-difficulty">{t('Perceived difficulty')}</label><output htmlFor="preview-difficulty">{difficulty} / 10</output></div>
        <input id="preview-difficulty" type="range" min={0} max={10} value={difficulty} aria-valuetext={t('At {score} out of 10').replace('{score}', String(difficulty))} onChange={(event) => { setDifficulty(Number(event.target.value)); resetResult(); }} />
        <div className="range-caption" aria-hidden="true"><span>{t('More manageable')}</span><span>{t('More difficult')}</span></div>
        <button className="button button-primary" type="submit">{t('Find a possible step')} <ArrowRight size={17} aria-hidden="true" /></button>
      </form>
      {showStep && (
        <section className="preview-result" aria-label={t('One optional step')}>
          <p className="eyebrow">{t('One optional step')}</p>
          <h3>{t(recommendation.title)}</h3>
          <p>{t(recommendation.activity)}</p>
          <p className="preview-reason">{t(recommendation.reason)}</p>
          <p>{t(recommendation.preparation)}</p>
          {!reflect && <button className="text-link" type="button" onClick={() => setReflect(true)}>{t('Reflect on this example')} <ArrowRight size={16} aria-hidden="true" /></button>}
        </section>
      )}
      {showStep && reflect && (
        <form className="preview-reflection" onSubmit={(event) => { event.preventDefault(); setReflected(true); }}>
          <p className="eyebrow">{t('A private, optional check-in')}</p>
          <p className="implementation-note">{t('This is a simulation. You do not need to carry out the activity. Choose an example result and rating to see how the local rules offer a possible next choice.')}</p>
          <label htmlFor="reflection-outcome">{t('What happened in this example?')}</label>
          <select id="reflection-outcome" value={outcome} onChange={(event) => { setOutcome(event.target.value as ExampleOutcome); setReflected(false); }}>
            <option value="tried">{t('I tried the example action')}</option>
            <option value="prepared">{t('I prepared without doing it')}</option>
            <option value="paused">{t('I chose to pause or stop')}</option>
          </select>
          <div className="range-label"><label htmlFor="reflection-difficulty">{t('Perceived difficulty now')}</label><output htmlFor="reflection-difficulty">{newDifficulty} / 10</output></div>
          <input id="reflection-difficulty" type="range" min={0} max={10} value={newDifficulty} aria-valuetext={t('At {score} out of 10').replace('{score}', String(newDifficulty))} onChange={(event) => { setNewDifficulty(Number(event.target.value)); setReflected(false); }} />
          <label htmlFor="reflection-choice">{t('What would you prefer next?')}</label>
          <select id="reflection-choice" value={nextChoice} onChange={(event) => { setNextChoice(event.target.value); setReflected(false); }}>
            <option value="repeat">{t('Keep the same example')}</option>
            <option value="prepare">{t('Make room for preparation')}</option>
            <option value="pause">{t('Pause or stop here')}</option>
          </select>
          <button className="button button-primary" type="submit">{t('Review my next choice')} <ArrowRight size={17} aria-hidden="true" /></button>
          {reflected && (
            <section className="preview-summary" aria-label={t('Your temporary practice summary')}>
              <p>{t('Example result: {outcome}. Difficulty check-ins: {before} / 10, then {after} / 10. These are not clinical measures.').replace('{outcome}', t(outcomeLabel)).replace('{before}', String(difficulty)).replace('{after}', String(newDifficulty))}</p>
              <p>{noNextStep ? t('You can stop here. No next step is needed.') : t('Possible next step: {activity}').replace('{activity}', t(nextRecommendation.activity))}</p>
              <p className="implementation-note">{t('Your choice remains optional. Closing this preview clears the entries.')}</p>
            </section>
          )}
        </form>
      )}
      <p className="preview-privacy">{t('Inputs stay in this session and are not sent to a live AI model.')}</p>
      <p className="disclaimer-chip">{t('Experimental prototype · Not clinically validated · Not medical advice')}</p>
    </dialog>
  );
}
