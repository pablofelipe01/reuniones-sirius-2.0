// jest.setup.js

// Import Jest's expect function
import { expect } from '@jest/globals';
import '@testing-library/jest-dom';

// Suppress the punycode deprecation warning
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('punycode')) return;
  originalWarn(...args);
};

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// Make expect available globally
global.expect = expect;