import { S } from './state.js';
import { callAPI, parseArr } from './api.js';
import { sanitize, showNotif } from './ui.js';
import { saveProfile } from './db.js';
import { getAuthToken } from './auth.js';
import { loadDailyLogs } from './progress.js';

/* ══════════════════════════════════════════════════════
   TAB 4 — EXERCISE
══════════════════════════════════════════════════════ */
export function tabExercise() {
  const p=document.getElementById('p-exercise');
  if(p.dataset.built) return;
  p.dataset.built='1';
  p.innerHTML=`
    <div class="sec-hdr"><div class="sec-title">Workout Plan</div></div>
    <div class="card" style="margin:0 0 13px;text-align:center">
      <div style="font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.7">
        <strong style="color:var(--text)">${S.reminders.workoutDays}-day/week</strong> program<br>
        Optimized for <strong style="color:var(--accent)">${S.goalLabel}</strong>
      </div>
      <div class="btn-row">
        <button class="btn" onclick="genWorkout()">Generate My Workout Plan</button>
        <button class="btn btn-ghost" id="workout-export-btn" onclick="window.exportWorkoutPlan()" style="display:none">Export PDF 📄</button>
      </div>
    </div>
    <div id="workout-out"></div>`;

  if (S.plans && S.plans.workout) {
    renderWorkout(S.plans.workout);
    syncWorkoutCheckboxes();
  }
}

export function renderWorkout(days) {
  const out = document.getElementById('workout-out');
  if (!out) return;
  out.innerHTML = days.map((d, dayIdx) => `
    <div class="day-card">
      <div class="day-hdr">
        <div><div class="day-title">${sanitize(d.day)}</div><div class="day-meta">${sanitize(d.focus)}</div></div>
        <div class="day-meta">⏱ ${sanitize(d.duration)}</div>
      </div>
      ${(d.exercises||[]).map((ex, exIdx)=>`
        <div class="ex-item">
          <input type="checkbox" class="ex-check" data-day="${dayIdx}" data-ex="${exIdx}" onchange="toggleExercise(this, ${dayIdx}, ${exIdx})">
          <div class="ex-info">
            <div class="ex-name">${sanitize(ex.name)}</div>
            <div class="ex-meta">${sanitize(ex.sets)} sets × ${sanitize(ex.reps)} reps · Rest: ${sanitize(ex.rest)}</div>
            ${ex.tip?`<div class="ex-tip">${sanitize(ex.tip)}</div>`:''}
          </div>
        </div>`).join('')}
    </div>`).join('');
  const exportBtn = document.getElementById('workout-export-btn');
  if (exportBtn) exportBtn.style.display = 'block';
}

export async function syncWorkoutCheckboxes() {
  const token = await getAuthToken();
  if (!token) return;
  const today = new Date().toLocaleDateString('sv').substring(0, 10);
  try {
    const logs = await loadDailyLogs();
    const todayLog = logs.find(l => l.log_date === today);
    if (todayLog && todayLog.workout && todayLog.workout.completed) {
      const completed = todayLog.workout.completed;
      document.querySelectorAll('.ex-check').forEach(cb => {
        const dayIdx = cb.dataset.day;
        const exIdx = cb.dataset.ex;
        const key = `${dayIdx}_${exIdx}`;
        if (completed[key]) {
          cb.checked = true;
          cb.closest('.ex-item').classList.add('done');
        } else {
          cb.checked = false;
          cb.closest('.ex-item').classList.remove('done');
        }
      });
    }
  } catch (e) {
    console.warn('[workout sync] failed to precheck items:', e.message);
  }
}

export async function toggleExercise(checkbox, dayIdx, exIdx) {
  const isChecked = checkbox.checked;
  checkbox.closest('.ex-item').classList.toggle('done', isChecked);

  if (S.plans && S.plans.workout && S.plans.workout[dayIdx] && S.plans.workout[dayIdx].exercises[exIdx]) {
    S.plans.workout[dayIdx].exercises[exIdx].done = isChecked;
    await saveProfile();
  }

  const token = await getAuthToken();
  if (!token) return;

  const today = new Date().toLocaleDateString('sv').substring(0, 10);
  try {
    const logs = await loadDailyLogs();
    const todayLog = logs.find(l => l.log_date === today) || {};
    const existingWorkout = todayLog.workout || {};
    const completed = existingWorkout.completed || {};

    if (isChecked) {
      completed[`${dayIdx}_${exIdx}`] = true;
    } else {
      delete completed[`${dayIdx}_${exIdx}`];
    }

    const workoutData = { completed };

    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        log_date: today,
        weight: todayLog.weight !== undefined ? todayLog.weight : null,
        calories: todayLog.calories !== undefined ? todayLog.calories : null,
        water_ml: todayLog.water_ml !== undefined ? todayLog.water_ml : null,
        notes: todayLog.notes !== undefined ? todayLog.notes : '',
        workout: workoutData
      })
    });
  } catch (err) {
    console.error('[workout sync] toggle failed:', err);
  }
}

export async function genWorkout() {
  const prompt=`You are an expert personal trainer. Create a ${S.reminders.workoutDays}-day/week workout plan.
User: ${S.age}yo ${S.gender}, ${S.weight}kg, Activity: ${S.activity}, Goal: ${S.goalLabel}
Return ONLY a valid JSON array of ${S.reminders.workoutDays} day objects:
[{"day":"Day 1","focus":"Upper Body / Chest & Triceps","duration":"45 min","exercises":[{"name":"Bench Press","sets":4,"reps":"8-10","rest":"90s","tip":"Keep shoulder blades retracted"},...]}]
Include 4-6 exercises per day. Make it progressive and goal-appropriate.`;

  const out=document.getElementById('workout-out');
  const exportBtn = document.getElementById('workout-export-btn');
  if (exportBtn) exportBtn.style.display = 'none';
  out.innerHTML=`<div class="loader"><div class="spinner"></div><div class="loader-txt">BUILDING YOUR PROGRAM...</div></div>`;
  try {
    const raw=await callAPI(prompt);
    const days=parseArr(raw);
    S.plans = S.plans || {};
    S.plans.workout = days;
    renderWorkout(days);
    syncWorkoutCheckboxes();
    await saveProfile();
  } catch(e) {
    out.innerHTML=`<div class="err-card"><p>⚠️ Could not generate workout. Check your OpenAI API key in the header.<br><br><small>${e.message}</small></p><button class="btn btn-red btn-sm" onclick="genWorkout()">Retry</button></div>`;
  }
}

/* Expose to window for inline HTML handlers */
window.tabExercise = tabExercise;
window.genWorkout = genWorkout;
window.renderWorkout = renderWorkout;
window.toggleExercise = toggleExercise;
window.syncWorkoutCheckboxes = syncWorkoutCheckboxes;
