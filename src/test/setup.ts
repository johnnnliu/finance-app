import '@testing-library/jest-dom';

// Polyfill ResizeObserver for JSDOM and Recharts
if (typeof window !== 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
