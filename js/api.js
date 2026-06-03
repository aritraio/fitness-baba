import { showNotif } from './ui.js';
import { getAuthToken } from './auth.js';

/* ══════════════════════════════════════════════════════
   AI MODEL SELECTOR
   Key lives in ZENMUX_API_KEY env var on Vercel — never in the browser.
   Model names follow ZenMux's provider/model format.
══════════════════════════════════════════════════════ */
let AI_MODEL = 'openai/gpt-4o';

export function setModel(val) {
  AI_MODEL = val;
  showNotif(`Model → ${val}`, 'ZenMux');
}

/* ══════════════════════════════════════════════════════
   ERROR PARSER
══════════════════════════════════════════════════════ */
export async function parseAIError(res) {
  let body = {};
  try { body = await res.json(); } catch(_) {}
  const msg = body.error?.message || res.statusText || 'Unknown error';
  const code = body.error?.code || '';

  if (res.status === 500 && msg.includes('ZENMUX_API_KEY')) {
    return `Server not configured — add <strong>ZENMUX_API_KEY</strong> in your Vercel dashboard under Settings → Environment Variables, then redeploy.`;
  }
  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after');
    const retryMsg = retryAfter ? ` Retry in <strong>${retryAfter}s</strong>.` : '';
    return `429 Rate limit hit on <strong>${AI_MODEL}</strong>.${retryMsg} Try switching to a faster model like <strong>openai/gpt-4o-mini</strong>.`;
  }
  if (res.status === 401) return `401 Invalid API key — check ZENMUX_API_KEY in Vercel env vars.`;
  if (res.status === 400) return `400 Bad Request — ${msg}`;
  return `${res.status}: ${msg}`;
}

/* ══════════════════════════════════════════════════════
   AI API — routed through /api/chat (Vercel → ZenMux)
   Same-origin call from browser → no CORS issue at all.
══════════════════════════════════════════════════════ */
export async function callAPI(prompt) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(await parseAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

export async function callAPIStream(prompt, onChunk, onDone, onError) {
  try {
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      })
    });
    if (!res.ok) throw new Error(await parseAIError(res));
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;
        if (cleaned === 'data: [DONE]') {
          continue;
        }
        if (cleaned.startsWith('data: ')) {
          try {
            const data = JSON.parse(cleaned.slice(6));
            const content = data.choices?.[0]?.delta?.content ?? '';
            if (content) onChunk(content);
          } catch (e) {
            // Ignore syntax/JSON errors on broken chunks
          }
        }
      }
    }
    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err);
    else console.error('[callAPIStream]', err);
  }
}

export async function callVisionAPI(prompt, b64) {
  /* Vision needs a model that supports image input */
  const visionModel = AI_MODEL.includes('gpt-3.5')
    ? 'openai/gpt-4o'
    : AI_MODEL;

  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: visionModel,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }
        ]
      }],
      temperature: 0.4,
      max_tokens: 2048
    })
  });
  if (!res.ok) throw new Error(await parseAIError(res));
  const d = await res.json();
  return d.choices?.[0]?.message?.content ?? '';
}

/* ══════════════════════════════════════════════════════
   JSON HELPERS
══════════════════════════════════════════════════════ */
export function parseArr(raw) {
  const s=raw.indexOf('['), e=raw.lastIndexOf(']');
  return JSON.parse(raw.slice(s,e+1));
}
export function parseObj(raw) {
  const s=raw.indexOf('{'), e=raw.lastIndexOf('}');
  return JSON.parse(raw.slice(s,e+1));
}

/* Expose to window for inline HTML handlers */
window.setModel = setModel;
window.parseAIError = parseAIError;
window.callAPI = callAPI;
window.callAPIStream = callAPIStream;
window.callVisionAPI = callVisionAPI;
window.parseArr = parseArr;
window.parseObj = parseObj;
