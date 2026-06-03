import { tabOverview } from './overview.js';
import { tabTimeline } from './timeline.js';
import { tabMeals } from './meals.js';
import { tabExercise } from './exercise.js';
import { tabBodyScan } from './bodyscan.js';
import { tabSkinCare } from './skincare.js';
import { tabAlerts } from './alerts.js';
import { tabCheat } from './cheat.js';
import { tabCoach } from './coach.js';
import { tabProgress } from './progress.js';

/* ══════════════════════════════════════════════════════
   DASHBOARD BUILDER
══════════════════════════════════════════════════════ */
const TABS=[
  {id:'overview', lbl:'📊 Overview'},
  {id:'timeline', lbl:'🎯 Timeline'},
  {id:'progress', lbl:'📈 Progress'},
  {id:'meals',    lbl:'🍽 Meals'},
  {id:'exercise', lbl:'💪 Exercise'},
  {id:'bodyscan', lbl:'🔬 Body Scan'},
  {id:'skincare', lbl:'✨ Skin Care'},
  {id:'alerts',   lbl:'🔔 Alerts'},
  {id:'cheat',    lbl:'🍕 Cheat Meal'},
  {id:'coach',    lbl:'🤖 AI Coach'},
];

export function buildDashboard() {
  document.getElementById('tab-bar').innerHTML=
    TABS.map((t,i)=>`<button class="tab-btn${i===0?' active':''}" onclick="switchTab('${t.id}',this)">${t.lbl}</button>`).join('');
  document.getElementById('tab-content').innerHTML=
    TABS.map((t,i)=>`<div class="tab-panel${i===0?' active':''}" id="p-${t.id}"></div>`).join('');
  tabOverview();
}

export function switchTab(id, btn) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`p-${id}`).classList.add('active');
  btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  const fn={overview:tabOverview,timeline:tabTimeline,progress:tabProgress,meals:tabMeals,exercise:tabExercise,
    bodyscan:tabBodyScan,skincare:tabSkinCare,alerts:tabAlerts,cheat:tabCheat,coach:tabCoach};
  if(fn[id]) fn[id]();
}

/* Expose to window for inline HTML handlers */
window.buildDashboard = buildDashboard;
window.switchTab = switchTab;
