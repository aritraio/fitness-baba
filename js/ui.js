import { S, STEPS } from './state.js';
import { step1, step2, step3, step4, step5, step6 } from './onboarding.js';

/* ══════════════════════════════════════════════════════
   TOASTS
══════════════════════════════════════════════════════ */
export function showNotif(msg, title='') {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = title ? `<strong>${title}</strong><br>${msg}` : msg;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(110%)'; t.style.transition='all .3s'; setTimeout(()=>t.remove(),320); }, 3500);
}

export function fireN(title, body) {
  if(Notification.permission==='granted') new Notification(title,{body,icon:'💪'});
  showNotif(body, title);
}

/* ══════════════════════════════════════════════════════
   PROGRESS DOTS
══════════════════════════════════════════════════════ */
export function renderDots(cur) {
  const c = document.getElementById('dots');
  if (c) {
    c.style.display = cur > STEPS ? 'none' : 'flex';
    c.innerHTML = '';
    for(let i=1;i<=STEPS;i++){
      const d=document.createElement('div');
      d.className='dot'+(i<cur?' done':i===cur?' active':'');
      c.appendChild(d);
    }
  }
  updateProgressBar(cur);
}

export function updateProgressBar(cur) {
  const wrap = document.getElementById('progress-bar-wrap');
  const bar = document.getElementById('progress-bar');
  if (!wrap || !bar) return;

  wrap.style.display = cur > STEPS ? 'none' : 'block';
  if (cur <= STEPS) {
    const pct = ((cur - 1) / (STEPS - 1)) * 100;
    bar.style.width = `${pct}%`;
  }
}

/* ══════════════════════════════════════════════════════
   OPT SELECT HELPER
   ══════════════════════════════════════════════════════ */
export function bindOpts(wrap) {
  const opts = wrap.querySelectorAll('.opt');
  wrap.setAttribute('role', 'radiogroup');
  opts.forEach(o=>{
    o.setAttribute('tabindex', '0');
    o.setAttribute('role', 'radio');
    o.setAttribute('aria-checked', o.classList.contains('selected') ? 'true' : 'false');
    o.addEventListener('click',()=>{
      opts.forEach(x=>{
        x.classList.remove('selected');
        x.setAttribute('aria-checked', 'false');
      });
      o.classList.add('selected');
      o.setAttribute('aria-checked', 'true');
    });
    o.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        o.click();
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   ONBOARDING ROUTER
   ══════════════════════════════════════════════════════ */
export function goStep(n) {
  const ob = document.getElementById('onboarding');
  const existingCard = ob.querySelector('.card');

  const renderNext = () => {
    S.step = n;
    renderDots(n);
    ob.innerHTML = '';
    if(n===1) step1(ob);
    else if(n===2) step2(ob);
    else if(n===3) step3(ob);
    else if(n===4) step4(ob);
    else if(n===5) step5(ob);
    else if(n===6) step6(ob);
    
    // Focus management: focus the first form control or the card itself
    const firstInput = ob.querySelector('input, select, textarea, [tabindex="0"]');
    if (firstInput) {
      firstInput.focus();
    } else {
      const card = ob.querySelector('.card');
      if (card) {
        card.setAttribute('tabindex', '-1');
        card.focus();
      }
    }

    window.scrollTo({top:0,behavior:'smooth'});
  };

  if (existingCard) {
    existingCard.classList.add('fade-out');
    setTimeout(renderNext, 200);
  } else {
    renderNext();
  }
}

/* ══════════════════════════════════════════════════════
   SCORE RING BUILDER
══════════════════════════════════════════════════════ */
export function buildRings(items) {
  return items.map(({score,label,color})=>{
    const r=30, circ=2*Math.PI*r;
    const offset=circ*(1-score/100);
    return `<div class="ring-item">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="rgba(30,45,56,.8)" stroke-width="6"/>
        <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="6"
          stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 40 40)"/>
        <text x="40" y="45" text-anchor="middle" fill="${color}" font-size="15" font-weight="800" font-family="Syne">${score}</text>
      </svg>
      <div class="ring-lbl" style="color:${color}">${label}</div>
    </div>`;
  }).join('');
}

export function animBars(cls) {
  document.querySelectorAll('.'+cls).forEach(el=>{
    const w=el.dataset.w||el.getAttribute('data-w');
    if(w) el.style.width=w+'%';
  });
}

/* ══════════════════════════════════════════════════════
   CORS / PROTOCOL CHECK
══════════════════════════════════════════════════════ */
export function checkProtocol() {
  if (window.location.protocol === 'file:') {
    document.getElementById('cors-banner').style.display = 'flex';
  }
}

export function copyCmd(el) {
  const cmd = el.dataset.cmd;
  navigator.clipboard.writeText(cmd).then(() => {
    const label = el.querySelector('.cors-copy');
    label.textContent = 'copied!';
    label.style.color = 'var(--accent)';
    setTimeout(() => { label.textContent = 'copy'; label.style.color = ''; }, 2000);
  }).catch(() => {
    /* fallback — select the text */
    const range = document.createRange();
    range.selectNode(el.querySelector('code'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

/* ══════════════════════════════════════════════════════
   SANITIZATION (XSS PROTECTION)
   ══════════════════════════════════════════════════════ */
export function sanitize(html) {
  if (typeof window.DOMPurify !== 'undefined') {
    return window.DOMPurify.sanitize(html);
  }
  // Safe fallback if DOMPurify is not ready
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function initTheme() {
  const saved = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (systemPrefersDark ? 'dark' : 'light');
  setTheme(theme);
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  }
  // If progress logs are available, force chart refresh to update colors
  if (window.refreshLogs && document.getElementById('p-progress')?.classList.contains('active')) {
    window.refreshLogs();
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

/* Expose to window for inline HTML handlers */
window.showNotif = showNotif;
window.fireN = fireN;
window.renderDots = renderDots;
window.bindOpts = bindOpts;
window.goStep = goStep;
window.buildRings = buildRings;
window.animBars = animBars;
window.checkProtocol = checkProtocol;
window.copyCmd = copyCmd;
window.sanitize = sanitize;
window.initTheme = initTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
