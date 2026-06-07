// Portion-size heuristics. Used by the UI to convert natural-language
// portion hints ("eine Hand voll", "ein Teller") into gram estimates.
// These are rough averages from dietary research; precision matters less
// than getting the order of magnitude right for daily tracking.

const PALM_GRAMS = 120;       // palm-sized protein portion
const FIST_GRAMS = 200;       // fist-sized vegetable portion
const CUPPED_HAND = 80;       // cupped hand of carbs
const THUMB = 15;             // thumb-sized fat
const PLATE_FRACTION = { quarter: 0.25, third: 0.33, half: 0.5 };

// Returns grams for a description. If a food category is provided, the
// heuristic can be more accurate.
export function portionToGrams(description, category) {
  const d = (description || '').toLowerCase().trim();
  if (!d) return null;

  // Direct gram mention: "150g", "200 gramm"
  const m = d.match(/(\d{2,4})\s*(g|gramm|grams?)/);
  if (m) return Math.min(1500, Math.max(10, parseInt(m[1], 10)));

  // Hand/fist-based heuristics
  if (/eine? hand|handvoll|handschaufel/.test(d)) {
    if (category === 'protein') return PALM_GRAMS;
    if (category === 'carb') return CUPPED_HAND;
    if (category === 'fat') return THUMB;
    if (category === 'fruit' || category === 'snack') return 100;
    return 100;
  }
  if (/eine? faust|fist/.test(d)) {
    if (category === 'vegetable') return FIST_GRAMS;
    if (category === 'carb') return 180;
    if (category === 'fruit') return 150;
    return FIST_GRAMS;
  }
  if (/daumen|thumb/.test(d)) return THUMB;
  if (/teller|plate/.test(d)) {
    const frac = /¼|viertel|quarter/.test(d) ? PLATE_FRACTION.quarter
      : /⅓|drittel|third/.test(d) ? PLATE_FRACTION.third
      : /½|hälfte|half/.test(d) ? PLATE_FRACTION.half
      : 1;
    // Plate heuristic: 400g total, split into portions
    if (category === 'vegetable') return Math.round(400 * frac);
    if (category === 'carb') return Math.round(250 * frac);
    if (category === 'protein') return Math.round(150 * frac);
    return Math.round(400 * frac);
  }
  if (/becher|cup|tasse/.test(d)) return 250;
  if (/esslöffel|el|tbsp/.test(d)) return 15;
  if (/teelöffel|tl|tsp/.test(d)) return 5;
  if (/prise|dash/.test(d)) return 1;
  if (/klein|small/.test(d)) return null; // caller can apply 0.7× default
  if (/groß|large|big/.test(d)) return null; // caller can apply 1.3× default
  return null;
}

// Natural-language defaulting: turn a free-text description into a grams
// estimate that combines the explicit hint and the food's default portion.
export function resolvePortionGrams(description, food) {
  const direct = portionToGrams(description, food.category);
  if (direct != null) return direct;
  if (!description) return food.defaultPortion;
  if (/klein|small/.test(description)) return Math.round(food.defaultPortion * 0.7);
  if (/groß|large|big/.test(description)) return Math.round(food.defaultPortion * 1.3);
  return food.defaultPortion;
}
