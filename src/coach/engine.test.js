import { describe, expect, it } from 'vitest';
import { generateCoachMessage, buildState, pickFramework, macroBadge, dayIndex } from './engine.js';
import { FRAMEWORKS } from './frameworks.js';

describe('coach engine', () => {
  it('exposes four real psychological frameworks', () => {
    expect(Object.keys(FRAMEWORKS)).toEqual(expect.arrayContaining(['cbt', 'act', 'sdt', 'mi']));
    for (const f of Object.values(FRAMEWORKS)) {
      expect(f.citation).toBeTruthy();
      expect(f.description.length).toBeGreaterThan(20);
    }
  });

  it('is deterministic per calendar day', () => {
    const params = { macros: { kcal: 1800, protein: 90, carb: 220, fat: 60 }, target: { kcal: 2000, protein: 100, carb: 240, fat: 70 }, streak: 3, mood: 'neutral' };
    const a = generateCoachMessage({ ...params, date: new Date('2026-05-15T10:00:00') });
    const b = generateCoachMessage({ ...params, date: new Date('2026-05-15T22:00:00') });
    expect(a.text).toBe(b.text);
    expect(a.framework.id).toBe(b.framework.id);
  });

  it('rotates frameworks across days', () => {
    const seen = new Set();
    for (let i = 0; i < 8; i++) {
      const date = new Date('2026-05-15T10:00:00Z');
      date.setDate(date.getDate() + i);
      const c = generateCoachMessage({ macros: { kcal: 1800, protein: 90, carb: 220, fat: 60 }, target: { kcal: 2000, protein: 100, carb: 240, fat: 70 }, streak: 3, mood: 'neutral', date });
      seen.add(c.framework.id);
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
  });

  it('prefers ACT on rough mood', () => {
    const state = buildState({ macros: { kcal: 1500, protein: 60, carb: 180, fat: 40 }, target: { kcal: 2000, protein: 100, carb: 240, fat: 70 }, streak: 2, mood: 'rough' });
    expect(pickFramework(state)).toBe('act');
  });

  it('produces non-empty text for every state combination', () => {
    const moods = ['good', 'neutral', 'rough'];
    const scenarios = [
      { kcal: 1500 }, { kcal: 2000 }, { kcal: 2700 }
    ];
    for (const mood of moods) {
      for (const s of scenarios) {
        const c = generateCoachMessage({
          macros: { kcal: s.kcal, protein: 100, carb: 200, fat: 70 },
          target: { kcal: 2000, protein: 100, carb: 240, fat: 70 },
          streak: 4,
          mood
        });
        expect(c.text.length).toBeGreaterThan(20);
      }
    }
  });

  it('builds a macro badge with current/target/pct', () => {
    const b = macroBadge({ kcal: 1000, protein: 60, carb: 120, fat: 30 }, { kcal: 2000, protein: 100, carb: 240, fat: 70 });
    expect(b.kcal.pct).toBe(50);
    expect(b.protein.current).toBe(60);
  });

  it('produces a stable day index from a date', () => {
    expect(dayIndex(new Date('2026-05-15T10:00:00'))).toBe(dayIndex(new Date('2026-05-15T20:00:00')));
  });
});
