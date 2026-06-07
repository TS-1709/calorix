import { describe, expect, it } from 'vitest';
import { foodDb, searchFoods, getFoodById } from './foodDb.js';

describe('foodDb', () => {
  it('contains at least 50 well-formed entries', () => {
    expect(foodDb.length).toBeGreaterThanOrEqual(50);
    for (const f of foodDb) {
      expect(f.id).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(typeof f.kcal).toBe('number');
      expect(typeof f.protein).toBe('number');
      expect(typeof f.carb).toBe('number');
      expect(typeof f.fat).toBe('number');
      expect(['protein', 'carb', 'vegetable', 'fruit', 'fat', 'dairy', 'drink', 'snack', 'prepared']).toContain(f.category);
      expect(f.defaultPortion).toBeGreaterThan(0);
    }
  });

  it('searches case-insensitively by name and alias', () => {
    const r1 = searchFoods('hähnchen');
    const r2 = searchFoods('HAHNCHEN');
    const r3 = searchFoods('chicken');
    expect(r1.length).toBeGreaterThan(0);
    expect(r2.length).toBeGreaterThan(0);
    expect(r3.length).toBeGreaterThan(0);
    expect(r1[0].id).toBe('p01');
  });

  it('returns the same food for id lookup', () => {
    const f = getFoodById('p01');
    expect(f).toBeTruthy();
    expect(f.name).toContain('Hähnchenbrust');
  });
});
