import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from './chat.js';

// Mock @clerk/backend
const mockVerifyToken = vi.fn();
vi.mock('@clerk/backend', () => ({
  verifyToken: (...args) => mockVerifyToken(...args),
}));

// Mock @supabase/supabase-js
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

// Mock global fetch
const originalFetch = global.fetch;

describe('api/chat Rate Limiting Proxy', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    process.env.ZENMUX_API_KEY = 'zm_test_key';
    process.env.SUPABASE_URL = 'https://xxxx.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'ey_service_role';
    process.env.CLERK_SECRET_KEY = 'sk_test_clerk';

    req = {
      method: 'POST',
      headers: {},
      body: {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'test request' }],
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.ZENMUX_API_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.CLERK_SECRET_KEY;
  });

  it('allows OPTIONS preflight requests', async () => {
    req.method = 'OPTIONS';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  });

  it('applies IP rate limiting for anonymous guests (limit of 5)', async () => {
    // Mock DB rate limit check to fail/bypass by throwing, forcing memory store fallback
    mockSupabase.maybeSingle.mockRejectedValue(new Error('Force memory fallback'));

    // Mock ZenMux upstream API call
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello' } }] }),
    });

    const ip = '192.168.1.50';

    // First 5 requests from the same IP should succeed
    for (let i = 0; i < 5; i++) {
      const tempRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn(),
      };
      const tempReq = {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: { model: 'openai/gpt-4o-mini' },
      };

      await handler(tempReq, tempRes);
      expect(tempRes.status).not.toHaveBeenCalledWith(429);
      expect(tempRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
    }

    // 6th request from the same IP should fail with 429
    const limitRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    const limitReq = {
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
      body: { model: 'openai/gpt-4o-mini' },
    };

    await handler(limitReq, limitRes);
    expect(limitRes.status).toHaveBeenCalledWith(429);
    expect(limitRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('Rate limit exceeded'),
        }),
      })
    );
  });

  it('authenticates with Clerk and applies higher limit (30) for signed-in users', async () => {
    // Mock DB check to fail, forcing memory store
    mockSupabase.maybeSingle.mockRejectedValue(new Error('Force memory fallback'));

    mockVerifyToken.mockResolvedValue({ sub: 'user_123456789' });

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello' } }] }),
    });

    const tempRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    const tempReq = {
      method: 'POST',
      headers: { 'authorization': 'Bearer mock_jwt_token' },
      body: { model: 'openai/gpt-4o-mini' },
    };

    await handler(tempReq, tempRes);
    expect(mockVerifyToken).toHaveBeenCalledWith('mock_jwt_token', { secretKey: 'sk_test_clerk' });
    expect(tempRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 30);
    expect(tempRes.status).not.toHaveBeenCalledWith(429);
  });

  it('rejects with 401 if an invalid or expired Clerk token is supplied', async () => {
    mockVerifyToken.mockRejectedValue(new Error('JWT Expired'));

    const tempRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    const tempReq = {
      method: 'POST',
      headers: { 'authorization': 'Bearer expired_token' },
      body: { model: 'openai/gpt-4o-mini' },
    };

    await handler(tempReq, tempRes);
    expect(tempRes.status).toHaveBeenCalledWith(401);
    expect(tempRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining('Invalid or expired auth token'),
        }),
      })
    );
  });
});
