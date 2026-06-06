/* ══════════════════════════════════════════════════════
   GLOBAL STATE
   ══════════════════════════════════════════════════════ */
export const S = {
  age:null,gender:null,height:null,weight:null,
  activity:null,actMult:1.55,
  goal:0,goalLabel:'Maintain',
  diet:null,pantry:[],
  targetWeight:null,pace:.5,
  reminders:{breakfast:'08:00',lunch:'13:00',dinner:'19:00',workout:'07:00',workoutDays:4,waterInterval:60},
  enabled:{breakfast:false,lunch:false,dinner:false,workout:false,water:false},

  // Dynamic runtime variables migrated inside S for ESM mutable bindings
  step: 1,
  lang: 'en',
  plans: { meals: null, workout: null },
  remLoop: null,
  waterLoop: null,
  chatHist: [],
  bodyB64: null,
  skinB64: null,
  bodyStream: null,
  skinStream: null
};

export const STEPS = 6;
if (typeof window !== 'undefined') {
  window.S = S;
  window.STEPS = STEPS;
}
