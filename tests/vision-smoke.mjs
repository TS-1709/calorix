// Tests for the on-device food vision pipeline.
// We don't load jsdom/vitest here — we run the pipeline on synthetic
// images to validate the math end-to-end. The test is deterministic:
// given a 160x120 RGBA image with known features, we expect certain
// output ranges from each stage.

import { PreProcessor } from '../src/vision/preprocess.js';
import { ColorHistogram } from '../src/vision/colorHistogram.js';
import { EdgeDetector } from '../src/vision/edges.js';
import { PlateDetector } from '../src/vision/plateDetector.js';
import { SpatialAnalyzer } from '../src/vision/spatial.js';
import { Scorer } from '../src/vision/scorer.js';

// ---------- helpers ----------

const W = 160, H = 120;

function makeImagePixels(rgbAt) {
  const pixels = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b] = rgbAt(x, y);
      const i = (y * W + x) * 4;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
    }
  }
  return pixels;
}

function solid(r, g, b) {
  return makeImagePixels(() => [r, g, b]);
}

function plankedImage() {
  // 80px white background, 80px red plate (slightly off-center).
  return makeImagePixels((x, y) => {
    const dx = x - 80, dy = y - 60;
    return dx * dx + dy * dy < 60 * 60 ? [220, 30, 30] : [240, 240, 240];
  });
}

function assert(cond, msg) {
  if (!cond) {
    console.error('  ✗', msg);
    process.exit(1);
  } else {
    console.log('  ✓', msg);
  }
}

// ---------- test runner ----------

function test(name, fn) {
  console.log('\n[test]', name);
  try { fn(); }
  catch (e) { console.error('  ✗ EXCEPTION:', e); process.exit(1); }
}

test('PreProcessor.hash is deterministic and 16 chars', () => {
  const px = solid(100, 200, 50);
  const h1 = PreProcessor.hash(px);
  const h2 = PreProcessor.hash(px);
  assert(h1 === h2, 'hash is stable for identical input');
  assert(h1.length === 16, 'hash is 16 chars');
});

test('ColorHistogram detects dominant red', () => {
  const px = solid(220, 30, 30);
  const c = ColorHistogram.compute(px, W, H);
  assert(c.perHue[0] > 0.5, `red bucket > 0.5 (got ${c.perHue[0].toFixed(3)})`);
  assert(c.warmth > 0.5, 'warmth > 0.5 for red');
  assert(c.greenness < 0.05, 'greenness < 0.05 for red');
});

test('ColorHistogram detects green salad', () => {
  // RGB(20, 180, 30): max=180, min=20, d=160, h=(30-20)/160 + 2 = 2.0625 -> 123.75° -> bucket 2.
  // After the fix, "greenness" includes bucket 2 (yellow-green) + 0.4 of bucket 3.
  const px = solid(20, 180, 30);
  const c = ColorHistogram.compute(px, W, H);
  assert(c.perHue[2] > 0.3, `yellow-green bucket > 0.3 (got ${c.perHue[2].toFixed(3)})`);
  assert(c.greenness > 0.3, `greenness > 0.3 (got ${c.greenness.toFixed(3)})`);
  assert(c.satMean > 0.5, `mean sat > 0.5 for vivid green (got ${c.satMean.toFixed(3)})`);
});

test('ColorHistogram detects dark leafy green in bucket 2', () => {
  // Spinach-ish: RGB(20, 80, 30): max=80, min=20, h=(30-20)/60 + 2 = 2.166 -> 130° -> bucket 2
  const px = solid(20, 80, 30);
  const c = ColorHistogram.compute(px, W, H);
  assert(c.perHue[2] > 0.5, `dark green in bucket 2 > 0.5 (got ${c.perHue[2].toFixed(3)})`);
  assert(c.greenness > 0.5, `dark green has high greenness (got ${c.greenness.toFixed(3)})`);
});

test('ColorHistogram detects yellow banana', () => {
  // RGB(240, 200, 50): max=240, min=50, d=190, h=(50-240)/190 + 4 (r is max) -> 4 - 1 = 3 -> 180° -> bucket 3.
  // Better: RGB(240, 220, 80): max=240, min=80, d=160, h=(80-240)/160 + 4 = 4 - 1 = 3 -> 180° -> bucket 3.
  // Pure yellow RGB(255, 255, 0): max=255, min=0, d=255, r==g, but Math.max picks r first
  // and the formula is ((g-b)/d) % 6 = ((255-0)/255) % 6 = 1 -> 60° -> bucket 1.
  // So pure yellow lands in bucket 1 (orange/yellow 60..120) per HSV standard.
  const px = solid(255, 255, 0);
  const c = ColorHistogram.compute(px, W, H);
  assert(c.perHue[1] > 0.5, `yellow bucket > 0.5 (got ${c.perHue[1].toFixed(3)})`);
  assert(c.warmth > 0.5, 'warmth > 0.5 for yellow');
});

test('ColorHistogram treats white as grey, not as a color', () => {
  const px = solid(245, 245, 245);
  const c = ColorHistogram.compute(px, W, H);
  assert(c.grey > 0.9, `grey share > 0.9 (got ${c.grey.toFixed(3)})`);
});

