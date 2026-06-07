// Auto-mapper: maps every item in foodDb.js to a visionId from VISUAL_TAGS.
// This file is a pure declarative mapping, generated once from inspection
// of the DB + visual signatures. Edit only when adding new food items
// with a unique visual identity.

export const VISION_MAP = {
  // Proteins
  p01: { visionId: 'chicken_breast', shape: 'plate' },
  p02: { visionId: 'beef_steak', shape: 'plate' },
  p03: { visionId: 'salmon', shape: 'plate' },
  p04: { visionId: 'fish_fillet', shape: 'plate' },
  p05: { visionId: 'eggs', shape: 'plate' },
  p06: { visionId: 'eggs', shape: 'plate' },
  p07: { visionId: 'tofu', shape: 'plate' },
  p08: { visionId: 'tofu', shape: 'plate' },

  // Dairy
  p09: { visionId: 'yogurt', shape: 'bowl' },
  p10: { visionId: 'yogurt', shape: 'bowl' },
  p11: { visionId: 'yogurt', shape: 'bowl' },
  p12: { visionId: 'cheese', shape: 'plate' },

  // Carbs
  c01: { visionId: 'white_rice', shape: 'plate' },
  c02: { visionId: 'brown_rice', shape: 'plate' },
  c03: { visionId: 'pasta', shape: 'plate' },
  c04: { visionId: 'pasta', shape: 'plate' },
  c05: { visionId: 'oats', shape: 'bowl' },
  c06: { visionId: 'bread', shape: 'plate' },
  c07: { visionId: 'bread', shape: 'plate' },
  c08: { visionId: 'potato', shape: 'plate' },
  c09: { visionId: 'sweet_potato', shape: 'plate' },
  c10: { visionId: 'rice_bowl', shape: 'plate' },
  c11: { visionId: 'couscous', shape: 'plate' },

  // Vegetables
  v01: { visionId: 'broccoli', shape: 'plate' },
  v02: { visionId: 'spinach', shape: 'plate' },
  v03: { visionId: 'carrot', shape: 'plate' },
  v04: { visionId: 'bell_pepper_red', shape: 'plate' },
  v05: { visionId: 'tomato', shape: 'plate' },
  v06: { visionId: 'cucumber', shape: 'plate' },
  v07: { visionId: 'zucchini', shape: 'plate' },
  v08: { visionId: 'brussels_sprouts', shape: 'plate' },
  v09: { visionId: 'green_beans', shape: 'plate' },
  v10: { visionId: 'aubergine', shape: 'plate' },
  v11: { visionId: 'bell_pepper_green', shape: 'plate' },

  // Fruits
  f01: { visionId: 'apple', shape: 'bowl' },
  f02: { visionId: 'banana', shape: 'bowl' },
  f03: { visionId: 'berries_mix', shape: 'bowl' },
  f04: { visionId: 'orange', shape: 'bowl' },
  f05: { visionId: 'grapes', shape: 'bowl' },
  f06: { visionId: 'avocado', shape: 'plate' },
  f07: { visionId: 'kiwi', shape: 'bowl' },
  f08: { visionId: 'pineapple', shape: 'plate' },

  // Fats
  fa01: { visionId: 'nuts_mix', shape: 'bowl' },
  fa02: { visionId: 'nuts_mix', shape: 'bowl' },
  fa03: { visionId: 'peanut_butter', shape: 'plate' },
  fa04: { visionId: 'olive_oil', shape: 'plate' },
  fa05: { visionId: 'butter', shape: 'plate' },
  fa06: { visionId: 'seeds', shape: 'bowl' },
  fa07: { visionId: 'seeds', shape: 'bowl' },

  // Drinks
  dr01: { visionId: 'milk', shape: 'bowl' },
  dr02: { visionId: 'milk', shape: 'bowl' },
  dr03: { visionId: 'milk', shape: 'bowl' },
  dr04: { visionId: 'milk', shape: 'bowl' },
  dr05: { visionId: 'milk', shape: 'bowl' },
  dr06: { visionId: 'milk', shape: 'bowl' },

  // Snacks
  s01: { visionId: 'chocolate_dark', shape: 'plate' },
  s02: { visionId: 'chocolate_milk', shape: 'plate' },
  s03: { visionId: 'cookies', shape: 'plate' },
  s04: { visionId: 'cookies', shape: 'plate' },
  s05: { visionId: 'rice_cake', shape: 'plate' },
  s06: { visionId: 'popcorn', shape: 'bowl' },

  // Prepared dishes
  m01: { visionId: 'pizza', shape: 'plate' },
  m02: { visionId: 'salad_bowl', shape: 'bowl' },
  m03: { visionId: 'burger', shape: 'plate' },
  m04: { visionId: 'sushi', shape: 'plate' },
  m05: { visionId: 'stir_fry', shape: 'plate' },
  m06: { visionId: 'salad_bowl', shape: 'bowl' },
  m07: { visionId: 'kebab', shape: 'plate' },
  m08: { visionId: 'lasagna', shape: 'plate' },
  m09: { visionId: 'poke_bowl', shape: 'bowl' },
  m10: { visionId: 'oatmeal_bowl', shape: 'bowl' },
};

/**
 * Annotates a food DB array with visionId + shape from VISION_MAP.
 * Items without a vision mapping get null (scorer will treat them as
 * "no visual signature" and score them at the floor).
 */
export function annotateFoodDb(foods) {
  return foods.map((f) => ({
    ...f,
    visionId: VISION_MAP[f.id]?.visionId ?? null,
    shape: VISION_MAP[f.id]?.shape ?? 'plate',
  }));
}
