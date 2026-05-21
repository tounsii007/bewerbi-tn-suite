import "@testing-library/jest-dom/vitest";

/**
 * Iter 145 — Vitest global setup.
 *
 * Polyfills happy-dom is missing for our Iter 117 primitives:
 *  - matchMedia: framer-motion checks it for reduced-motion detection
 *  - IntersectionObserver: Reveal/NumberTicker use framer's useInView
 */

// matchMedia polyfill
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// IntersectionObserver polyfill — returns an instance that synchronously
// reports `isIntersecting: true` so Reveal-on-scroll components render
// their final state in tests.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class StubIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      // Fire once on next tick so consumers see "in view"
      queueMicrotask(() => {
        callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              target: document.body,
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              time: 0,
            },
          ],
          this as unknown as IntersectionObserver,
        );
      });
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).IntersectionObserver = StubIntersectionObserver;
}