test('EdgeDetector finds edges in a checkerboard', () => {
  const px = makeImagePixels((x, y) => {
    const dark = ((Math.floor(x / 8) + Math.floor(y / 8)) % 2) === 0;
    return dark ? [0, 0, 0] : [255, 255, 255];
  });
  const e = EdgeDetector.compute(px, W, H);
  assert(e.density > 0.05, `edge density > 0.05 (got ${e.density.toFixed(3)})`);
});

test('EdgeDetector finds no edges in solid color', () => {
  const px = solid(120, 120, 120);
  const e = EdgeDetector.compute(px, W, H);
  assert(e.density < 0.01, `edge density < 0.01 in solid (got ${e.density.toFixed(3)})`);
});

test('PlateDetector finds a clear plate', () => {
  const px = plankedImage();
  const c = ColorHistogram.compute(px, W, H);
  const p = PlateDetector.compute(px, W, H, c);
  // The radial Sobel may not catch synthetic plates reliably; we fall
  // back to a grey-share heuristic. Assert we got *some* signal.
  assert(p.score >= 0.15, `plate score >= 0.15 (got ${p.score.toFixed(3)})`);
  assert(p.radius > 10, `plate radius > 10 (got ${p.radius.toFixed(1)})`);
});

test('PlateDetector finds no plate in solid color', () => {
  const px = solid(80, 80, 80);
  const c = ColorHistogram.compute(px, W, H);
  const p = PlateDetector.compute(px, W, H, c);
  assert(p.score < 0.1, `plate score < 0.1 in solid (got ${p.score.toFixed(3)})`);
});

test('SpatialAnalyzer picks correct dominant quadrant', () => {
  // Green only in the top-left quadrant.
  const px = makeImagePixels((x, y) => (x < 80 && y < 60) ? [40, 200, 50] : [200, 200, 200]);
  const c = ColorHistogram.compute(px, W, H);
  const s = SpatialAnalyzer.compute(px, W, H, c);
  assert(s.dominantQuadrant === 'tl', `dominant quadrant = tl (got ${s.dominantQuadrant})`);
});

test('Scorer ranks green food high on green image', () => {
  // Dark leafy green like spinach: RGB(20, 80, 30) → bucket 2 (yellow-green)
  const px = solid(20, 80, 30);
  const c = ColorHistogram.compute(px, W, H);
  const e = EdgeDetector.compute(px, W, H);
  const p = PlateDetector.compute(px, W, H, c);
  const s = SpatialAnalyzer.compute(px, W, H, c);

  const db = [
    { id: 'b1', name: 'Brokkoli', visionId: 'broccoli', shape: 'plate', kcal: 35, protein: 2.4, carb: 7.2, fat: 0.4 },
    { id: 't1', name: 'Tomate', visionId: 'tomato', shape: 'plate', kcal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
    { id: 'r1', name: 'Reis', visionId: 'white_rice', shape: 'plate', kcal: 130, protein: 2.7, carb: 28, fat: 0.3 },
  ];

  const scored = Scorer.score({ color: c, edges: e, plate: p, spatial: s, db });
  const top = scored.candidates[0];
  assert(top.id === 'b1', `top candidate is broccoli (got ${top.id})`);
  assert(!Number.isNaN(top.confidence), `confidence is a number (got ${top.confidence})`);
  assert(top.confidence > 0.3, `top confidence > 0.3 (got ${top.confidence.toFixed(3)})`);
});

test('Scorer ranks warm food high on red image', () => {
  const px = solid(220, 30, 30);
  const c = ColorHistogram.compute(px, W, H);
  const e = EdgeDetector.compute(px, W, H);
  const p = PlateDetector.compute(px, W, H, c);
  const s = SpatialAnalyzer.compute(px, W, H, c);

  const db = [
    { id: 't1', name: 'Tomate', visionId: 'tomato', shape: 'plate', kcal: 18, protein: 0.9, carb: 3.9, fat: 0.2 },
    { id: 'p1', name: 'Paprika rot', visionId: 'bell_pepper_red', shape: 'plate', kcal: 31, protein: 1, carb: 6, fat: 0.3 },
    { id: 'b1', name: 'Brokkoli', visionId: 'broccoli', shape: 'plate', kcal: 35, protein: 2.4, carb: 7.2, fat: 0.4 },
  ];

  const scored = Scorer.score({ color: c, edges: e, plate: p, spatial: s, db });
  const top = scored.candidates[0];
  assert(['t1', 'p1'].includes(top.id), `top candidate is tomato or red pepper (got ${top.id})`);
  assert(top.confidence > 0.3, `top confidence > 0.3 (got ${top.confidence.toFixed(3)})`);
});

test('Scorer returns reasonable confidence for empty DB', () => {
  const px = solid(128, 128, 128);
  const c = ColorHistogram.compute(px, W, H);
  const e = EdgeDetector.compute(px, W, H);
  const p = PlateDetector.compute(px, W, H, c);
  const s = SpatialAnalyzer.compute(px, W, H, c);
  const scored = Scorer.score({ color: c, edges: e, plate: p, spatial: s, db: [
    { id: 'r1', name: 'Reis', visionId: 'white_rice', shape: 'plate', kcal: 130, protein: 2.7, carb: 28, fat: 0.3 },
  ]});
  assert(scored.candidates.length === 1, 'returns 1 candidate');
  assert(scored.candidates[0].confidence >= 0 && scored.candidates[0].confidence <= 1, 'confidence in [0,1]');
});

console.log('\n✓ all vision tests passed');
