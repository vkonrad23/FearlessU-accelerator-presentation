'use client';

import { ArrowRight, Leaf, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { demoScenarios, getHeroRecommendation, type DemoScenarioKey } from '@/data/demoJourneys';
import { CrisisSupport } from './CrisisSupport';

export default function JourneyPreview({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [scenario, setScenario] = useState<DemoScenarioKey>('speaking');
  const [difficulty, setDifficulty] = useState(5);
  const [showStep, setShowStep] = useState(false);
  const [reflect, setReflect] = useState(false);
  const [reflected, setReflected] = useState(false);
  const [newDifficulty, setNewDifficulty] = useState(5);
  const [nextChoice, setNextChoice] = useState('repeat');
  const recommendation = getHeroRecommendation(scenario, difficulty);
  const nextRecommendation = getHeroRecommendation(scenario, nextChoice === 'prepare' || newDifficulty >= 8 ? Math.max(8, newDifficulty) : difficulty);
  const resetResult = () => { setShowStep(false); setReflect(false); setReflected(false); };

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
      <button className="dialog-close" aria-label="Close the local preview" onClick={onClose}><X size={22} aria-hidden="true" /></button>
      <p className="eyebrow"><Leaf size={17} aria-hidden="true" />Architecture concept · Local demonstration</p>
      <h2 id="preview-title">A little room <em>to begin.</em></h2>
      <p id="preview-boundary" className="preview-boundary">No autonomous diagnosis. No replacement for professional care. No promise of a clinical outcome.</p>
      <CrisisSupport compact />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {reflected ? (nextChoice === 'pause' ? 'You can stop here. No next step is needed.' : `A next choice: ${nextRecommendation.title}`) : showStep ? `${recommendation.title} ${recommendation.activity}` : ''}
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setShowStep(true); setReflect(false); setReflected(false); setNewDifficulty(difficulty); setNextChoice('repeat'); }}>
        <label htmlFor="preview-scenario">Choose an illustrative goal</label>
        <select id="preview-scenario" value={scenario} onChange={(event) => { setScenario(event.target.value as DemoScenarioKey); resetResult(); }}>
          {demoScenarios.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <div className="range-label"><label htmlFor="preview-difficulty">Perceived difficulty</label><output htmlFor="preview-difficulty">{difficulty} / 10</output></div>
        <input id="preview-difficulty" type="range" min={0} max={10} value={difficulty} aria-valuetext={`${difficulty} out of 10`} onChange={(event) => { setDifficulty(Number(event.target.value)); resetResult(); }} />
        <div className="range-caption" aria-hidden="true"><span>More manageable</span><span>More difficult</span></div>
        <button className="button button-primary" type="submit">Find a possible step <ArrowRight size={17} aria-hidden="true" /></button>
      </form>
      {showStep && (
        <section className="preview-result" aria-label="One optional step">
          <p className="eyebrow">One optional step</p>
          <h3>{recommendation.title}</h3>
          <p>{recommendation.activity}</p>
          <p className="preview-reason">{recommendation.reason}</p>
          <p>{recommendation.preparation}</p>
          {!reflect && <button className="text-link" type="button" onClick={() => setReflect(true)}>Reflect on this example <ArrowRight size={16} aria-hidden="true" /></button>}
        </section>
      )}
      {showStep && reflect && (
        <form className="preview-reflection" onSubmit={(event) => { event.preventDefault(); setReflected(true); }}>
          <p className="eyebrow">A private, optional check-in</p>
          <p className="implementation-note">You do not need to carry out the activity. Use an illustrative rating to explore how the local rules respond.</p>
          <div className="range-label"><label htmlFor="reflection-difficulty">Perceived difficulty now</label><output htmlFor="reflection-difficulty">{newDifficulty} / 10</output></div>
          <input id="reflection-difficulty" type="range" min={0} max={10} value={newDifficulty} aria-valuetext={`${newDifficulty} out of 10`} onChange={(event) => { setNewDifficulty(Number(event.target.value)); setReflected(false); }} />
          <label htmlFor="reflection-choice">What would you prefer next?</label>
          <select id="reflection-choice" value={nextChoice} onChange={(event) => { setNextChoice(event.target.value); setReflected(false); }}>
            <option value="repeat">Keep the same example</option>
            <option value="prepare">Make room for preparation</option>
            <option value="pause">Pause or stop here</option>
          </select>
          <button className="button button-primary" type="submit">Review my next choice <ArrowRight size={17} aria-hidden="true" /></button>
          {reflected && (
            <section className="preview-summary" aria-label="Your temporary practice summary">
              <p>Illustrative check-ins: {difficulty} / 10, then {newDifficulty} / 10. These are not clinical measures.</p>
              <p>{nextChoice === 'pause' ? 'You can stop here. No next step is needed.' : nextRecommendation.activity}</p>
              <p className="implementation-note">Your choice remains optional. Closing this preview clears the entries.</p>
            </section>
          )}
        </form>
      )}
      <p className="preview-privacy">Inputs stay in this session and are not sent to a live AI model.</p>
      <p className="disclaimer-chip">Experimental prototype · Not clinically validated · Not medical advice</p>
    </dialog>
  );
}
