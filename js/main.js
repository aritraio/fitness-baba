/* ══════════════════════════════════════════════════════
   INIT — entry point
══════════════════════════════════════════════════════ */
checkProtocol();
initAuth();       /* auth.js — handles Clerk init, then goStep(1) or dashboard */

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  });
}
