import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { CSSProperties, ReactNode } from 'react';
import { sceneConfig } from '@/config/scene';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import './globals.css';

const serif = localFont({
  src: [
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-editorial-latin',
  display: 'swap',
  fallback: ['Georgia'],
  adjustFontFallback: 'Times New Roman',
});

const serifCyrillic = localFont({
  src: [
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-editorial-cyrillic',
  display: 'swap',
  adjustFontFallback: false,
});

const sans = localFont({
  src: [
    { path: '../../node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['Arial'],
});

export const metadata: Metadata = {
  title: 'FearlessU · Beyond fear. Beyond limits.',
  description: 'An early-stage AI mental wellness concept exploring personalized, CBT-informed tools. Experimental prototype. Not clinically validated. Not medical advice.',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.svg` },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: sceneConfig.colors.background,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeVariables = {
    ...Object.fromEntries(
      Object.entries(sceneConfig.colors)
        .filter(([, color]) => typeof color === 'string')
        .map(([name, color]) => [`--color-${name}`, color]),
    ),
    '--artwork-mobile-max-height': `${sceneConfig.artwork.mobileHeight}px`,
    '--artwork-mobile-height-ratio': sceneConfig.artwork.mobileHeightRatio,
    '--artwork-mobile-max-aspect': sceneConfig.artwork.mobileMaxAspect,
  } as CSSProperties;

  return (
    <html lang="en" className={`${serif.variable} ${serifCyrillic.variable} ${sans.variable}`} style={themeVariables}>
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
