import { describe, expect, it } from 'vitest';
import { estimateFromGrams, estimateFromPortion, sumMacros, macroPct, defaultTargetKcal } from './estimator.js';
import { portionToGrams, resolvePortionGrams } from './portions.js';
import { foodDb } from './foodDb.js';

describe('estimator', () => {
  it('scales macros linearly with grams', () => {
    const f = foodDb.find((x) => x.id === 'p01');
    const a = estimateFromGrams(f, 100);
    const b = estimateFromGrams(f, 200);
    expect(b.kcal).toBe(a.kcal * 2);
    expect(b.protein).toBeCloseTo(a.protein * 2, 1);
  });

  it('applies portion multipliers correctly', () => {
    const f = foodDb.find((x) => x.id === 'c01');
    const small = estimateFromPortion(f, 'small');
    const medium = estimateFromPortion(f, 'medium');
    const large = estimateFromPortion(f, 'large');
    expect(small.kcal).toBeLessThan(medium.kcal);
    expect(medium.kcal).toBeLessThan(large.kcal);
  });

  it('sums macro entries', () => {
    const s = sumMacros([{ kcal: 100, protein: 10, carb: 5, fat: 2 }, { kcal: 200, protein: 20, carb: 10, fat: 4 }]);
    expect(s.kcal).toBe(300);
    expect(s.protein).toBe(30);
  });

  it('clamps macro percentages to 100', () => {
    const pct = macroPct({ kcal: 3000, protein: 200, carb: 600, fat: 200 }, { kcal: 2000, protein: 100, carb: 240, fat: 70 });
    expect(pct.kcal).toBe(100);
    expect(pct.protein).toBe(100);
  });

  it('falls back to safe default when no biometrics', () => {
    const t = defaultTargetKcal();
    expect(t.kcal).toBeGreaterThan(1500);
    expect(t.protein).toBeGreaterThan(0);
  });

  it('derives a BMR-based target from realistic inputs', () => {
    const t = defaultTargetKcal('male', 80, 180, 35, 'moderate');
    expect(t.kcal).toBeGreaterThan(2000);
    expect(t.kcal).toBeLessThan(3500);
  });
});

describe('portions', () => {
  it('parses explicit gram mentions', () => {
    expect(portionToGrams('150g', 'protein')).toBe(150);
    expect(portionToGrams('200 gramm', 'carb')).toBe(200);
  });

  it('maps hand-sized portions per category', () => {
    expect(portionToGrams('eine Hand voll', 'protein')).toBe(120);
    expect(portionToGrams('eine Hand voll', 'carb')).toBe(80);
  });

  it('maps fist-sized portions to vegetables by default', () => {
    expect(portionToGrams('eine Faust', 'vegetable')).toBe(200);
  });

  it('resolves small/large against default portion', () => {
    const f = foodDb.find((x) => x.id === 'p01');
    const small = resolvePortionGrams('klein', f);
    const large = resolvePortionGrams('groß', f);
    expect(small).toBeLessThan(f.defaultPortion);
    expect(large).toBeGreaterThan(f.defaultPortion);
  });
});
