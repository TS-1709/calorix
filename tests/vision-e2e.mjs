// End-to-end smoke test: read a real photo, run the pipeline,
// print the top-3 candidates with confidence + reasons.

import { PreProcessor } from '../src/vision/preprocess.js';
import { ColorHistogram } from '../src/vision/colorHistogram.js';
import { EdgeDetector } from '../src/vision/edges.js';
import { PlateDetector } from '../src/vision/plateDetector.js';
import { SpatialAnalyzer } from '../src/vision/spatial.js';
import { Scorer } from '../src/vision/scorer.js';
import { setDatabase } from '../src/vision/dbBridge.js';
import { annotateFoodDb } from '../src/vision/foodMapping.js';
import { foodDb } from '../src/nutrition/foodDb.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');

setDatabase(annotateFoodDb(foodDb));

// We don't have a real photo here, so we synthesize a "Henrik meal":
// a quadrant of green salad, a quadrant of white rice, a quadrant of
// red tomato, and a brown protein in the lower-right.
const W = 160, H = 120;
const px = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0;
    if (x < 80 && y < 60) { r = 20; g = 80; b = 30; }       // green salad
    else if (x >= 80 && y < 60) { r = 245; g = 245; b = 240; }  // white rice
    else if (x < 80 && y >= 60) { r = 200; g = 30; b = 30; }    // red tomato
    else { r = 120; g = 60; b = 30; }                            // brown protein
    const i = (y * W + x) * 4;
    px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = 255;
  }
}

const color = ColorHistogram.compute(px, W, H);
const edges = EdgeDetector.compute(px, W, H);
const plate = PlateDetector.compute(px, W, H, color);
const spatial = SpatialAnalyzer.compute(px, W, H, color);

const annotatedDb = annotateFoodDb(foodDb);
setDatabase(annotatedDb);
const scored = Scorer.score({ color, edges, plate, spatial, db: annotatedDb });

console.log('Candidates returned:', scored.candidates.length);
console.log('Top confidence:', scored.candidates[0].confidence);
console.log('Top 5:');
for (const c of scored.candidates.slice(0, 5)) {
  console.log(`  ${(c.confidence * 100).toFixed(0).padStart(3)}%  ${c.name}`);
  for (const r of c.reasons.slice(0, 2)) console.log(`        · ${r}`);
}
process.exit(0);
console.log('=== Henrik Meal Smoke Test ===\n');
console.log('Color features:');
console.log('  hue share:', color.perHue.map(v => v.toFixed(2)).join(' '));
console.log('  warmth:', color.warmth.toFixed(2), ' greenness:', color.greenness.toFixed(2), ' redness:', color.redness.toFixed(2));
console.log('  entropy:', color.hueEntropy.toFixed(2));
console.log('Edges: density', edges.density.toFixed(3), ' mean', edges.mean.toFixed(1), ' p90', edges.p90);
console.log('Plate: score', plate.score.toFixed(2), ' radius', plate.radius.toFixed(0));
console.log('Spatial: dominant', spatial.dominantQuadrant, ' focus', spatial.focus.toFixed(2));
console.log('');
console.log('Top-5 candidates:');
for (const c of scored.candidates.slice(0, 5)) {
  console.log(`  ${(c.confidence * 100).toFixed(0).padStart(3)}%  ${c.name}`);
  for (const r of c.reasons) console.log(`        · ${r}`);
}
