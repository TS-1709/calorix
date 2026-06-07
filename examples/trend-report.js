#!/usr/bin/env node
// Calorix trend report: print a 7-day summary from a JSON file on disk.
// Useful for exporting the app's localStorage and generating a report
// outside the browser.
//
// Run with: node examples/trend-report.js path/to/storage.json
//
// The JSON file should look like:
//   {
//     "calorix:day:2026-06-01": { "entries": [...] },
//     "calorix:day:2026-06-02": { "entries": [...] },
//     ...
//   }

import { sumMacros } from '../src/nutrition/estimator.js';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node examples/trend-report.js path/to/storage.json');
  process.exit(1);
}

const data = JSON.parse(readFileSync(file, 'utf8'));
const days = Object.keys(data)
  .filter((k) => k.startsWith('calorix:day:'))
  .sort();

console.log('Date         kcal     P        C        F');
console.log('-'.repeat(45));

for (const key of days) {
  const date = key.replace('calorix:day:', '');
  const total = sumMacros((data[key].entries || []).map((e) => e.macros));
  console.log(
    `${date}   ${String(total.kcal).padStart(5)}   ${total.protein.toFixed(1).padStart(6)}   ${total.carb.toFixed(1).padStart(6)}   ${total.fat.toFixed(1).padStart(6)}`
  );
}

const totals = days.map((k) => sumMacros((data[k].entries || []).map((e) => e.macros)));
const grandTotal = totals.reduce(
  (acc, t) => ({
    kcal: acc.kcal + t.kcal,
    protein: acc.protein + t.protein,
    carb: acc.carb + t.carb,
    fat: acc.fat + t.fat
  }),
  { kcal: 0, protein: 0, carb: 0, fat: 0 }
);
const avg = {
  kcal: Math.round(grandTotal.kcal / totals.length),
  protein: grandTotal.protein / totals.length,
  carb: grandTotal.carb / totals.length,
  fat: grandTotal.fat / totals.length
};
console.log('-'.repeat(45));
console.log(`Average:     ${String(avg.kcal).padStart(5)}   ${avg.protein.toFixed(1).padStart(6)}   ${avg.carb.toFixed(1).padStart(6)}   ${avg.fat.toFixed(1).padStart(6)}`);
