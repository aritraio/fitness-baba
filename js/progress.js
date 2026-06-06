import { S } from './state.js';
import { getAuthToken } from './auth.js';
import { sanitize, showNotif } from './ui.js';

/* ══════════════════════════════════════════════════════
   TAB — PROGRESS TRACKER (Chart.js + Logs API)
   ══════════════════════════════════════════════════════ */
let weightChart = null;

export async function tabProgress() {
  const p = document.getElementById('p-progress');
  if (!p) return;

  // Render HTML structure
  p.innerHTML = `
    <div class="card" style="margin: 0 0 14px">
      <div class="sec-hdr">
        <div class="sec-title">Log Today's Progress</div>
        <div class="sec-sub">// keep your engine tracked</div>
      </div>
      <form id="log-form" onsubmit="saveDailyLog(event)">
        <div class="stats-grid">
          <div class="field" style="margin-bottom:0">
            <label for="log-weight">Weight (kg)</label>
            <input type="number" id="log-weight" S.step = "0.1" placeholder="e.g. 72.5" min="20" max="300">
          </div>
          <div class="field" style="margin-bottom:0">
            <label for="log-calories">Calories (kcal)</label>
            <input type="number" id="log-calories" placeholder="e.g. 2100" min="0" max="10000">
          </div>
        </div>
        <div class="stats-grid" style="margin-top:10px">
          <div class="field" style="margin-bottom:0">
            <label for="log-water">Water Intake (ml)</label>
            <input type="number" id="log-water" placeholder="e.g. 2500" min="0" max="20000" S.step = "100">
          </div>
          <div class="field" style="margin-bottom:0">
            <label for="log-date">Date</label>
            <input type="date" id="log-date" required>
          </div>
        </div>
        <div class="field" style="margin-top:10px">
          <label for="log-notes">Daily Notes</label>
          <textarea id="log-notes" placeholder="How was your energy? Any specific workout done?" rows="2"></textarea>
        </div>
        <button type="submit" class="btn" style="margin-top:10px">Save Log Entry</button>
      </form>
    </div>

    <div class="card" id="progress-trend-card" style="margin: 0 0 14px">
      <div class="sec-hdr">
        <div>
          <div class="sec-title">Weight Trend</div>
          <div class="sec-sub">last 30 logged entries</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="window.exportProgressTrend()" style="width:auto; margin:0; padding:6px 12px; font-size:10px;">Share Trend 🖼️</button>
      </div>
      <div style="position: relative; width: 100%; height: 220px;">
        <canvas id="weightChart"></canvas>
      </div>
    </div>

    <div class="card" style="margin: 0 0 14px">
      <div class="sec-hdr">
        <div class="sec-title">History Logs</div>
        <div class="sec-sub">recent entries</div>
      </div>
      <div id="logs-history" style="font-size:11px; max-height: 250px; overflow-y: auto;">
        <div class="loader"><div class="spinner"></div><div class="loader-txt">Loading history...</div></div>
      </div>
    </div>
  `;

  // Set default date to today in local timezone YYYY-MM-DD
  const today = new Date().toLocaleDateString('sv').substring(0, 10);
  const dateInput = document.getElementById('log-date');
  if (dateInput) dateInput.value = today;

  // Load the logs and build chart/history
  await refreshLogs();
}

