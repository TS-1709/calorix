// Stage 6: Scorer
// ------------------------------------------------------------------
// For each food in the DB, compute a per-stage score against the
// extracted features. The final score is a weighted sum.
//
// The 4 sub-scores are:
//   - color   : cosine similarity between the image's hueShare and
//               the food's expected hue signature, plus bonuses for
//               matching warmth / greenness / saturation.
//   - edges   : 1 - |edges.density - food.edges| / 0.5
//   - plate   : 1 if plate detected and food is a "plateable" item,
//               0.5 if no plate detected (looser match allowed).
//   - spatial : bonus if the food's expected quadrant signature
//               matches the dominant quadrant.
//
// We also apply a small "popularity prior" so that common items
// (rice, chicken, egg) tie-break over rare items when scores are
// within 0.05 of each other.

import { VISUAL_TAGS } from './dbBridge.js';

const DEFAULT_WEIGHTS = {
  color: 0.55,
  edges: 0.15,
  plate: 0.10,
  spatial: 0.15,
  prior: 0.05,
};

// Common foods get a tiny prior so ties go to the obvious answer.
const POPULARITY_PRIOR = {
  white_rice: 0.05,
  chicken_breast: 0.04,
  pasta: 0.04,
  eggs: 0.04,
  bread: 0.03,
  apple: 0.03,
  banana: 0.03,
  salad_mix: 0.03,
  pizza: 0.02,
  burger: 0.02,
  fries: 0.02,
  oatmeal_bowl: 0.02,
  yogurt: 0.02,
  milk: 0.02,
};

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0 || !isFinite(denom)) return 0;
  const r = dot / denom;
  if (!isFinite(r)) return 0;
  return r;
}

function hueDistance(a, b) {
  // 6-bucket circular distance
  let d = Math.abs(a - b);
  if (d > 3) d = 6 - d;
  return d / 3; // 0..1
}

function foodExpectedHue(foodTag) {
  const t = VISUAL_TAGS[foodTag];
  if (!t) return new Array(6).fill(1 / 6);
  const arr = new Array(6).fill(0);
  for (const [k, v] of Object.entries(t.hues)) {
    arr[Number(k)] = v;
  }
  const sum = arr.reduce((a, b) => a + b, 0) || 1;
  return arr.map((v) => v / sum);
}

export const Scorer = {
  DEFAULT_WEIGHTS,

  /**
   * @param {{ color: any, edges: any, plate: any, spatial: any,
   *           db: any[], weights?: any }} input
   */
  score({ color, edges, plate, spatial, db, weights }) {
    const w = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
    const candidates = [];

    for (const food of db) {
      const tag = food.visionId || food.id;
      const t = VISUAL_TAGS[tag];
      if (!t) {
        // No visual signature: still allow, but score very low.
        candidates.push({
          id: food.id,
          name: food.name,
          confidence: 0.01,
          reasons: ['No visual signature available — match is text-only.'],
          macros: pickMacros(food),
        });
        continue;
      }

      const reasons = [];
      const expectedHue = foodExpectedHue(tag);
      const colorSim = cosineSimilarity(color.perHue, expectedHue);

      // Saturation match: image sat mean should be near expected.
      const satDist = Math.abs(color.satMean - t.sat);
      const satScore = Math.max(0, 1 - satDist * 2.5);

      // Warmth match
      const warmthDist = Math.abs(color.warmth - (t.warmth ?? 0));
      const warmthScore = Math.max(0, 1 - warmthDist * 2);

      // Greenness match (boosts broccoli / salad)
      const greenDist = Math.abs(color.greenness - (t.greenness ?? 0));
      const greenScore = Math.max(0, 1 - greenDist * 1.5);

      // Redness match (boosts tomato / red pepper)
      const redDist = Math.abs(color.redness - (t.redness ?? 0));
      const redScore = Math.max(0, 1 - redDist * 1.5);

      const colorScore =
        0.5 * colorSim +
        0.15 * satScore +
        0.10 * warmthScore +
        0.13 * greenScore +
        0.12 * redScore;

      if (colorSim > 0.7) reasons.push(`Farbabgleich: ${(colorSim * 100).toFixed(0)}% Trefferquote.`);
      if (greenScore > 0.8) reasons.push('Hoher Grünanteil erkannt.');
      if (redScore > 0.8) reasons.push('Hoher Rot-/Orangeanteil erkannt.');

      // Edge density match
      const edgeDist = Math.abs(edges.density - (t.edges ?? 0));
      const edgeScore = Math.max(0, 1 - edgeDist / 0.5);
      if (edgeScore > 0.75) {
        reasons.push(edges.density > 0.3
          ? 'Viele Texturkanten — passt zu festen/knusprigen Speisen.'
          : 'Wenige Texturkanten — passt zu weichen/flüssigen Speisen.');
      }

      // Plate: this food is "plate-shaped" — slight bonus if plate is
      // detected, mild penalty if not.
      const plateScore = plate.score > 0.4
        ? (food.shape === 'plate' ? 1.0 : 0.7)
        : (food.shape === 'plate' ? 0.5 : 0.9);

      // Spatial: bonus if the food's natural quadrant matches.
      const quad = spatial.quadrants[spatial.dominantQuadrant];
      const quadSim = cosineSimilarity(quad.hueShare, expectedHue);
      const spatialScore = Math.max(0.3, quadSim);
      if (spatialScore > 0.7) {
        reasons.push(`Farbverteilung im Bild konzentriert auf ${spatial.dominantQuadrant.toUpperCase()}.`);
      }

      // Prior
      const prior = POPULARITY_PRIOR[tag] || 0;

      const total =
        w.color * colorScore +
        w.edges * edgeScore +
        w.plate * plateScore +
        w.spatial * spatialScore +
        w.prior * prior;

      candidates.push({
        id: food.id,
        name: food.name,
        confidence: Math.min(1, total),
        reasons: reasons.length ? reasons : ['Schwacher visueller Match — bitte manuell präzisieren.'],
        macros: pickMacros(food),
        _debug: { colorScore, edgeScore, plateScore, spatialScore, prior },
      });
    }

    candidates.sort((a, b) => b.confidence - a.confidence);
    return { candidates };
  },
};

function pickMacros(food) {
  return {
    kcal: food.kcal ?? food.energy ?? 0,
    protein: food.protein ?? 0,
    carb: food.carb ?? food.carbs ?? 0,
    fat: food.fat ?? 0,
  };
}
