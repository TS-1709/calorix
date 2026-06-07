#!/usr/bin/env node
// Calorix macro counter: read items from stdin, print macros.
// Run with: node examples/macro-counter.js
//
// Format: one item per line, "id grams" or "name portion-text".
// Example:
//   p01 200
//   "Hähnchenbrust (gegart)" mittel
//   Reis 1 Tasse
//
// Press Ctrl-D (or Ctrl-Z on Windows) when done.

import { getFoodById, searchFoods } from '../src/nutrition/foodDb.js';
import { estimateFromGrams, estimateFromPortion, sumMacros } from '../src/nutrition/estimator.js';
import { resolvePortionGrams } from '../src/nutrition/portions.js';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('Enter one item per line: "id grams" or "name portion-text". Ctrl-D to finish.');

const entries = [];
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  const parsed = parseLine(trimmed);
  if (parsed) {
    entries.push(parsed);
    console.log(`  ${parsed.food.name} · ${parsed.grams}g · ${parsed.macros.kcal} kcal`);
  } else {
    console.log(`  (could not parse: ${trimmed})`);
  }
});

rl.on('close', () => {
  if (!entries.length) {
    console.log('\nNo entries. Nothing to total.');
    return;
  }
  const total = sumMacros(entries.map((e) => e.macros));
  console.log('\nTotal:');
  console.log(`  ${total.kcal} kcal · ${total.protein.toFixed(1)}g P · ${total.carb.toFixed(1)}g C · ${total.fat.toFixed(1)}g F`);
});

function parseLine(line) {
  // "id grams" pattern
  const idMatch = line.match(/^(\S+)\s+(\d+)$/);
  if (idMatch) {
    const food = getFoodById(idMatch[1]);
    if (food) {
      return { food, grams: +idMatch[2], macros: estimateFromGrams(food, +idMatch[2]) };
    }
  }
  // "name portion" pattern
  const parts = line.split(/\s+/);
  if (parts.length >= 2) {
    const query = parts.slice(0, -1).join(' ');
    const portion = parts[parts.length - 1];
    const matches = searchFoods(query, 1);
    if (matches.length) {
      const food = matches[0];
      const grams = resolvePortionGrams(portion, food);
      return { food, grams, macros: estimateFromGrams(food, grams) };
    }
  }
  return null;
}
