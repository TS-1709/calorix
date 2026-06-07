#!/usr/bin/env node
// Calorix CLI: print today's coach message from the terminal.
// Run with: node examples/cli-coach.js
//
// Uses the same pure modules the web app uses, no LLM, no network.

import { generateCoachMessage } from '../src/coach/engine.js';
import { defaultTargetKcal, sumMacros, estimateFromGrams } from '../src/nutrition/estimator.js';
import { getFoodById, searchFoods } from '../src/nutrition/foodDb.js';
import { todayKey, listDayKeys, loadDay, streakFromKeys } from '../src/engine/storage.js';

// Browser polyfill: localStorage and Date are global in Node 18+.
// If you run this in Node 16-, install `localstorage-polyfill` and
// initialise it before requiring any engine modules.

const target = defaultTargetKcal('unspecified', 75, 175, 35, 'moderate');
const day = loadDay(todayKey());
const total = sumMacros((day.entries || []).map((e) => e.macros));
const streak = streakFromKeys(listDayKeys());

const coach = generateCoachMessage({
  macros: total,
  target,
  streak,
  mood: 'neutral'
});

console.log(`Calorix · ${todayKey()}`);
console.log(`Ziel:    ${target.kcal} kcal · ${target.protein}P · ${target.carb}C · ${target.fat}F`);
console.log(`Heute:   ${total.kcal} kcal · ${total.protein.toFixed(1)}P · ${total.carb.toFixed(1)}C · ${total.fat.toFixed(1)}F`);
console.log(`Streak:  ${streak} Tag${streak === 1 ? '' : 'e'}`);
console.log('');
console.log(`Coach (${coach.framework.shortName}, ${coach.framework.citation}):`);
console.log(`  ${coach.text}`);
