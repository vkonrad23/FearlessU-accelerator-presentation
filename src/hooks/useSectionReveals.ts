import { useEffect, type RefObject } from 'react';

/** One observer, one entrance per editorial block; content is always available. */
export function useSectionReveals(pageRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page || !('IntersectionObserver' in window)) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Deliberately select editorial text, never controls, notices or safety copy.
    const targets = Array.from(page.querySelectorAll<HTMLElement>(
      'main > .section h2[id], .capability-main, .problem-list > li',
    ));
    const seen = new Set<HTMLElement>();
    let observer: IntersectionObserver | undefined;

    const finish = (element: HTMLElement) => {
      seen.add(element);
      delete element.dataset.reveal;
      observer?.unobserve(element);
    };
    const finishHashTarget = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(id)); }
      catch { return; }
      if (target) targets.filter(element => target.contains(element)).forEach(finish);
    };
    const setup = () => {
      observer?.disconnect();
      targets.forEach(element => { delete element.dataset.reveal; });
      if (preference.matches) return;

      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          if (!element.contains(document.activeElement)) element.dataset.reveal = 'arrive';
          seen.add(element);
          observer?.unobserve(element);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

      finishHashTarget();
      targets.forEach(element => {
        if (seen.has(element)) return;
        // Initial viewport content never waits for JavaScript or an observer.
        if (element.getBoundingClientRect().top < window.innerHeight * 0.94) finish(element);
        else observer?.observe(element);
      });
    };
    const onFocus = (event: FocusEvent) => {
      targets.filter(element => element.contains(event.target as Node)).forEach(finish);
    };

    setup();
    preference.addEventListener('change', setup);
    window.addEventListener('hashchange', finishHashTarget);
    page.addEventListener('focusin', onFocus);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', setup);
      window.removeEventListener('hashchange', finishHashTarget);
      page.removeEventListener('focusin', onFocus);
      targets.forEach(element => { delete element.dataset.reveal; });
    };
  }, [pageRef]);
}
