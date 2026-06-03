/**
 * Vercel serverless proxy → ZenMux AI
 *
 * ZenMux is OpenAI-compatible, so the request/response shape is identical.
 * The API key is read from the ZENMUX_API_KEY environment variable set in
 * the Vercel dashboard — it is never exposed to the browser.
 *
 * Endpoint: https://zenmux.ai/api/v1/chat/completions
 * Docs:     https://docs.zenmux.ai
 */
import { verifyToken } from '@clerk/backend';
import { createClient }  from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } }  // allow base64 images for vision
};

const ZENMUX_URL = 'https://zenmux.ai/api/v1/chat/completions';

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const LIMIT_CLERK = 30;
const LIMIT_IP = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// In-memory store fallback
const memoryStore = new Map();

function cleanMemoryStore() {
  const now = Date.now();
  for (const [key, val] of memoryStore.entries()) {
    if (val.expireAt < now) {
      memoryStore.delete(key);
    }
  }
}

function checkMemoryRateLimit(key, limit, windowMs) {
  cleanMemoryStore();
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry) {
    memoryStore.set(key, { points: 1, expireAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }
  if (entry.points >= limit) {
    const resetInSec = Math.max(0, Math.ceil((entry.expireAt - now) / 1000));
    return { success: false, remaining: 0, resetInSec };
  }
  entry.points += 1;
  const resetInSec = Math.max(0, Math.ceil((entry.expireAt - now) / 1000));
  return { success: true, remaining: limit - entry.points, resetInSec };
}

async function checkDbRateLimit(key, limit, windowMs) {
  if (!supabase) return null;

  try {
    const nowStr = new Date().toISOString();
    
    // 1. Delete expired rows
    await supabase
      .from('rate_limits')
      .delete()
      .lt('expire_at', nowStr);

    // 2. Fetch current points and expiration
    const { data: row, error: fetchErr } = await supabase
      .from('rate_limits')
      .select('points, expire_at')
      .eq('key', key)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const expireAtDate = new Date(Date.now() + windowMs);
    const expireAtStr = expireAtDate.toISOString();

    if (!row) {
      // Create new limit entry
      const { error: insertErr } = await supabase
        .from('rate_limits')
        .insert({ key, points: 1, expire_at: expireAtStr });

      if (insertErr) throw insertErr;

      return { success: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
    }

    const currentPoints = row.points;
    const currentExpireAt = new Date(row.expire_at);
    const resetInSec = Math.max(0, Math.ceil((currentExpireAt - Date.now()) / 1000));

    if (currentPoints >= limit) {
      return { success: false, remaining: 0, resetInSec };
    }

    // Increment points
    const { error: updateErr } = await supabase
      .from('rate_limits')
      .update({ points: currentPoints + 1 })
      .eq('key', key);

    if (updateErr) throw updateErr;

    return { success: true, remaining: limit - (currentPoints + 1), resetInSec };
  } catch (err) {
    console.warn('[rate-limit] Supabase rate limit error, falling back to memory:', err.message);
    return null;
  }
}

async function getRateLimitKey(req) {
  // 1. Try Clerk Token
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (token) {
    if (!process.env.CLERK_SECRET_KEY) {
      // Clerk is not configured on server, fall back to IP rate limiting
      const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
      const cleanIp = ip.split(',')[0].trim();
      return { type: 'ip', key: `ip:${cleanIp}` };
    }
    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      });
      if (payload?.sub) {
        return { type: 'clerk', key: `clerk:${payload.sub}` };
      }
    } catch (err) {
      throw { status: 401, message: `Invalid or expired auth token: ${err.message}` };
    }
  }

  // 2. Fallback to IP
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
  const cleanIp = ip.split(',')[0].trim();
  return { type: 'ip', key: `ip:${cleanIp}` };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Rate limiting check
  let ident;
  try {
    ident = await getRateLimitKey(req);
  } catch (authErr) {
    return res.status(authErr.status || 401).json({ error: { message: authErr.message } });
  }

  const limit = ident.type === 'clerk' ? LIMIT_CLERK : LIMIT_IP;

  // Run rate limit check (try DB first, then memory fallback)
  let result = await checkDbRateLimit(ident.key, limit, WINDOW_MS);
  if (!result) {
    result = checkMemoryRateLimit(ident.key, limit, WINDOW_MS);
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + result.resetInSec * 1000) / 1000));

  if (!result.success) {
    res.setHeader('Retry-After', result.resetInSec);
    return res.status(429).json({
      error: {
        message: `Too many requests. Rate limit exceeded. Please try again in ${result.resetInSec} seconds. Signed-in users get 30 requests per 10 minutes; guest users get 5 requests per 10 minutes.`
      }
    });
  }

  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  // Prefer server-side env var; fall back to key sent from browser
  const { apiKey: clientKey, ...body } = req.body;
  const apiKey = process.env.ZENMUX_API_KEY || clientKey;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'No API key configured. Set ZENMUX_API_KEY in Vercel env vars, or paste your key in the app header.' }
    });
  }

  try {
    const upstream = await fetch(ZENMUX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return res.status(upstream.status).json({ error: { message: errorText } });
    }

    if (body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Content-Encoding', 'none'); // Disable compression buffering if any

      if (upstream.body.pipe) {
        upstream.body.pipe(res);
      } else {
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      }
      return;
    }

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: { message: `Proxy error: ${err.message}` } });
  }
}