export async function loadDailyLogs() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not signed in');
  }

  const res = await fetch('/api/logs', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load logs: ${res.status}`);
  }

  return await res.json();
}

export async function refreshLogs() {
  const historyDiv = document.getElementById('logs-history');
  try {
    const logs = await loadDailyLogs();
    
    // Fill in today's values in form if they exist
    const today = document.getElementById('log-date')?.value;
    const todayLog = logs.find(l => l.log_date === today);
    if (todayLog) {
      if (todayLog.weight) document.getElementById('log-weight').value = todayLog.weight;
      if (todayLog.calories) document.getElementById('log-calories').value = todayLog.calories;
      if (todayLog.water_ml) document.getElementById('log-water').value = todayLog.water_ml;
      if (todayLog.notes) document.getElementById('log-notes').value = todayLog.notes;
    }

    renderLogsChart(logs);
    renderLogsHistory(logs);
  } catch (e) {
    console.error('[progress] refreshLogs:', e);
    if (historyDiv) {
      historyDiv.innerHTML = `<div style="color:var(--accent2); text-align:center; padding:10px;">⚠️ Auth/Database setup required to save and track logs.</div>`;
    }
  }
}

export async function saveDailyLog(event) {
  event.preventDefault();
  const token = await getAuthToken();
  if (!token) {
    showNotif('Please sign in to save logs!', 'Auth Error');
    return;
  }

  const date = document.getElementById('log-date').value;
  const weight = document.getElementById('log-weight').value;
  const calories = document.getElementById('log-calories').value;
  const water = document.getElementById('log-water').value;
  const notes = document.getElementById('log-notes').value;

  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        log_date: date,
        weight: weight || null,
        calories: calories || null,
        water_ml: water || null,
        notes: notes || ''
      })
    });

    if (!res.ok) {
      throw new Error(`Save failed: ${res.status}`);
    }

    showNotif('Progress logged successfully! 📈', 'Success');
    await refreshLogs();
  } catch (e) {
    console.error('[progress] saveDailyLog:', e);
    showNotif(e.message, 'Database Error');
  }
}

export function renderLogsChart(logs) {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;

  // We need logs sorted ascending for chart timeline
  const chartLogs = [...logs].reverse();
  const labels = chartLogs.map(l => {
    // Format date nicely like "03 Jun"
    const d = new Date(l.log_date);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  });
  const weights = chartLogs.map(l => l.weight);

  // If chart already exists, destroy it first
  if (weightChart) {
    weightChart.destroy();
  }

  if (chartLogs.length === 0) {
    // Draw empty state
    const parent = ctx.parentElement;
    parent.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--muted); font-size:11px">// No weight logs yet</div>`;
    return;
  }

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weight (kg)',
        data: weights,
        borderColor: '#00e5c0',
        backgroundColor: 'rgba(0, 229, 192, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#00e5c0',
        pointBorderColor: '#0e1418',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(30,45,56,0.3)' },
          ticks: { color: '#5a7a8a', font: { family: 'Space Mono', size: 9 } }
        },
        y: {
          grid: { color: 'rgba(30,45,56,0.3)' },
          ticks: { color: '#5a7a8a', font: { family: 'Space Mono', size: 9 } }
        }
      }
    }
  });
}

export function renderLogsHistory(logs) {
  const historyDiv = document.getElementById('logs-history');
  if (!historyDiv) return;

  if (logs.length === 0) {
    historyDiv.innerHTML = `<div style="color:var(--muted); text-align:center; padding:10px;">// No entries recorded yet</div>`;
    return;
  }

  historyDiv.innerHTML = logs.map(l => {
    const formattedDate = new Date(l.log_date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    return `
      <div style="border-bottom: 1px solid rgba(30,45,56,0.4); padding: 8px 0; display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--accent4);">${formattedDate}</strong>
          <span style="color:var(--accent); font-weight:700;">${l.weight ? l.weight + ' kg' : '—'}</span>
        </div>
        <div style="display:flex; gap:12px; color:var(--muted); font-size:10px;">
          <span>🔥 ${l.calories ? l.calories + ' kcal' : '—'}</span>
          <span>💧 ${l.water_ml ? l.water_ml + ' ml' : '—'}</span>
        </div>
        ${l.notes ? `<div style="color:var(--text); font-style:italic; font-size:10px; margin-top:2px; padding-left: 6px; border-left: 1px solid var(--border);">"${sanitize(l.notes)}"</div>` : ''}
      </div>
    `;
  }).join('');
}

/* Expose to window for inline HTML handlers */
window.tabProgress = tabProgress;
window.loadDailyLogs = loadDailyLogs;
window.refreshLogs = refreshLogs;
window.saveDailyLog = saveDailyLog;
window.renderLogsChart = renderLogsChart;
window.renderLogsHistory = renderLogsHistory;
