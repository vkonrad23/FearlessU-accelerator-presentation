'use client';

import { ArrowUpRight, Check, Leaf, MoveUpRight, Sparkles, Wind, RefreshCw } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { featureLabels } from '@/config/scene';
import { capabilities } from '@/data/content';
import { useJourneyStore } from '@/store/journey';

const features = [
  { icon: Sparkles, description: capabilities[2].text, boundary: capabilities[2].limit },
  { icon: Check, description: capabilities[1].text, boundary: capabilities[1].limit },
  { icon: RefreshCw, description: 'Compare what you expected with what you noticed.', boundary: 'A structured check-in, not a diagnosis.' },
  { icon: Wind, description: 'You stay in control. You can make a step smaller, pause, or stop.', boundary: 'No pressure to progress or promise of an outcome.' },
  { icon: MoveUpRight, description: 'Start with a private introduction before sharing with a group.', boundary: 'An illustrative communication exercise, not an individualized exposure treatment.' },
  { icon: Leaf, description: capabilities[3].text, boundary: capabilities[3].limit },
];

export function Product() {
  const selected = useJourneyStore((state) => state.selectedFeature);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % features.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + features.length - 1) % features.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = features.length - 1;
    else return;
    event.preventDefault();
    useJourneyStore.setState({ selectedFeature: next });
    tabs.current[next]?.focus();
  };

  return (
    <section id="product" className="content-section page-width product-section" data-camera-stop="0.22" aria-labelledby="product-title">
      <div className="reading-panel">
        <p className="eyebrow"><span className="chapter-number">02</span>The product thesis</p>
        <h2 id="product-title">Personal to the goal.<br /><em>Structured by design.</em></h2>
        <p className="section-description">The vision combines generative AI personalization of CBT-informed support with research into original intervention ideas. This prototype demonstrates a bounded practice-and-reflection loop using local rules.</p>
        <div className="feature-tabs" role="tablist" aria-label="Explore the six features">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={featureLabels[index]} ref={(element) => { tabs.current[index] = element; }}
                id={`feature-tab-${index}`} role="tab" aria-selected={selected === index}
                aria-controls={`feature-panel-${index}`} tabIndex={selected === index ? 0 : -1}
                onClick={() => useJourneyStore.setState({ selectedFeature: index })}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <Icon size={17} strokeWidth={1.5} aria-hidden="true" />{featureLabels[index]}
              </button>
            );
          })}
        </div>
        {features.map((feature, index) => (
          <div className="feature-panel" key={featureLabels[index]} id={`feature-panel-${index}`} role="tabpanel" aria-labelledby={`feature-tab-${index}`} hidden={selected !== index} tabIndex={0}>
            <p>{feature.description}</p>
            <span>{feature.boundary}</span>
          </div>
        ))}
        <a href="#how-it-works" className="text-link">How it works <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <p className="landscape-note" aria-hidden="true"><span />A structured journey.<br /><em>A pace you control.</em></p>
    </section>
  );
}
