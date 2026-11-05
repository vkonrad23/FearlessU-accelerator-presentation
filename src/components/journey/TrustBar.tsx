import { BookOpen, Heart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { trustPrinciples } from '@/data/content';

const icons = { book: BookOpen, heart: Heart, shield: ShieldCheck, lock: LockKeyhole };

export function TrustBar() {
  return (
    <ul className="trust-bar" aria-label="Our design principles">
      {trustPrinciples.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li className="trust-item" key={item.title}>
            <Icon size={21} strokeWidth={1.35} aria-hidden="true" />
            <div><strong>{item.title}</strong><span>{item.detail}</span></div>
          </li>
        );
      })}
    </ul>
  );
}
