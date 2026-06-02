# FitnessBaba — Improvements Roadmap

> A prioritized list of improvements to make this project **resume-worthy** and **production-grade**.

---

## 🏆 Tier 1 — High-Impact Resume Differentiators

### 1. Progress Tracking Dashboard with Charts
- **What**: Track weight, calories, and workouts over time. Store daily logs in Supabase and render trend charts using [Chart.js](https://www.chartjs.org/).
- **Why**: The app is currently stateless per session — every AI plan is generated fresh and forgotten. A progress tracker shows understanding of **data modelling, time-series storage, and data visualization**.
- **Complexity**: Medium
- **Resume signal**: Full-stack data persistence + visualization

```sql
CREATE TABLE daily_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES profiles(user_id),
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  weight     NUMERIC,
  calories   INTEGER,
  water_ml   INTEGER,
  workout    JSONB,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);
```

---

### 2. Streaming AI Responses (SSE)
- **What**: Stream tokens as they arrive using **Server-Sent Events** instead of waiting 5–15s for a blank spinner.
- **Why**: Demonstrates knowledge of **streaming protocols, chunked transfer encoding**, and real-time UX — hot topics in AI engineering.
- **Complexity**: Medium
- **Files to modify**: `api/chat.js`, `js/api.js`

---

### 3. PWA (Progressive Web App) Support
- **What**: Add `manifest.json`, a service worker for offline caching, and an install prompt. Make the app installable on phones.
- **Why**: A fitness app on the home screen is **10x more impressive** in a demo. Shows understanding of the **app lifecycle, caching strategies, and mobile-first thinking**.
- **Complexity**: Low–Medium

---

### 4. Error Boundaries & Offline Handling
- **What**: Retry with exponential backoff, offline detection with queued saves, graceful degradation with cached data.
- **Why**: Production-grade error handling separates hobby projects from professional work.
- **Complexity**: Medium

---

## 🔧 Tier 2 — Engineering Quality

### 5. Migrate to ES Modules
- **What**: Replace 18 global `<script>` tags with `import`/`export` + a bundler like Vite.
- **Why**: Global scope pollution is the #1 code smell a reviewer would notice. ES modules show understanding of **modern JS tooling and dependency graphs**.
- **Complexity**: Medium

---

### 6. Input Sanitization & XSS Protection
- **What**: The coach chat and other tabs inject user/AI text via `.innerHTML` with no escaping. Create a `sanitize()` helper and apply everywhere.
- **Why**: Security awareness is a **must-have** signal. Finding and fixing your own XSS shows maturity.
- **Complexity**: Low

```js
// Vulnerable (current)
um.innerHTML = `<div>${msg.replace(/\n/g,'<br>')}</div>`;

// Fixed
function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}
um.innerHTML = `<div>${sanitize(msg).replace(/\n/g,'<br>')}</div>`;
```

---

### 7. Unit Tests
- **What**: Add tests for `calc.js` (BMI/BMR/TDEE/macros) and integration tests for the API proxy using Vitest or Jest.
- **Why**: The calc functions are pure and stateless — perfect test targets. Shows you care about **correctness and regression prevention**.
- **Complexity**: Low

```js
test('BMI calculation for 70kg, 170cm', () => {
  S.weight = 70; S.height = 170;
  expect(bmi()).toBeCloseTo(24.22, 1);
});

test('Macro split for calorie deficit', () => {
  S.goal = -350;
  const m = macros();
  expect(m.protein + m.carbs + m.fat).toBeGreaterThan(0);
});
```

---

### 8. Rate Limiting on API Proxy
- **What**: `api/chat.js` is wide open — anyone can spam it and burn API credits. Add per-user rate limiting via Clerk user ID or IP.
- **Why**: Shows thinking about **cost management, API security, and production ops**.
- **Complexity**: Low

---

### 9. Accessibility (a11y)
- **What**: Add ARIA labels, keyboard navigation, `prefers-reduced-motion` support, and proper focus management.
- **Why**: Accessibility is increasingly a **hard requirement** at companies. Mentioning a11y compliance stands out.
- **Complexity**: Low–Medium

---

## ✨ Tier 3 — Polish & Delight

### 10. Export / Share Functionality
- Export meal plans as PDF or share progress as a card image (using `html2canvas`).

### 11. Multi-Language Support (i18n)
- Formalize the Hindi/English mixing with proper locale files and a language toggle.

### 12. Dark/Light Theme Toggle
- Add a theme toggle respecting `prefers-color-scheme`. CSS custom properties are already in use.

### 13. Onboarding Validation & UX Polish
- Inline validation messages, bounds checking, animated step transitions, and a progress bar.

### 14. Workout Completion Tracking
- Wire up the existing exercise checkboxes to persist completion state to Supabase.

---

## 📋 Priority Action Plan

| # | Improvement | Time | Resume Impact |
|---|-------------|------|---------------|
| 1 | Progress Tracking + Charts | 2–3 days | ⭐⭐⭐⭐⭐ |
| 2 | Streaming AI Responses (SSE) | 1 day | ⭐⭐⭐⭐ |
| 3 | Unit Tests for `calc.js` | 2–3 hours | ⭐⭐⭐⭐ |
| 4 | XSS Fix + Sanitization | 1–2 hours | ⭐⭐⭐ |
| 5 | PWA Support | 1 day | ⭐⭐⭐ |
| 6 | ES Modules Migration | 1–2 days | ⭐⭐⭐ |

> **After these 6 improvements, your resume bullet becomes:**
>
> *"Built a full-stack AI-powered fitness platform with Clerk auth, Supabase persistence, SSE streaming, vision-based body analysis, and progress tracking — deployed on Vercel with unit tests and XSS-hardened inputs."*

---

## 🌐 Hosting Guide — Free & Minimal Cost

### Recommended Stack (All Free Tier)

| Service | Purpose | Free Tier | Cost After Free |
|---------|---------|-----------|-----------------|
| [**Vercel**](https://vercel.com) | Frontend + Serverless API | 100 GB bandwidth, 100K function invocations/month | $20/mo Pro |
| [**Supabase**](https://supabase.com) | PostgreSQL Database | 500 MB DB, 1 GB storage, 2 GB bandwidth, 50K monthly active users | $25/mo Pro |
| [**Clerk**](https://clerk.com) | Authentication | 10,000 monthly active users | $25/mo Pro |
| [**ZenMux**](https://zenmux.ai) | AI Model Gateway | Pay-per-use (depends on model) | ~$0.002–0.01/request |

**Total monthly cost: $0** (within free tiers) — you only pay for the AI API calls.

---

### Step-by-Step Deployment

#### 1. Supabase Setup (Database)
```bash
# 1. Go to supabase.com → New Project → choose a region close to you
# 2. Go to SQL Editor → paste contents of supabase/schema.sql → Run
# 3. Go to Settings → API → copy:
#    - Project URL      → SUPABASE_URL
#    - service_role key  → SUPABASE_SERVICE_ROLE_KEY (keep secret!)
```

#### 2. Clerk Setup (Auth)
```bash
# 1. Go to dashboard.clerk.com → Create Application
# 2. Enable Email + Google OAuth sign-in methods
# 3. Copy:
#    - Publishable Key → paste into <meta name="clerk-pk"> in index.html
#    - Secret Key      → CLERK_SECRET_KEY (for Vercel env vars)
```

#### 3. ZenMux Setup (AI Gateway)
```bash
# 1. Go to zenmux.ai → Sign up → Create API Key
# 2. Copy the key → ZENMUX_API_KEY (for Vercel env vars)
```

#### 4. Vercel Deployment
```bash
# 1. Push code to GitHub
git add -A && git commit -m "ready for deploy" && git push

# 2. Go to vercel.com → Add New Project → Import your GitHub repo

# 3. Add Environment Variables in Vercel dashboard (Settings → Env Vars):
#    SUPABASE_URL               = https://xxxx.supabase.co
#    SUPABASE_SERVICE_ROLE_KEY   = eyJhbGci...
#    CLERK_SECRET_KEY            = sk_test_...
#    ZENMUX_API_KEY              = zm_...

# 4. Click Deploy — done!
```

#### 5. Custom Domain (Optional, ~$10/year)
```bash
# Buy a domain from Namecheap / Cloudflare (~$10/year for .com)
# In Vercel: Settings → Domains → Add your domain
# Update DNS as Vercel instructs (usually just a CNAME record)
```

---

### Cost Optimization Tips

1. **Cache AI responses** — If two users with similar profiles ask for the same meal plan, serve a cached version instead of calling the API again. Saves ~70% on API costs.
2. **Use cheaper models for simple tasks** — Use `gpt-4o-mini` or `gemini-2.0-flash` for meal/workout generation, reserve `gpt-4o` for vision (body scan, skin care).
3. **Set token limits** — The current `max_tokens: 2048` is fine, but consider lowering it for simple responses (coach chat → 512 tokens).
4. **Monitor usage** — Set up billing alerts on ZenMux and Supabase to avoid surprises.

---

### Alternative Free Hosting Options

| Option | Pros | Cons |
|--------|------|------|
| **Vercel** (recommended) | Auto-deploys, serverless functions, free SSL | 100K function calls/mo limit |
| **Netlify** | Similar to Vercel, good free tier | Serverless functions need adaptation |
| **Cloudflare Pages** | Unlimited bandwidth, Workers for API | Different serverless runtime (not Node.js) |
| **Railway** | Full Node.js server, free trial | $5/mo after trial, limited free hours |
| **Render** | Free static hosting, free web services | Free tier spins down after 15 min inactivity |

> **Bottom line**: Stick with **Vercel + Supabase + Clerk** — all three have generous free tiers, and your app is already configured for this stack. You'll pay $0/month unless you get significant traffic.
