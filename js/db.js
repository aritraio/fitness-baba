import { S } from './state.js';
import { getAuthToken } from './auth.js';

/* ══════════════════════════════════════════════════════
   DB — profile persistence via /api/profile
   All Supabase access is server-side; browser only calls
   our own /api/profile endpoint with a Clerk JWT.
══════════════════════════════════════════════════════ */

export async function loadProfile() {
  const token = await getAuthToken();
  if (!token) return null;

  const res = await fetch('/api/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Profile load failed: ${res.status}`);

  const d = await res.json();
  return d.state ?? null;
}

export async function saveProfile() {
  const token = await getAuthToken();
  if (!token) return;   /* not signed in — silently skip */

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: S })
    });
    if (!res.ok) throw new Error(`Profile save failed: ${res.status}`);
  } catch (e) {
    console.warn('[db] saveProfile:', e.message);
  }
}

/* Expose to window for inline HTML handlers */
window.loadProfile = loadProfile;
window.saveProfile = saveProfile;
