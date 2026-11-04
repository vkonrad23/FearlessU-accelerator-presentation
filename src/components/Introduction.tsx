import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChartNoAxesCombined, FlaskConical, Heart, LockKeyhole, Map, Route, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { capabilities, problemCards, processSteps, trustPrinciples } from '../data/content';
import { ProductDemo } from './JourneyExperience';
import { FearlessHeroScene } from './FearlessHeroScene';

const trustIcons = { book: BookOpen, heart: Heart, shield: ShieldCheck, lock: LockKeyhole };
const capabilityIcons = { map: Map, route: Route, sliders: SlidersHorizontal, chart: ChartNoAxesCombined, people: Users, research: FlaskConical };

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <FearlessHeroScene />
      <div className="hero-scene-wash" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-badge">Interactive prototype · CBT-informed</p>
          <h1 id="hero-title" className="hero-heading"><span className="hero-title-line">Beyond fear.</span>{' '}<span className="hero-title-line"><em>Beyond limits.</em></span></h1>
          <p className="hero-description">FearlessU explores CBT-informed support through small, optional practice steps and reflection. Try the approach at a pace you choose.</p>
          <div className="hero-actions">
            <a className="button" href="#journey">Explore the fear journey <ArrowUpRight size={19} aria-hidden="true" /></a>
            <a className="hero-secondary" href="#how-it-works">How it works <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-product">
          <ProductDemo />
        </div>
      </div>
      <div className="container trust-strip">
        {trustPrinciples.map(item => {
          const Icon = trustIcons[item.icon];
          return <div className="trust-item" key={item.title}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /><div><strong>{item.title}</strong><span>{item.detail}</span></div></div>;
        })}
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section id="problem" className="section problem-section" aria-labelledby="problem-title">
      <div className="container">
        <div className="problem-layout">
          <div className="problem-intro">
            <p className="eyebrow">The gap we are exploring</p>
            <h2 className="section-heading" id="problem-title">Knowing what matters.<br /><em>Finding a way to begin.</em></h2>
            <p className="section-description">Fear can narrow everyday choices. A carefully designed bridge between recognizing a pattern and trying a manageable action could make support more practical.</p>
            <a className="text-link" href="#how-it-works">See the proposed approach <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <ol className="problem-list">
            {problemCards.map((item, index) => <li key={item.title}><span className="list-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}
          </ol>
        </div>
        <div className="avoidance-cycle" aria-label="An illustrative fear and avoidance cycle">
          <p className="eyebrow">An everyday pattern, without blame</p>
          <ol>{['Trigger', 'Fear response', 'Avoidance', 'Short-term relief', 'Reinforced pattern'].map((step, index) => <li key={step}><span>{step}</span>{index < 4 && <ArrowRight size={18} aria-hidden="true" />}</li>)}</ol>
          <p className="cycle-caption">The proposed intervention creates room to understand, prepare, practice gradually, reflect, and adapt.</p>
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section id="product" className="section product-section" aria-labelledby="solution-title">
      <div className="container">
        <div className="section-intro">
          <div><p className="eyebrow">The product thesis</p><h2 className="section-heading" id="solution-title">Personal to the goal.<br /><em>Structured by design.</em></h2></div>
          <p className="section-description">The vision combines generative AI personalization of CBT-informed support with research into original intervention ideas. This prototype demonstrates a bounded practice-and-reflection loop using local rules.</p>
        </div>
        <div className="capability-list">
          {capabilities.map((item, index) => {
            const Icon = capabilityIcons[item.icon];
            return (
              <article className="capability-row" key={item.title}>
                <div className="capability-identity"><span className="feature-icon"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span><span className="list-number">0{index + 1}</span></div>
                <div className="capability-main"><p className="capability-label">{item.label}</p><h3>{item.title}</h3><p>{item.text}</p></div>
                <div className="capability-output"><p className="output-label">An everyday example</p><p>{item.example}</p><p className="capability-limit"><ShieldCheck size={16} aria-hidden="true" />{item.limit}</p></div>
              </article>
            );
          })}
        </div>
        <div className="product-invitation"><p>A concrete example is a better place to start.</p><a href="#journey" className="button button-secondary">Try the working prototype <ArrowUpRight size={18} aria-hidden="true" /></a></div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <div className="section-intro">
          <div><p className="eyebrow">A loop you can see</p><h2 className="section-heading" id="how-title">Clear structure.<br /><em>Choices you control.</em></h2></div>
          <p className="section-description">The intended AI workflow keeps each suggestion connected to user input and a visible boundary. The working demonstration uses predefined local rules.</p>
        </div>
        <ol className="process-grid">
          {processSteps.map((step, index) => (
            <li key={step.title}>
              <div className="process-connector"><span className="process-number">0{index + 1}</span>{index < 3 && <ArrowRight size={19} aria-hidden="true" />}</div>
              <h3>{step.title}</h3>
              <dl>
                <div><dt>User input</dt><dd>{step.input}</dd></div>
                <div><dt>Personalization function</dt><dd>{step.function}</dd></div>
                <div className="process-boundary"><dt><ShieldCheck size={14} aria-hidden="true" /> Safety constraint</dt><dd>{step.safety}</dd></div>
                <div className="process-output"><dt>You receive</dt><dd>{step.output}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
