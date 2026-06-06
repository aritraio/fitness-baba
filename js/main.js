import { checkProtocol, initTheme } from './ui.js';
import { initAuth } from './auth.js';
import { translateUI } from './i18n.js';
import './export.js';

checkProtocol();
initTheme();
translateUI();
initAuth();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  });
}
