import type { CSSProperties } from 'react';
import Image from 'next/image';

const nodes: [number, number][] = [
  [50, 7], [72, 13], [88, 29], [92, 51], [83, 73], [64, 88], [40, 91],
  [18, 78], [8, 56], [13, 34], [29, 17], [50, 24], [69, 29], [77, 49],
  [66, 68], [45, 76], [27, 62], [28, 41], [45, 36], [58, 50], [48, 59],
];
const edges: [number, number][] = [[0, 10], [0, 11], [1, 11], [1, 12], [2, 12], [2, 13], [3, 13], [3, 4], [4, 14], [4, 5], [5, 14], [5, 6], [6, 15], [6, 7], [7, 15], [7, 8], [8, 16], [8, 9], [9, 17], [9, 10], [10, 18], [11, 18], [11, 19], [12, 19], [13, 19], [14, 19], [14, 20], [15, 20], [16, 20], [17, 18], [18, 20], [19, 20]];
const particles: [number, number][] = [
  [9, 16], [23, 10], [37, 8], [62, 9], [82, 21], [93, 39], [91, 66],
  [77, 86], [58, 94], [31, 86], [15, 68], [5, 43], [21, 27], [36, 18],
  [65, 20], [80, 39], [72, 63], [53, 82], [30, 70], [19, 50], [39, 43],
  [57, 36], [62, 61], [42, 64], [46, 28], [78, 54], [12, 83], [88, 11],
];

export function Poster() {
  return (
    <div className="world-poster research-poster" aria-hidden="true">
      <div className="research-poster-grid" />
      <div className="poster-core-ambient" />
      <Image className="poster-guide" src="/ai-companion-hologram.webp" alt="" width={512} height={1184} />
      <div className="poster-core" role="presentation">
        <div className="poster-core-halo" />
        <div className="poster-core-orbit poster-core-orbit-a" />
        <div className="poster-core-orbit poster-core-orbit-b" />
        <svg className="poster-core-graph" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="poster-core-fill"><stop stopColor="#8CEAFF" stopOpacity=".36" /><stop offset=".62" stopColor="#5878FF" stopOpacity=".12" /><stop offset="1" stopColor="#17163E" stopOpacity=".06" /></radialGradient>
            <linearGradient id="poster-core-line"><stop stopColor="#56E7FF" stopOpacity=".1" /><stop offset=".5" stopColor="#B7A3FF" stopOpacity=".9" /><stop offset="1" stopColor="#56E7FF" stopOpacity=".16" /></linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#poster-core-fill)" stroke="#8FDFFF" strokeOpacity=".56" strokeWidth=".45" />
          <ellipse cx="50" cy="50" rx="45" ry="17" fill="none" stroke="#9ECFFF" strokeOpacity=".36" strokeWidth=".35" transform="rotate(-26 50 50)" />
          <ellipse cx="50" cy="50" rx="18" ry="45" fill="none" stroke="#8D9CFF" strokeOpacity=".28" strokeWidth=".35" transform="rotate(24 50 50)" />
          {edges.map(([from, to]) => {
            const [x1, y1] = nodes[from];
            const [x2, y2] = nodes[to];
            return <line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#poster-core-line)" strokeWidth=".48" />;
          })}
          {nodes.map(([cx, cy], index) => <circle key={`node-${index}`} cx={cx} cy={cy} r={index > 10 ? 1.1 : 1.45} fill={index % 4 === 0 ? '#D2C7FF' : '#90E9FF'} fillOpacity={index % 3 === 0 ? '.92' : '.68'} />)}
          <circle cx="50" cy="50" r="8" fill="#82E9FF" fillOpacity=".12" />
          <circle cx="50" cy="50" r="4.6" fill="#D9F8FF" fillOpacity=".72" />
        </svg>
        <div className="poster-core-particles">
          {particles.map(([x, y], index) => <span key={index} style={{ '--particle-x': `${x}%`, '--particle-y': `${y}%`, '--particle-delay': `${(index % 9) * -0.47}s` } as CSSProperties} />)}
        </div>
      </div>
      <p className="poster-core-caption"><span />FEARLESSU RESEARCH ENGINE</p>
    </div>
  );
}
