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
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } }  // allow base64 images for vision
};

const ZENMUX_URL = 'https://zenmux.ai/api/v1/chat/completions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
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
