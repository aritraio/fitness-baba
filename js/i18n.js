import { S } from './state.js';
import { buildDashboard } from './dashboard.js';
import { goStep } from './ui.js';

export const locales = {
  en: {
    // App level
    title: "FitnessBaba",
    tagline: "// your personal health coach — biomarkers to kitchen in 60s",
    model: "Model",
    lang: "Language",
    power: "via ZenMux",
    model_hint: "94 models · OpenAI · Anthropic · Google ·",
    
    // Tabs
    tab_overview: "📊 Overview",
    tab_timeline: "🎯 Timeline",
    tab_progress: "📈 Progress",
    tab_meals: "🍽 Meals",
    tab_exercise: "💪 Exercise",
    tab_bodyscan: "🔬 Body Scan",
    tab_skincare: "✨ Skin Care",
    tab_alerts: "🔔 Alerts",
    tab_cheat: "🍕 Cheat Meal",
    tab_coach: "🤖 AI Coach",

    // General Onboarding
    continue: "Continue →",
    back: "← Back",
    
    // Onboarding Step 1
    step_01: "STEP 01 / 06",
    bio_stats: "Bio Stats",
    bio_sub: "Tell me about your body — I'll do the math",
    age_label: "Age (years)",
    gender_label: "Gender",
    gender_male: "Male",
    gender_female: "Female",
    gender_other: "Other",
    height_label: "Height (cm)",
    weight_label: "Weight (kg)",
    act_label: "Activity Level",
    act_sed: "Sedentary",
    act_sed_sub: "desk job",
    act_light: "Light",
    act_light_sub: "1-3×/wk",
    act_mod: "Moderate",
    act_mod_sub: "3-5×/wk",
    act_act: "Active",
    act_act_sub: "6-7×/wk",
    act_ath: "Athlete",
    act_ath_sub: "2×/day",

    // Onboarding Step 2
    step_02: "STEP 02 / 06",
    goal_title: "Your Goal",
    goal_sub: "Your TDEE:",
    goal_agg_loss: "Aggressive Loss",
    goal_agg_loss_sub: "−750 kcal/day",
    goal_std_loss: "Steady Loss",
    goal_std_loss_sub: "−350 kcal/day",
    goal_maintain: "Maintain",
    goal_maintain_sub: "±0 kcal/day",
    goal_lean_bulk: "Lean Bulk",
    goal_lean_bulk_sub: "+250 kcal/day",
    goal_heavy_bulk: "Heavy Bulk",
    goal_heavy_bulk_sub: "+500 kcal/day",

    // Onboarding Step 3
    step_03: "STEP 03 / 06",
    target_title: "Weight Target",
    target_sub: "Set your destination — I'll map the route",
    target_weight_label: "Target Weight (kg)",
    pace_label: "Pace",
    current_label: "Current",
    target_label: "Target",
    duration_label: "Duration",
    est_end_label: "Est. End Date",

    // Onboarding Step 4
    step_04: "STEP 04 / 06",
    diet_title: "Diet & Pantry",
    diet_sub: "What you eat — and what you have to cook with",
    diet_label: "Diet Preference",
    pantry_label: "Pantry (type + Enter, max 5)",
    vegan: "Vegan",
    vegetarian: "Vegetarian",
    non_veg: "Non-Veg",

    // Onboarding Step 5
    step_05: "STEP 05 / 06",
    rem_title: "Reminders",
    rem_sub: "I'll keep you on schedule, every single day",
    bf_label: "Breakfast Time",
    ln_label: "Lunch Time",
    dn_label: "Dinner Time",
    wo_label: "Workout Time",
    wo_days_label: "Workout Days / Week",
    water_rem_label: "Water Reminder Interval",

    // Onboarding Step 6
    step_06: "STEP 06 / 06",
    launch_title: "Ready for Launch 🚀",
    launch_sub: "Your personalized engine is calibrated",
    launch_btn: "Launch Dashboard 🚀",
    summary_title: "Profile Summary",
    
    // Errors
    err_age: "Age is required",
    err_age_range: "Age must be between 10 and 100",
    err_ht: "Height is required",
    err_ht_range: "Height must be between 100 and 250 cm",
    err_wt: "Weight is required",
    err_wt_range: "Weight must be between 30 and 300 kg",
    err_gender: "Please select your gender",
    err_act: "Please select your activity level",
    err_goal: "Please select a health goal",
    err_tw: "Target weight is required",
    err_tw_range: "Weight must be between 30 and 300 kg",
    err_diet: "Please select your diet preference",
    err_time: "time is required"
  },
  hi: {
    // App level (Hinglish)
    title: "FitnessBaba",
    tagline: "// aapka personal health coach — biomarkers se kitchen tak 60s mein",
    model: "Model",
    lang: "Bhasha",
    power: "via ZenMux",
    model_hint: "94 models · OpenAI · Anthropic · Google ·",
    
    // Tabs
    tab_overview: "📊 Overview",
    tab_timeline: "🎯 Timeline",
    tab_progress: "📈 Progress",
    tab_meals: "🍽 Meal Plan",
    tab_exercise: "💪 Workout",
    tab_bodyscan: "🔬 Body Scan",
    tab_skincare: "✨ Skin Care",
    tab_alerts: "🔔 Reminders",
    tab_cheat: "🍕 Cheat Meal",
    tab_coach: "🤖 AI Coach",

    // General Onboarding
    continue: "Aage badhein →",
    back: "← Peeche",
    
    // Onboarding Step 1
    step_01: "KADAM 01 / 06",
    bio_stats: "Body Stats",
    bio_sub: "Apni body ke baare mein batayein — baki main dekh lunga",
    age_label: "Umar (Saal)",
    gender_label: "Gender (Ling)",
    gender_male: "Purush (Male)",
    gender_female: "Mahila (Female)",
    gender_other: "Anya (Other)",
    height_label: "Height (cm mein)",
    weight_label: "Vajan (Weight kg mein)",
    act_label: "Activity Level (Aap kitne active hain)",
    act_sed: "Sedentary",
    act_sed_sub: "desk job (baithne ka kaam)",
    act_light: "Light",
    act_light_sub: "1-3× haftay mein",
    act_mod: "Moderate",
    act_mod_sub: "3-5× haftay mein",
    act_act: "Active",
    act_act_sub: "6-7× haftay mein",
    act_ath: "Athlete",
    act_ath_sub: "Din mein 2×",

    // Onboarding Step 2
    step_02: "KADAM 02 / 06",
    goal_title: "Aapka Lakshya (Goal)",
    goal_sub: "Aapka TDEE:",
    goal_agg_loss: "Aggressive Loss (Tez Vajan Ghatana)",
    goal_agg_loss_sub: "−750 kcal/din",
    goal_std_loss: "Steady Loss (Dhire Vajan Ghatana)",
    goal_std_loss_sub: "−350 kcal/din",
    goal_maintain: "Maintain (Vajan banaye rakhna)",
    goal_maintain_sub: "±0 kcal/din",
    goal_lean_bulk: "Lean Bulk (Muscle Banana)",
    goal_lean_bulk_sub: "+250 kcal/din",
    goal_heavy_bulk: "Heavy Bulk (Tez Muscle Banana)",
    goal_heavy_bulk_sub: "+500 kcal/din",

    // Onboarding Step 3
    step_03: "KADAM 03 / 06",
    target_title: "Target Weight (Lakshya Vajan)",
    target_sub: "Apna target batayein — rasta main banaunga",
    target_weight_label: "Target Weight (kg mein)",
    pace_label: "Gati (Pace)",
    current_label: "Abhi ka",
    target_label: "Target",
    duration_label: "Waqt (Duration)",
    est_end_label: "Est. End Date",

    // Onboarding Step 4
    step_04: "KADAM 04 / 06",
    diet_title: "Diet aur Pantry",
    diet_sub: "Aap kya khate hain aur kitchen mein kya kya hai",
    diet_label: "Khane ki choice",
    pantry_label: "Ghar ka ration (type karein + Enter, max 5)",
    vegan: "Vegan (Shudh Shakahari)",
    vegetarian: "Vegetarian (Shakahari)",
    non_veg: "Non-Veg (Mansahari)",

    // Onboarding Step 5
    step_05: "KADAM 05 / 06",
    rem_title: "Reminders (Yaad dilana)",
    rem_sub: "Main aapko time par sab yaad dilaunga",
    bf_label: "Nashte ka Time",
    ln_label: "Lunch ka Time",
    dn_label: "Dinner ka Time",
    wo_label: "Workout ka Time",
    wo_days_label: "Haftay mein workout ke din",
    water_rem_label: "Paani peene ka interval",

    // Onboarding Step 6
    step_06: "KADAM 06 / 06",
    launch_title: "Chalo Shuru Karein! 🚀",
    launch_sub: "Aapka personalized engine taiyar hai",
    launch_btn: "Launch Dashboard 🚀",
    summary_title: "Profile Summary (Aapka Detail)",
    
    // Errors
    err_age: "Umar likhna zaroori hai",
    err_age_range: "Umar 10 se 100 ke beech honi chahiye",
    err_ht: "Height likhna zaroori hai",
    err_ht_range: "Height 100 se 250 cm ke beech honi chahiye",
    err_wt: "Weight likhna zaroori hai",
    err_wt_range: "Weight 30 se 300 kg ke beech honi chahiye",
    err_gender: "Kripya gender select karein",
    err_act: "Kripya activity level select karein",
    err_goal: "Kripya ek goal select karein",
    err_tw: "Target weight likhna zaroori hai",
    err_tw_range: "Weight 30 se 300 kg ke beech honi chahiye",
    err_diet: "Kripya diet preference select karein",
    err_time: "Time likhna zaroori hai"
  }
};

export function getLang() {
  return S.lang || localStorage.getItem('lang') || 'en';
}

export function t(key) {
  const lang = getLang();
  return locales[lang]?.[key] || locales.en[key] || key;
}

export function translateUI() {
  const lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = locales[lang]?.[key] || locales.en[key];
    if (translation) {
      if (el.tagName === 'INPUT' && el.placeholder) {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    }
  });
}

export function setLang(lang) {
  S.lang = lang;
  localStorage.setItem('lang', lang);
  translateUI();

  // If dashboard is open, rebuild dashboard tabs & refresh current panel
  if (document.getElementById('dashboard')?.style.display === 'block') {
    buildDashboard();
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) {
      const tabId = activeBtn.id.replace('tab-', '');
      const panel = document.getElementById(`p-${tabId}`);
      if (panel) {
        panel.removeAttribute('data-built');
        // Import switchTab dynamically or invoke window.switchTab
        if (window.switchTab) {
          window.switchTab(tabId, activeBtn);
        }
      }
    }
  } else {
    // If onboarding is open, rebuild onboarding step
    goStep(S.step);
  }
}

// Expose to window for inline HTML select tags
window.setLang = setLang;
window.t = t;
window.translateUI = translateUI;
