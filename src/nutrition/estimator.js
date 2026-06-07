// Calorie / macro estimation.
// Pure functions, no DOM. The estimator scales per-100g values by the
// portion size in grams and returns the resulting macros.

export function estimateFromGrams(food, grams) {
  const factor = grams / 100;
  return {
    kcal: Math.round(food.kcal * factor),
    protein: round1(food.protein * factor),
    carb: round1(food.carb * factor),
    fat: round1(food.fat * factor),
    grams
  };
}

export function estimateFromPortion(food, portion) {
  // portion: 'small' | 'medium' | 'large' | number (grams)
  let grams;
  if (typeof portion === 'number') grams = portion;
  else if (portion === 'small') grams = food.defaultPortion * 0.7;
  else if (portion === 'large') grams = food.defaultPortion * 1.3;
  else grams = food.defaultPortion;
  return estimateFromGrams(food, Math.round(grams));
}

export function sumMacros(entries) {
  // entries: array of { kcal, protein, carb, fat }
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.kcal || 0),
      protein: acc.protein + (e.protein || 0),
      carb: acc.carb + (e.carb || 0),
      fat: acc.fat + (e.fat || 0)
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 }
  );
}

export function macroPct(macros, target) {
  // macros: today's intake, target: {kcal, protein, carb, fat}
  if (!target) return { kcal: 0, protein: 0, carb: 0, fat: 0 };
  return {
    kcal: target.kcal > 0 ? Math.min(100, (macros.kcal / target.kcal) * 100) : 0,
    protein: target.protein > 0 ? Math.min(100, (macros.protein / target.protein) * 100) : 0,
    carb: target.carb > 0 ? Math.min(100, (macros.carb / target.carb) * 100) : 0,
    fat: target.fat > 0 ? Math.min(100, (macros.fat / target.fat) * 100) : 0
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// BMR via Mifflin-St Jeor (no equipment needed). Used only as a default
// when the user has not set a target. Returns kcal/day.
export function defaultTargetKcal(sex = 'unspecified', weightKg, heightCm, age, activity = 'moderate') {
  if (!weightKg || !heightCm || !age) {
    // Safe-ish default for adults with no biometrics: 2000 kcal
    return { kcal: 2000, protein: 100, carb: 240, fat: 70 };
  }
  const s = sex === 'female' ? -161 : sex === 'male' ? 5 : -78; // neutral
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const factor = activity === 'low' ? 1.3 : activity === 'high' ? 1.7 : 1.55;
  const kcal = Math.round(bmr * factor);
  // Default macro split: 30% protein, 40% carb, 30% fat of kcal
  const protein = Math.round((kcal * 0.3) / 4);
  const carb = Math.round((kcal * 0.4) / 4);
  const fat = Math.round((kcal * 0.3) / 9);
  return { kcal, protein, carb, fat };
}
