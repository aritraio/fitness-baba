/**
 * /api/logs — daily logging persistence
 *
 * GET  /api/logs  → load last 30 days of logs for the current user
 * POST /api/logs  → upsert daily log (weight, calories, water, notes)
 *
 * Auth: Clerk JWT passed as Authorization: Bearer <token>
 * DB:   Supabase (service-role key, all access server-side)
 */
import { verifyToken } from '@clerk/backend';
import { createClient }  from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ── helpers ─────────────────────────────────────────────── */
async function getUserId(req) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) throw { status: 401, message: 'Missing auth token' };

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });
    return payload.sub;               // Clerk user ID
  } catch {
    throw { status: 401, message: 'Invalid or expired token' };
  }
}

function err(res, code, message) {
  return res.status(code).json({ error: message });
}

/* ── handler ─────────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let userId;
  try {
    userId = await getUserId(req);
  } catch (e) {
    return err(res, e.status || 401, e.message);
  }

  /* ── GET — fetch last 30 logs ───────────────────────────── */
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('log_date, weight, calories, water_ml, notes, workout')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(30);

    if (error) return err(res, 500, error.message);
    return res.status(200).json(data || []);
  }

  /* ── POST — upsert log entry ────────────────────────────── */
  if (req.method === 'POST') {
    const { log_date, weight, calories, water_ml, notes, workout } = req.body ?? {};
    if (!log_date) return err(res, 400, 'Missing log_date in body');

    const updateObj = {
      user_id: userId,
      log_date,
      created_at: new Date().toISOString()
    };

    if (weight !== undefined && weight !== null && weight !== '') updateObj.weight = parseFloat(weight);
    if (calories !== undefined && calories !== null && calories !== '') updateObj.calories = parseInt(calories, 10);
    if (water_ml !== undefined && water_ml !== null && water_ml !== '') updateObj.water_ml = parseInt(water_ml, 10);
    if (notes !== undefined) updateObj.notes = notes;
    if (workout !== undefined) updateObj.workout = workout;

    const { error } = await supabase
      .from('daily_logs')
      .upsert(updateObj, { onConflict: 'user_id,log_date' });

    if (error) return err(res, 500, error.message);
    return res.status(200).json({ ok: true });
  }

  return err(res, 405, 'Method not allowed');
}
