import { describe, it, expect, beforeEach } from 'vitest';
import { S } from './state.js';
import { bmi, bmr, tdee, daily, macros, bmiCat, timeline } from './calc.js';

describe('Calculations Unit Tests', () => {
  beforeEach(() => {
    // Reset state before each test
    S.age = 30;
    S.gender = 'Male';
    S.height = 175;
    S.weight = 80;
    S.activity = 'Active';
    S.actMult = 1.55;
    S.goal = -500; // Calorie deficit
    S.targetWeight = 75;
    S.pace = 0.5;
  });

  it('calculates BMI correctly', () => {
    // BMI = weight / (height/100)^2 = 80 / (1.75)^2 = 26.12
    expect(bmi()).toBeCloseTo(26.12, 2);
  });

  it('categorizes BMI correctly', () => {
    expect(bmiCat(17)).toEqual({ label: 'Underweight', color: '#3b82f6' });
    expect(bmiCat(22)).toEqual({ label: 'Normal', color: '#00e5c0' });
    expect(bmiCat(27)).toEqual({ label: 'Overweight', color: '#ffc107' });
    expect(bmiCat(32)).toEqual({ label: 'Obese', color: '#ff4d6d' });
  });

  it('calculates BMR correctly for Male and Female', () => {
    // Male: (10 * 80) + (6.25 * 175) - (5 * 30) + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    expect(bmr()).toBe(1748.75);

    S.gender = 'Female';
    // Female: (10 * 80) + (6.25 * 175) - (5 * 30) - 161 = 800 + 1093.75 - 150 - 161 = 1582.75
    expect(bmr()).toBe(1582.75);
  });

  it('calculates TDEE correctly', () => {
    // TDEE = BMR * actMult = 1748.75 * 1.55 = 2710.56
    expect(tdee()).toBeCloseTo(2710.56, 2);
  });

  it('calculates daily calorie target correctly', () => {
    // daily = TDEE + goal = 2710.56 - 500 = 2210.56
    expect(daily()).toBeCloseTo(2210.56, 2);
  });

  it('calculates macros correctly based on goal', () => {
    const m = macros();
    // deficit macros (goal < 0) split: p: 0.35, c: 0.40, f: 0.25
    // daily calories is around 2211
    // protein: 2211 * 0.35 / 4 = 193.46 -> round to 193
    // carbs: 2211 * 0.40 / 4 = 221.1 -> round to 221
    // fat: 2211 * 0.25 / 9 = 61.41 -> round to 61
    expect(m.protein).toBeCloseTo(193, 0);
    expect(m.carbs).toBeCloseTo(221, 0);
    expect(m.fat).toBeCloseTo(61, 0);
  });

  it('calculates timeline correctly', () => {
    const t = timeline();
    expect(t.diff).toBe(5); // 80 - 75 = 5
    expect(t.weeks).toBe(10); // 5 / 0.5 = 10 weeks
    expect(t.months).toBe('2.3'); // (10 / 4.33).toFixed(1) = 2.3
    expect(t.end).toBeInstanceOf(Date);
  });
});
