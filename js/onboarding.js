import { S } from './state.js';
import { goStep, showNotif, bindOpts } from './ui.js';
import { saveProfile } from './db.js';
import { timeline, daily, macros } from './calc.js';

/* ══════════════════════════════════════════════════════
   STEP 1 — BIO STATS
══════════════════════════════════════════════════════ */
export function step1(ob) {
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 01 / 06</div>
    <div class="card-title">Bio Stats</div>
    <div class="card-sub">Tell me about your body — I'll do the math</div>
    <div class="field" id="field-age"><label>Age (years)</label>
      <input type="number" id="a-age" value="${S.age||''}" placeholder="25" min="10" max="100" oninput="valAge()">
      <div class="err-msg" id="err-age"></div>
    </div>
    <div class="field" id="field-gender"><label>Gender</label>
      <div class="opts g3" id="g-gender">
        <div class="opt${S.gender==='Male'?' selected':''}" data-v="Male"><div class="opt-icon">♂️</div><span class="opt-lbl">Male</span></div>
        <div class="opt${S.gender==='Female'?' selected':''}" data-v="Female"><div class="opt-icon">♀️</div><span class="opt-lbl">Female</span></div>
        <div class="opt${S.gender==='Other'?' selected':''}" data-v="Other"><div class="opt-icon">⚧️</div><span class="opt-lbl">Other</span></div>
      </div>
      <div class="err-msg" id="err-gender"></div>
    </div>
    <div class="field" id="field-ht"><label>Height (cm)</label>
      <input type="number" id="a-ht" value="${S.height||''}" placeholder="170" min="100" max="250" oninput="valHt()">
      <div class="err-msg" id="err-ht"></div>
    </div>
    <div class="field" id="field-wt"><label>Weight (kg)</label>
      <input type="number" id="a-wt" value="${S.weight||''}" placeholder="70" min="30" max="300" oninput="valWt()">
      <div class="err-msg" id="err-wt"></div>
    </div>
    <div class="field" id="field-act"><label>Activity Level</label>
      <div class="opts g5" id="g-act">
        <div class="opt${S.activity==='Sedentary'?' selected':''}" data-v="Sedentary" data-m="1.2"><div class="opt-icon">🛋️</div><span class="opt-lbl" style="font-size:9px">Sedentary</span><span class="opt-sub">desk job</span></div>
        <div class="opt${S.activity==='Light'?' selected':''}" data-v="Light" data-m="1.375"><div class="opt-icon">🚶</div><span class="opt-lbl" style="font-size:9px">Light</span><span class="opt-sub">1-3×/wk</span></div>
        <div class="opt${S.activity==='Moderate'?' selected':''}" data-v="Moderate" data-m="1.55"><div class="opt-icon">🏃</div><span class="opt-lbl" style="font-size:9px">Moderate</span><span class="opt-sub">3-5×/wk</span></div>
        <div class="opt${S.activity==='Active'?' selected':''}" data-v="Active" data-m="1.725"><div class="opt-icon">💪</div><span class="opt-lbl" style="font-size:9px">Active</span><span class="opt-sub">6-7×/wk</span></div>
        <div class="opt${S.activity==='Athlete'?' selected':''}" data-v="Athlete" data-m="1.9"><div class="opt-icon">🏋️</div><span class="opt-lbl" style="font-size:9px">Athlete</span><span class="opt-sub">2×/day</span></div>
      </div>
      <div class="err-msg" id="err-act"></div>
    </div>
    <button class="btn" onclick="sub1()">Continue →</button>`;
  ob.appendChild(c);
  bindOpts(c.querySelector('#g-gender'));
  bindOpts(c.querySelector('#g-act'));

  // Trigger real-time checking when options are selected
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
    err.textContent = 'Age is required';
    field.classList.add('has-error');
    return false;
  }
  if (v < 10 || v > 100) {
    err.textContent = 'Age must be between 10 and 100';
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
    err.textContent = 'Height is required';
    field.classList.add('has-error');
    return false;
  }
  if (v < 100 || v > 250) {
    err.textContent = 'Height must be between 100 and 250 cm';
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
    err.textContent = 'Weight is required';
    field.classList.add('has-error');
    return false;
  }
  if (v < 30 || v > 300) {
    err.textContent = 'Weight must be between 30 and 300 kg';
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
    err.textContent = 'Please select your gender';
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
    err.textContent = 'Please select your activity level';
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
  const t = Math.round(tdee());
  const c = document.createElement('div');
  c.className='card';
  c.innerHTML=`
    <div class="step-num">STEP 02 / 06</div>
    <div class="card-title">Your Goal</div>
    <div class="card-sub">Your TDEE: <span style="color:var(--accent);font-weight:700">${t} kcal/day</span></div>
    <div class="field" id="field-goal">
      <div class="opts g2" id="g-goal">
        <div class="opt${S.goalLabel==='Aggressive Loss'?' selected':''}" data-v="-750" data-l="Aggressive Loss"><div class="opt-icon">🔥</div><span class="opt-lbl">Aggressive Loss</span><span class="opt-sub">−750 kcal/day</span></div>
        <div class="opt${S.goalLabel==='Steady Loss'?' selected':''}" data-v="-350" data-l="Steady Loss"><div class="opt-icon">📉</div><span class="opt-lbl">Steady Loss</span><span class="opt-sub">−350 kcal/day</span></div>
        <div class="opt${S.goalLabel==='Maintain'?' selected':''}" data-v="0" data-l="Maintain"><div class="opt-icon">⚖️</div><span class="opt-lbl">Maintain</span><span class="opt-sub">±0 kcal/day</span></div>
        <div class="opt${S.goalLabel==='Lean Bulk'?' selected':''}" data-v="250" data-l="Lean Bulk"><div class="opt-icon">📈</div><span class="opt-lbl">Lean Bulk</span><span class="opt-sub">+250 kcal/day</span></div>
        <div class="opt${S.goalLabel==='Heavy Bulk'?' selected':''}" data-v="500" data-l="Heavy Bulk" style="grid-column:span 2"><div class="opt-icon">💥</div><span class="opt-lbl">Heavy Bulk</span><span class="opt-sub">+500 kcal/day</span></div>
      </div>
      <div class="err-msg" id="err-goal"></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(1)">← Back</button>
      <button class="btn" onclick="sub2()">Continue →</button>
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
    err.textContent = 'Please select a health goal';
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
    <div class="step-num">STEP 03 / 06</div>
    <div class="card-title">Weight Target</div>
    <div class="card-sub">Set your destination — I'll map the route</div>
    <div class="field" id="field-tw"><label>Target Weight (kg)</label>
      <input type="number" id="a-tw" value="${S.targetWeight||''}" placeholder="${S.weight}" min="30" max="300" oninput="updTL()">
      <div class="err-msg" id="err-tw"></div>
    </div>
    <div class="field">
      <div class="range-row"><span>Pace</span><span class="range-val" id="pv">${S.pace} kg/week</span></div>
      <input type="range" min=".25" max="1" step=".25" value="${S.pace}"
        oninput="document.getElementById('pv').textContent=this.value+' kg/week';S.pace=+this.value;updTL()">
      <div class="range-hints"><span>.25 kg/wk</span><span>1.0 kg/wk</span></div>
    </div>
    <div class="tl-preview" id="tl">
      <div class="tl-row"><span class="tl-lbl">Current</span><span class="tl-val">${S.weight} kg</span></div>
      <div class="tl-row"><span class="tl-lbl">Target</span><span class="tl-val" id="tl-t">— kg</span></div>
      <div class="tl-row"><span class="tl-lbl">Duration</span><span class="tl-val" id="tl-w">—</span></div>
      <div class="tl-row"><span class="tl-lbl">Est. End Date</span><span class="tl-val" id="tl-d">—</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(2)">← Back</button>
      <button class="btn" onclick="sub3()">Continue →</button>
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
    err.textContent = 'Target weight is required';
    field.classList.add('has-error');
    return false;
  }
  if (v < 30 || v > 300) {
    err.textContent = 'Weight must be between 30 and 300 kg';
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
  const t=+document.getElementById('a-tw').value;
  if(!t) return;
  S.targetWeight=t;
  const isValid = valTw();
  const tlPreview = document.getElementById('tl');
  if (!isValid) {
    if (tlPreview) tlPreview.style.opacity = '0.4';
    return;
  }
  if (tlPreview) tlPreview.style.opacity = '1';
  const tl=timeline();
  document.getElementById('tl-t').textContent=t+' kg';
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
    <div class="step-num">STEP 04 / 06</div>
    <div class="card-title">Diet & Pantry</div>
    <div class="card-sub">What you eat — and what you have to cook with</div>
    <div class="field" id="field-diet"><label>Diet Preference</label>
      <div class="opts g3" id="g-diet">
        <div class="opt${S.diet==='Vegan'?' selected':''}" data-v="Vegan"><div class="opt-icon">🌱</div><span class="opt-lbl">Vegan</span></div>
        <div class="opt${S.diet==='Vegetarian'?' selected':''}" data-v="Vegetarian"><div class="opt-icon">🥗</div><span class="opt-lbl">Vegetarian</span></div>
        <div class="opt${S.diet==='Non-Veg'?' selected':''}" data-v="Non-Veg"><div class="opt-icon">🍗</div><span class="opt-lbl">Non-Veg</span></div>
      </div>
      <div class="err-msg" id="err-diet"></div>
    </div>
    <div class="field"><label>Pantry (type + Enter, max 5)</label>
      <div class="chip-wrap" id="chips">
        <input type="text" class="chip-inp" id="ci" placeholder="e.g. chicken, paneer, oats…" onkeydown="addChip(event)">
      </div>
      <div id="chip-count" style="font-size:10px;color:var(--muted)">${S.pantry.length}/5 ingredients</div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(3)">← Back</button>
      <button class="btn" onclick="sub4()">Continue →</button>
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
    err.textContent = 'Please select your diet preference';
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
    <div class="step-num">STEP 05 / 06</div>
    <div class="card-title">Reminders</div>
    <div class="card-sub">I'll keep you on schedule, every single day</div>
    <div class="field" id="field-bf"><label>Breakfast Time</label>
      <input type="time" id="r-bf" value="${S.reminders.breakfast}" onchange="valTime('bf', 'Breakfast')">
      <div class="err-msg" id="err-bf"></div>
    </div>
    <div class="field" id="field-ln"><label>Lunch Time</label>
      <input type="time" id="r-ln" value="${S.reminders.lunch}" onchange="valTime('ln', 'Lunch')">
      <div class="err-msg" id="err-ln"></div>
    </div>
    <div class="field" id="field-dn"><label>Dinner Time</label>
      <input type="time" id="r-dn" value="${S.reminders.dinner}" onchange="valTime('dn', 'Dinner')">
      <div class="err-msg" id="err-dn"></div>
    </div>
    <div class="field" id="field-wo"><label>Workout Time</label>
      <input type="time" id="r-wo" value="${S.reminders.workout}" onchange="valTime('wo', 'Workout')">
      <div class="err-msg" id="err-wo"></div>
    </div>
    <div class="field">
      <div class="range-row"><span>Workout Days / Week</span><span class="range-val" id="wdv">${S.reminders.workoutDays} days</span></div>
      <input type="range" min="1" max="7" step="1" value="${S.reminders.workoutDays}"
        oninput="document.getElementById('wdv').textContent=this.value+' days';S.reminders.workoutDays=+this.value">
      <div class="range-hints"><span>1 day</span><span>7 days</span></div>
    </div>
    <div class="field">
      <div class="range-row"><span>Water Reminder Interval</span><span class="range-val" id="wiv">${S.reminders.waterInterval} min</span></div>
      <input type="range" min="30" max="180" step="15" value="${S.reminders.waterInterval}"
        oninput="document.getElementById('wiv').textContent=this.value+' min';S.reminders.waterInterval=+this.value">
      <div class="range-hints"><span>30 min</span><span>3 hours</span></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(4)">← Back</button>
      <button class="btn" onclick="sub5()">Continue →</button>
    </div>`;
  ob.appendChild(c);
}

export function valTime(id, label) {
  const el = document.getElementById(`r-${id}`);
  const err = document.getElementById(`err-${id}`);
  const field = document.getElementById(`field-${id}`);
  if (!el || !err || !field) return false;
  if (!el.value) {
    err.textContent = `${label} time is required`;
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
    <div class="step-num">STEP 06 / 06</div>
    <div class="card-title">Ready for Launch 🚀</div>
    <div class="card-sub">Your personalized engine is calibrated</div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-lbl">BMI</div><div class="stat-val" style="color:${bc.color}">${b}</div><div class="stat-unit">${bc.label}</div></div>
      <div class="stat-box"><div class="stat-lbl">Daily Target</div><div class="stat-val">${d}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">BMR</div><div class="stat-val" style="font-size:20px">${br}</div><div class="stat-unit">kcal/day</div></div>
      <div class="stat-box"><div class="stat-lbl">TDEE</div><div class="stat-val" style="font-size:20px">${td}</div><div class="stat-unit">kcal/day</div></div>
    </div>
    <div style="background:rgba(0,229,192,.05);border:1px solid rgba(0,229,192,.12);border-radius:10px;padding:13px;margin-bottom:16px">
      <div style="font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">Profile Summary</div>
      <div style="font-size:11px;line-height:2.1;color:var(--text)">
        <span>👤 ${S.age}yo ${S.gender}, ${S.height}cm, ${S.weight}kg</span><br>
        <span>🏃 Activity: ${S.activity} (×${S.actMult})</span><br>
        <span>🎯 Goal: ${S.goalLabel}</span><br>
        <span>🥗 Diet: ${S.diet}${S.pantry.length?` · ${S.pantry.join(', ')}`:''}</span><br>
        <span>📍 Target: ${S.targetWeight}kg @ ${S.pace}kg/wk · ${tl.weeks} weeks</span>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goStep(5)">← Back</button>
      <button class="btn" onclick="launch()">Launch Dashboard 🚀</button>
    </div>`;
  ob.appendChild(c);
}
export async function launch() {
  document.getElementById('onboarding').style.display='none';
  renderDots(STEPS+1);
  document.getElementById('dashboard').style.display='block';
  buildDashboard();
  await saveProfile();          /* persist onboarding data for next visit */
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
