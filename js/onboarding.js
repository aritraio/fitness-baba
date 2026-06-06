import { S } from './state.js';
import { goStep, showNotif, bindOpts } from './ui.js';
import { saveProfile } from './db.js';
import { timeline, daily, macros } from './calc.js';
import { bmi, bmr, tdee, bmiCat } from './calc.js';
import { buildDashboard } from './dashboard.js';
import { renderDots } from './ui.js';
import { STEPS } from './state.js';
import { t } from './i18n.js';

/* ══════════════════════════════════════════════════════
   STEP 1 — BIO STATS
   ══════════════════════════════════════════════════════ */
export function step1(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_01')}</div>
    <div class="card-title">${t('bio_stats')}</div>
    <div class="card-sub">${t('bio_sub')}</div>
    <div class="field" id="field-age">
      <label for="a-age">${t('age_label')}</label>
      <input type="number" id="a-age" value="${S.age||''}" placeholder="25" min="10" max="100" oninput="valAge()">
      <div class="err-msg" id="err-age"></div>
    </div>
    <div class="field" id="field-gender">
      <label>${t('gender_label')}</label>
      <div class="opts g3" id="g-gender">
        <div class="opt${S.gender==='Male'?' selected':''}" data-v="Male"><div class="opt-icon">♂️</div><span class="opt-lbl">${t('gender_male')}</span></div>
        <div class="opt${S.gender==='Female'?' selected':''}" data-v="Female"><div class="opt-icon">♀️</div><span class="opt-lbl">${t('gender_female')}</span></div>
        <div class="opt${S.gender==='Other'?' selected':''}" data-v="Other"><div class="opt-icon">⚧️</div><span class="opt-lbl">${t('gender_other')}</span></div>
      </div>
      <div class="err-msg" id="err-gender"></div>
    </div>
    <div class="field" id="field-ht">
      <label for="a-ht">${t('height_label')}</label>
      <input type="number" id="a-ht" value="${S.height||''}" placeholder="170" min="100" max="250" oninput="valHt()">
      <div class="err-msg" id="err-ht"></div>
    </div>
    <div class="field" id="field-wt">
      <label for="a-wt">${t('weight_label')}</label>
      <input type="number" id="a-wt" value="${S.weight||''}" placeholder="70" min="30" max="300" oninput="valWt()">
      <div class="err-msg" id="err-wt"></div>
    </div>
    <div class="field" id="field-act">
      <label>${t('act_label')}</label>
      <div class="opts g5" id="g-act">
        <div class="opt${S.activity==='Sedentary'?' selected':''}" data-v="Sedentary" data-m="1.2"><div class="opt-icon">🛋️</div><span class="opt-lbl" style="font-size:9px">${t('act_sed')}</span><span class="opt-sub">${t('act_sed_sub')}</span></div>
        <div class="opt${S.activity==='Light'?' selected':''}" data-v="Light" data-m="1.375"><div class="opt-icon">🚶</div><span class="opt-lbl" style="font-size:9px">${t('act_light')}</span><span class="opt-sub">${t('act_light_sub')}</span></div>
        <div class="opt${S.activity==='Moderate'?' selected':''}" data-v="Moderate" data-m="1.55"><div class="opt-icon">🏃</div><span class="opt-lbl" style="font-size:9px">${t('act_mod')}</span><span class="opt-sub">${t('act_mod_sub')}</span></div>
        <div class="opt${S.activity==='Active'?' selected':''}" data-v="Active" data-m="1.725"><div class="opt-icon">💪</div><span class="opt-lbl" style="font-size:9px">${t('act_act')}</span><span class="opt-sub">${t('act_act_sub')}</span></div>
        <div class="opt${S.activity==='Athlete'?' selected':''}" data-v="Athlete" data-m="1.9"><div class="opt-icon">🏋️</div><span class="opt-lbl" style="font-size:9px">${t('act_ath')}</span><span class="opt-sub">${t('act_ath_sub')}</span></div>
      </div>
      <div class="err-msg" id="err-act"></div>
    </div>
    <button class="btn" onclick="sub1()">${t('continue')}</button>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-gender'));
  bindOpts(c.querySelector('#g-act'));

  c.querySelectorAll('#g-gender .opt').forEach(o => o.addEventListener('click', () => setTimeout(valGender, 50)));
  c.querySelectorAll('#g-act .opt').forEach(o => o.addEventListener('click', () => setTimeout(valAct, 50)));
}

