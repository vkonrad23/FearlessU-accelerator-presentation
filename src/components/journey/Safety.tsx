import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { safetyControls } from '@/data/safetyContent';
import { CrisisSupport } from './CrisisSupport';

const boundaries = [
  { icon: Sparkles, title: 'Local rules, not a live model', text: 'The proposed AI would personalize within an evidence-informed framework. This educational prototype demonstrates the interaction with local rules, without a live model or clinical assessment.' },
  { icon: ShieldCheck, title: 'Clear boundaries', text: 'No autonomous diagnosis. No replacement for professional care. No promise of a clinical outcome.' },
  { icon: LockKeyhole, title: safetyControls[6].title, text: safetyControls[6].prototype },
];

export function Safety() {
  return (
    <section id="ai-safety" className="content-section safety-section page-width" data-camera-stop="0.8" aria-labelledby="safety-title">
      <div className="reading-panel safety-panel">
        <p className="eyebrow"><span className="chapter-number">04</span>Responsible AI & data practices</p>
        <h2 id="safety-title">Clear boundaries.<br /><em>Visible accountability.</em></h2>
        <p className="section-description">What a visitor can use today is distinct from what a production product would need. No completed clinical validation or production safety system is implied.</p>
        <div className="safety-boundaries">
          {boundaries.map((boundary) => {
            const Icon = boundary.icon;
            return <article key={boundary.title}><Icon size={21} strokeWidth={1.35} aria-hidden="true" /><div><h3>{boundary.title}</h3><p>{boundary.text}</p></div></article>;
          })}
        </div>
        <CrisisSupport />
        <p className="disclaimer-chip">Experimental prototype · Not clinically validated · Not medical advice</p>
      </div>
    </section>
  );
}
