// Coach engine: rule-based, deterministic, 100% local.
// Picks a psychological framework, evaluates the user's state, and
// returns a single coach message + meta info for the UI to render.

import { FRAMEWORKS, getTemplate } from './frameworks.js';
import { macroPct } from '../nutrition/estimator.js';

const ROTATION = ['cbt', 'act', 'sdt', 'mi'];

// Convert a date to a stable day index (so the same calendar day always
// yields the same coach message).
export function dayIndex(date = new Date()) {
  const d = (date instanceof Date ? date : new Date(date));
  return Math.floor(d.getTime() / 86400000);
}

// Build the user state from today's intake and the user's target.
export function buildState({ macros, target, streak, mood, date = new Date() }) {
  const pct = macroPct(macros, target);
  const overKcal = Math.max(0, macros.kcal - target.kcal);
  const underKcal = Math.min(0, macros.kcal - target.kcal);
  return {
    macros,
    target,
    pct,
    streak: streak || 0,
    mood: mood || 'neutral',
    overKcal,
    underKcal,
    low_mood: mood === 'low' || mood === 'rough',
    dayIndex: dayIndex(date)
  };
}

// Pick a framework for today. The choice is deterministic per day
// but rotates through the four frameworks across days. If the user
// flagged a rough mood, prefer ACT (more acceptance-oriented).
export function pickFramework(state) {
  if (state.low_mood) return 'act';
  const idx = state.dayIndex % ROTATION.length;
  return ROTATION[idx];
}

export function generateCoachMessage({ macros, target, streak, mood, date }) {
  const state = buildState({ macros, target, streak, mood, date });
  const frameworkId = pickFramework(state);
  const framework = FRAMEWORKS[frameworkId];
  const template = getTemplate(frameworkId, state);
  const text = template ? template(state) : 'Heute ist heute. Mache es dir leicht.';
  return {
    framework,
    text,
    state: {
      kcalPct: Math.round(state.pct.kcal),
      overKcal: state.overKcal,
      underKcal: state.underKcal,
      streak: state.streak
    }
  };
}

// Format the macro state for the UI ring/badge.
export function macroBadge(macros, target) {
  const pct = macroPct(macros, target);
  return {
    kcal: { current: macros.kcal, target: target.kcal, pct: Math.round(pct.kcal) },
    protein: { current: Math.round(macros.protein), target: target.protein, pct: Math.round(pct.protein) },
    carb: { current: Math.round(macros.carb), target: target.carb, pct: Math.round(pct.carb) },
    fat: { current: Math.round(macros.fat), target: target.fat, pct: Math.round(pct.fat) }
  };
}
