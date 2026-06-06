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
import { t } from './i18n.js';

/* ══════════════════════════════════════════════════════
   DASHBOARD BUILDER
   ══════════════════════════════════════════════════════ */
const TABS=[
  {id:'overview', lblKey:'tab_overview'},
  {id:'timeline', lblKey:'tab_timeline'},
  {id:'progress', lblKey:'tab_progress'},
  {id:'meals',    lblKey:'tab_meals'},
  {id:'exercise', lblKey:'tab_exercise'},
  {id:'bodyscan', lblKey:'tab_bodyscan'},
  {id:'skincare', lblKey:'tab_skincare'},
  {id:'alerts',   lblKey:'tab_alerts'},
  {id:'cheat',    lblKey:'tab_cheat'},
  {id:'coach',    lblKey:'tab_coach'},
];

export function buildDashboard() {
  const tabBar = document.getElementById('tab-bar');
  tabBar.setAttribute('role', 'tablist');
  tabBar.setAttribute('aria-label', 'Dashboard Tabs');
  
  tabBar.innerHTML=
    TABS.map((tTab,i)=>`<button id="tab-${tTab.id}" role="tab" aria-selected="${i===0?'true':'false'}" aria-controls="p-${tTab.id}" class="tab-btn${i===0?' active':''}" onclick="switchTab('${tTab.id}',this)">${t(tTab.lblKey)}</button>`).join('');
  
  document.getElementById('tab-content').innerHTML=
    TABS.map((tTab,i)=>`<div role="tabpanel" id="p-${tTab.id}" aria-labelledby="tab-${tTab.id}" class="tab-panel${i===0?' active':''}"></div>`).join('');
  
  tabOverview();
}

export function switchTab(id, btn) {
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  
  const panel = document.getElementById(`p-${id}`);
  if (panel) panel.classList.add('active');
  
  btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  const fn={overview:tabOverview,timeline:tabTimeline,progress:tabProgress,meals:tabMeals,exercise:tabExercise,
    bodyscan:tabBodyScan,skincare:tabSkinCare,alerts:tabAlerts,cheat:tabCheat,coach:tabCoach};
  if(fn[id]) fn[id]();
}

/* Expose to window for inline HTML handlers */
window.buildDashboard = buildDashboard;
window.switchTab = switchTab;
