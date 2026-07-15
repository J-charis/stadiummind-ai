import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensures no component tree/DOM leaks between tests.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia — several components/hooks (theme,
// reduced-motion-aware animation) probe it indirectly via CSS, and some
// libraries call it defensively even when unused in a given test.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

// jsdom does not implement scrollTo — some interactive components call it
// defensively when managing focus/scroll on open (drawers, modals).
if (!window.scrollTo) {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

// jsdom does not implement scrollIntoView/ResizeObserver — used by some
// UI primitives (drawers, chart containers) and safe to no-op in tests.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
