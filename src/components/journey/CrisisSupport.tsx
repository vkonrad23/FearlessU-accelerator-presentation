import { ArrowUpRight, HeartHandshake } from 'lucide-react';
import { crisisMessage } from '@/data/demoJourneys';

export function CrisisSupport({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`crisis-support${compact ? ' compact' : ''}`} aria-label="Crisis support">
      <HeartHandshake size={22} strokeWidth={1.4} aria-hidden="true" />
      <div>
        <h3>Professional support routes</h3>
        <p>{crisisMessage}</p>
        <a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer">Find a helpline <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
      </div>
    </aside>
  );
}
