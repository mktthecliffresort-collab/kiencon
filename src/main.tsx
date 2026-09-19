// Safeguard against scripts assigning to read-only fetch getter
try {
  const target = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  if (target && target.fetch) {
    let currentFetch = target.fetch.bind(target);
    const descriptor = {
      get() {
        return currentFetch;
      },
      set(fn: typeof fetch) {
        currentFetch = typeof fn === 'function' ? fn.bind(target) : fn;
      },
      configurable: true,
      enumerable: true,
    };
    try {
      Object.defineProperty(target, 'fetch', descriptor);
    } catch {}
    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', descriptor);
      } catch {}
    }
  }
} catch {}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
