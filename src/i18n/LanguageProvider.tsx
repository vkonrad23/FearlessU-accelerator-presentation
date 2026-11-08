'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { uk } from './uk';

export type Locale = 'en' | 'uk';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (english: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'fearlessu-language';
const listeners = new Set<() => void>();
let sessionLocale: Locale = 'en';

function getLocaleSnapshot(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    sessionLocale = stored === 'uk' || stored === 'en'
      ? stored
      : window.navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en';
  } catch {
    sessionLocale = window.navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en';
  }
  return sessionLocale;
}

function subscribeToLocale(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function updateLocale(locale: Locale) {
  sessionLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The locale still updates for this session if storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

function getServerLocaleSnapshot(): Locale {
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, getServerLocaleSnapshot);
  const setLocale = useCallback((next: Locale) => updateLocale(next), []);
  const t = useCallback((english: string) => locale === 'uk' ? (uk[english] ?? english) : english, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t('FearlessU · Beyond fear. Beyond limits.');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('An early-stage AI mental wellness concept exploring personalized, CBT-informed tools. Experimental prototype. Not clinically validated. Not medical advice.'));
  }, [locale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