export function valAge() {
  const el = document.getElementById('a-age');
  const err = document.getElementById('err-age');
  const field = document.getElementById('field-age');
  if (!el || !err || !field) return false;
  const v = +el.value;
  if (!el.value) {
    err.textContent = t('err_age');
    field.classList.add('has-error');
    return false;
  }
  if (v < 10 || v > 100) {
    err.textContent = t('err_age_range');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function valHt() {
  const el = document.getElementById('a-ht');
  const err = document.getElementById('err-ht');
  const field = document.getElementById('field-ht');
  if (!el || !err || !field) return false;
  const v = +el.value;
  if (!el.value) {
    err.textContent = t('err_ht');
    field.classList.add('has-error');
    return false;
  }
  if (v < 100 || v > 250) {
    err.textContent = t('err_ht_range');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function valWt() {
  const el = document.getElementById('a-wt');
  const err = document.getElementById('err-wt');
  const field = document.getElementById('field-wt');
  if (!el || !err || !field) return false;
  const v = +el.value;
  if (!el.value) {
    err.textContent = t('err_wt');
    field.classList.add('has-error');
    return false;
  }
  if (v < 30 || v > 300) {
    err.textContent = t('err_wt_range');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function valGender() {
  const gOpt = document.querySelector('#g-gender .opt.selected');
  const err = document.getElementById('err-gender');
  const field = document.getElementById('field-gender');
  if (!err || !field) return false;
  if (!gOpt) {
    err.textContent = t('err_gender');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function valAct() {
  const aOpt = document.querySelector('#g-act .opt.selected');
  const err = document.getElementById('err-act');
  const field = document.getElementById('field-act');
  if (!err || !field) return false;
  if (!aOpt) {
    err.textContent = t('err_act');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function sub1() {
  const ageVal = valAge();
  const htVal = valHt();
  const wtVal = valWt();
  const gVal = valGender();
  const aVal = valAct();

  if (!ageVal || !htVal || !wtVal || !gVal || !aVal) {
    showNotif('Please fix the validation errors before continuing.', 'Invalid Information');
    return;
  }

  const age=+document.getElementById('a-age').value;
  const ht=+document.getElementById('a-ht').value;
  const wt=+document.getElementById('a-wt').value;
  const gOpt=document.querySelector('#g-gender .opt.selected');
  const aOpt=document.querySelector('#g-act .opt.selected');

  S.age=age; S.height=ht; S.weight=wt;
  S.gender=gOpt.dataset.v; S.activity=aOpt.dataset.v; S.actMult=+aOpt.dataset.m;
  goStep(2);
}

/* ══════════════════════════════════════════════════════
   STEP 2 — GOAL
   ══════════════════════════════════════════════════════ */
export function step2(ob) {
  const tCal = Math.round(tdee());
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_02')}</div>
    <div class="card-title">${t('goal_title')}</div>
    <div class="card-sub">${t('goal_sub')} <span style="color:var(--accent);font-weight:700">${tCal} kcal/day</span></div>
    <div class="field" id="field-goal">
      <div class="opts g2" id="g-goal">
        <div class="opt${S.goalLabel==='Aggressive Loss'?' selected':''}" data-v="-750" data-l="Aggressive Loss"><div class="opt-icon">🔥</div><span class="opt-lbl">${t('goal_agg_loss')}</span><span class="opt-sub">${t('goal_agg_loss_sub')}</span></div>
        <div class="opt${S.goalLabel==='Steady Loss'?' selected':''}" data-v="-350" data-l="Steady Loss"><div class="opt-icon">📉</div><span class="opt-lbl">${t('goal_std_loss')}</span><span class="opt-sub">${t('goal_std_loss_sub')}</span></div>
        <div class="opt${S.goalLabel==='Maintain'?' selected':''}" data-v="0" data-l="Maintain"><div class="opt-icon">⚖️</div><span class="opt-lbl">${t('goal_maintain')}</span><span class="opt-sub">${t('goal_maintain_sub')}</span></div>
        <div class="opt${S.goalLabel==='Lean Bulk'?' selected':''}" data-v="250" data-l="Lean Bulk"><div class="opt-icon">📈</div><span class="opt-lbl">${t('goal_lean_bulk')}</span><span class="opt-sub">${t('goal_lean_bulk_sub')}</span></div>
        <div class="opt${S.goalLabel==='Heavy Bulk'?' selected':''}" data-v="500" data-l="Heavy Bulk" style="grid-column:span 2"><div class="opt-icon">💥</div><span class="opt-lbl">${t('goal_heavy_bulk')}</span><span class="opt-sub">${t('goal_heavy_bulk_sub')}</span></div>
      </div>
      <div class="err-msg" id="err-goal"></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(1)">${t('back')}</button>
      <button class="btn" onclick="sub2()">${t('continue')}</button>
    </div>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-goal'));

  c.querySelectorAll('#g-goal .opt').forEach(o => o.addEventListener('click', () => setTimeout(valGoal, 50)));
}

export function valGoal() {
  const o = document.querySelector('#g-goal .opt.selected');
  const err = document.getElementById('err-goal');
  const field = document.getElementById('field-goal');
  if (!err || !field) return false;
  if (!o) {
    err.textContent = t('err_goal');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function sub2() {
  if (!valGoal()) {
    showNotif('Please select a health goal.', 'Goal Required');
    return;
  }
  const o=document.querySelector('#g-goal .opt.selected');
  S.goal=+o.dataset.v; S.goalLabel=o.dataset.l; goStep(3);
}

/* ══════════════════════════════════════════════════════
   STEP 3 — WEIGHT TARGET
   ══════════════════════════════════════════════════════ */
export function step3(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_03')}</div>
    <div class="card-title">${t('target_title')}</div>
    <div class="card-sub">${t('target_sub')}</div>
    <div class="field" id="field-tw">
      <label for="a-tw">${t('target_weight_label')}</label>
      <input type="number" id="a-tw" value="${S.targetWeight||''}" placeholder="${S.weight}" min="30" max="300" oninput="updTL()">
      <div class="err-msg" id="err-tw"></div>
    </div>
    <div class="field">
      <div class="range-row"><span>${t('pace_label')}</span><span class="range-val" id="pv">${S.pace} kg/week</span></div>
      <input type="range" min=".25" max="1" step=".25" value="${S.pace}"
        oninput="document.getElementById('pv').textContent=this.value+' kg/week';S.pace=+this.value;updTL()">
      <div class="range-hints"><span>.25 kg/wk</span><span>1.0 kg/wk</span></div>
    </div>
    <div class="tl-preview" id="tl">
      <div class="tl-row"><span class="tl-lbl">${t('current_label')}</span><span class="tl-val">${S.weight} kg</span></div>
      <div class="tl-row"><span class="tl-lbl">${t('target_label')}</span><span class="tl-val" id="tl-t">— kg</span></div>
      <div class="tl-row"><span class="tl-lbl">${t('duration_label')}</span><span class="tl-val" id="tl-w">—</span></div>
      <div class="tl-row"><span class="tl-lbl">${t('est_end_label')}</span><span class="tl-val" id="tl-d">—</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(2)">${t('back')}</button>
      <button class="btn" onclick="sub3()">${t('continue')}</button>
    </div>`;
  ob.appendChild(c);
  if(S.targetWeight) updTL();
}

export function valTw() {
  const el = document.getElementById('a-tw');
  const err = document.getElementById('err-tw');
  const field = document.getElementById('field-tw');
  if (!el || !err || !field) return false;
  const v = +el.value;
  if (!el.value) {
    err.textContent = t('err_tw');
    field.classList.add('has-error');
    return false;
  }
  if (v < 30 || v > 300) {
    err.textContent = t('err_tw_range');
    field.classList.add('has-error');
    return false;
  }
  if (S.goal < 0 && v >= S.weight) {
    err.textContent = `Target weight must be less than current weight (${S.weight} kg) for weight loss`;
    field.classList.add('has-error');
    return false;
  }
  if (S.goal > 0 && v <= S.weight) {
    err.textContent = `Target weight must be greater than current weight (${S.weight} kg) for bulking`;
    field.classList.add('has-error');
    return false;
  }
  if (S.goal === 0 && v !== S.weight) {
    err.textContent = `Target weight should equal current weight (${S.weight} kg) for maintenance`;
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function updTL() {
  const tInput = document.getElementById('a-tw');
  if (!tInput) return;
  const tVal = +tInput.value;
  if(!tVal) return;
  S.targetWeight=tVal;
  const isValid = valTw();
  const tlPreview = document.getElementById('tl');
  if (!isValid) {
    if (tlPreview) tlPreview.style.opacity = '0.4';
    return;
  }
  if (tlPreview) tlPreview.style.opacity = '1';
  const tl=timeline();
  document.getElementById('tl-t').textContent=tVal+' kg';
  document.getElementById('tl-w').textContent=`${tl.weeks} weeks (${tl.months} months)`;
  document.getElementById('tl-d').textContent=tl.end.toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
}

export function sub3() {
  if (!valTw()) {
    showNotif('Please enter a valid target weight.', 'Target Weight Required');
    return;
  }
  goStep(4);
}

/* ══════════════════════════════════════════════════════
   STEP 4 — DIET & PANTRY
   ══════════════════════════════════════════════════════ */
export function step4(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_04')}</div>
    <div class="card-title">${t('diet_title')}</div>
    <div class="card-sub">${t('diet_sub')}</div>
    <div class="field" id="field-diet">
      <label>${t('diet_label')}</label>
      <div class="opts g3" id="g-diet">
        <div class="opt${S.diet==='Vegan'?' selected':''}" data-v="Vegan"><div class="opt-icon">🌱</div><span class="opt-lbl">${t('vegan')}</span></div>
        <div class="opt${S.diet==='Vegetarian'?' selected':''}" data-v="Vegetarian"><div class="opt-icon">🥗</div><span class="opt-lbl">${t('vegetarian')}</span></div>
        <div class="opt${S.diet==='Non-Veg'?' selected':''}" data-v="Non-Veg"><div class="opt-icon">🍗</div><span class="opt-lbl">${t('non_veg')}</span></div>
      </div>
      <div class="err-msg" id="err-diet"></div>
    </div>
    <div class="field">
      <label for="ci">${t('pantry_label')}</label>
      <div class="chip-wrap" id="chips">
        <input type="text" class="chip-inp" id="ci" placeholder="e.g. chicken, paneer, oats…" onkeydown="addChip(event)">
      </div>
      <div id="chip-count" style="font-size:10px;color:var(--muted)">${S.pantry.length}/5 ingredients</div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(3)">${t('back')}</button>
      <button class="btn" onclick="sub4()">${t('continue')}</button>
    </div>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-diet'));
  renderChips();

  c.querySelectorAll('#g-diet .opt').forEach(o => o.addEventListener('click', () => setTimeout(valDiet, 50)));
}
export function addChip(e) {
  if(e.key!=='Enter') return; e.preventDefault();
  const inp=document.getElementById('ci');
  const v=inp.value.trim();
  if(!v||S.pantry.length>=5||S.pantry.includes(v)) return;
  S.pantry.push(v); inp.value=''; renderChips();
}
export function rmChip(v) {
  S.pantry=S.pantry.filter(p=>p!==v); renderChips();
}
export function renderChips() {
  const wrap=document.getElementById('chips');
  const inp=document.getElementById('ci');
  if(!wrap||!inp) return;
  wrap.querySelectorAll('.chip').forEach(c=>c.remove());
  S.pantry.forEach(p=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.innerHTML=`${p}<span class="x" onclick="rmChip('${p}')">✕</span>`;
    wrap.insertBefore(chip, inp);
  });
  const cc=document.getElementById('chip-count');
  if(cc) cc.textContent=`${S.pantry.length}/5 ingredients`;
}
export function valDiet() {
  const o = document.querySelector('#g-diet .opt.selected');
  const err = document.getElementById('err-diet');
  const field = document.getElementById('field-diet');
  if (!err || !field) return false;
  if (!o) {
    err.textContent = t('err_diet');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}
export function sub4() {
  if (!valDiet()) {
    showNotif('Please select a diet preference.', 'Diet Required');
    return;
  }
  const o=document.querySelector('#g-diet .opt.selected');
  S.diet=o.dataset.v; goStep(5);
}

/* ══════════════════════════════════════════════════════
   STEP 5 — REMINDERS
   ══════════════════════════════════════════════════════ */
export function step5(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_05')}</div>
    <div class="card-title">${t('rem_title')}</div>
    <div class="card-sub">${t('rem_sub')}</div>
    <div class="field" id="field-bf">
      <label for="r-bf">${t('bf_label')}</label>
      <input type="time" id="r-bf" value="${S.reminders.breakfast}" onchange="valTime('bf', 'Breakfast')">
      <div class="err-msg" id="err-bf"></div>
    </div>
    <div class="field" id="field-ln">
      <label for="r-ln">${t('ln_label')}</label>
      <input type="time" id="r-ln" value="${S.reminders.lunch}" onchange="valTime('ln', 'Lunch')">
      <div class="err-msg" id="err-ln"></div>
    </div>
    <div class="field" id="field-dn">
      <label for="r-dn">${t('dn_label')}</label>
      <input type="time" id="r-dn" value="${S.reminders.dinner}" onchange="valTime('dn', 'Dinner')">
      <div class="err-msg" id="err-dn"></div>
    </div>
    <div class="field" id="field-wo">
      <label for="r-wo">${t('wo_label')}</label>
      <input type="time" id="r-wo" value="${S.reminders.workout}" onchange="valTime('wo', 'Workout')">
      <div class="err-msg" id="err-wo"></div>
    </div>
    <div class="field">
      <div class="range-row"><span>${t('wo_days_label')}</span><span class="range-val" id="wdv">${S.reminders.workoutDays} days</span></div>
      <input type="range" min="1" max="7" step="1" value="${S.reminders.workoutDays}"
        oninput="document.getElementById('wdv').textContent=this.value+' days';S.reminders.workoutDays=+this.value">
      <div class="range-hints"><span>1 day</span><span>7 days</span></div>
    </div>
    <div class="field">
      <div class="range-row"><span>${t('water_rem_label')}</span><span class="range-val" id="wiv">${S.reminders.waterInterval} min</span></div>
      <input type="range" min="30" max="180" step="15" value="${S.reminders.waterInterval}"
        oninput="document.getElementById('wiv').textContent=this.value+' min';S.reminders.waterInterval=+this.value">
      <div class="range-hints"><span>30 min</span><span>3 hours</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(4)">${t('back')}</button>
      <button class="btn" onclick="sub5()">${t('continue')}</button>
    </div>`;
  ob.appendChild(c);
}

export function valTime(id, label) {
  const el = document.getElementById(`r-${id}`);
  const err = document.getElementById(`err-${id}`);
  const field = document.getElementById(`field-${id}`);
  if (!el || !err || !field) return false;
  if (!el.value) {
    err.textContent = label + " " + t('err_time');
    field.classList.add('has-error');
    return false;
  }
  err.textContent = '';
  field.classList.remove('has-error');
  return true;
}

export function sub5() {
  const bfVal = valTime('bf', 'Breakfast');
  const lnVal = valTime('ln', 'Lunch');
  const dnVal = valTime('dn', 'Dinner');
  const woVal = valTime('wo', 'Workout');

  if (!bfVal || !lnVal || !dnVal || !woVal) {
    showNotif('Please fix the validation errors before continuing.', 'Invalid Information');
    return;
  }

  S.reminders.breakfast=document.getElementById('r-bf').value;
  S.reminders.lunch=document.getElementById('r-ln').value;
  S.reminders.dinner=document.getElementById('r-dn').value;
  S.reminders.workout=document.getElementById('r-wo').value;
  goStep(6);
}

/* ══════════════════════════════════════════════════════
   STEP 6 — LAUNCH
   ══════════════════════════════════════════════════════ */
export function step6(ob) {
  const b=bmi().toFixed(1), bc=bmiCat(+b);
  const d=Math.round(daily()), br=Math.round(bmr()), td=Math.round(tdee());
  const tl=timeline();
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">${t('step_06')}</div>
    <div class="card-title">${t('launch_title')}</div>
    <div class="card-sub">${t('launch_sub')}</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-lbl">BMI</div><div class="stat-val" style="color:${bc.color}">${b}</div><div class="stat-unit">${bc.label}</div></div>
      <div class="stat-box"><div class="stat-lbl">Daily Target</div><div class="stat-val">${d}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">BMR</div><div class="stat-val" style="font-size:20px">${br}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">TDEE</div><div class="stat-val" style="font-size:20px">${td}</div><div class="stat-unit">kcal/day</div></div>
    </div>
    <div style="background:rgba(0,229,192,.05);border:1px solid rgba(0,229,192,.12);border-radius:10px;padding:13px;margin-bottom:16px">
      <div style="font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">${t('summary_title')}</div>
      <div style="font-size:11px;line-height:2.1;color:var(--text)">
        <span>👤 ${S.age}yo ${S.gender}, ${S.height}cm, ${S.weight}kg</span><br>
        <span>🏃 Activity: ${S.activity} (×${S.actMult})</span><br>
        <span>🎯 Goal: ${S.goalLabel}</span><br>
        <span>🥗 Diet: ${S.diet}${S.pantry.length?` · ${S.pantry.join(', ')}`:''}</span><br>
        <span>📍 Target: ${S.targetWeight}kg @ ${S.pace}kg/wk · ${tl.weeks} weeks</span>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(5)">${t('back')}</button>
      <button class="btn" onclick="launch()">${t('launch_btn')}</button>
    </div>`;
  ob.appendChild(c);
}
export async function launch() {
  document.getElementById('onboarding').style.display='none';
  renderDots(STEPS+1);
  document.getElementById('dashboard').style.display='block';
  buildDashboard();
  await saveProfile();
  showNotif('Dashboard loaded — all systems go.','FitnessBaba Ready 🚀');
}

/* Expose to window for inline HTML handlers */
window.step1 = step1;
window.valAge = valAge;
window.valHt = valHt;
window.valWt = valWt;
window.valGender = valGender;
window.valAct = valAct;
window.sub1 = sub1;
window.step2 = step2;
window.valGoal = valGoal;
window.sub2 = sub2;
window.step3 = step3;
window.valTw = valTw;
window.updTL = updTL;
window.sub3 = sub3;
window.step4 = step4;
window.valDiet = valDiet;
window.addChip = addChip;
window.rmChip = rmChip;
window.renderChips = renderChips;
window.sub4 = sub4;
window.step5 = step5;
window.valTime = valTime;
window.sub5 = sub5;
window.step6 = step6;
window.launch = launch;
