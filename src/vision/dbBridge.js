// Vision DB bridge
// ------------------------------------------------------------------
// Maps each item in our 87-food DB to a small "visual signature":
// the colors it tends to have, the edge density it tends to produce,
// and a list of companion signatures that boost / suppress it.

export const VISUAL_TAGS = {
  // Proteins (animal)
  chicken_breast:  { hues: { 0: 0.0, 1: 0.1, 5: 0.0, 2: 0.0 },  warmth: 0.0, greenness: 0.0,  edges: 0.20, sat: 0.20, val: 0.75 },
  beef_steak:      { hues: { 1: 0.1, 5: 0.1, 0: 0.0 },           warmth: 0.05, greenness: 0.0, edges: 0.30, sat: 0.25, val: 0.45 },
  pork_chop:       { hues: { 1: 0.1, 0: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.25, sat: 0.25, val: 0.70 },
  fish_fillet:     { hues: { 0: 0.0, 5: 0.0, 1: 0.0 },           warmth: 0.0, greenness: 0.0,  edges: 0.10, sat: 0.10, val: 0.85 },
  salmon:          { hues: { 0: 0.5, 1: 0.0 },                   warmth: 0.4, greenness: 0.0,  edges: 0.20, sat: 0.50, val: 0.70 },
  shrimp:          { hues: { 0: 0.3, 1: 0.0 },                   warmth: 0.3, greenness: 0.0,  edges: 0.20, sat: 0.40, val: 0.80 },
  eggs:            { hues: { 1: 0.6, 0: 0.0, 2: 0.2 },          warmth: 0.6, greenness: 0.0,  edges: 0.35, sat: 0.60, val: 0.85 },
  tofu:            { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.10, sat: 0.05, val: 0.92 },

  // Carbs
  white_rice:      { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.10, sat: 0.10, val: 0.92 },
  brown_rice:      { hues: { 1: 0.3, 5: 0.1 },                   warmth: 0.15, greenness: 0.0, edges: 0.15, sat: 0.20, val: 0.65 },
  pasta:           { hues: { 1: 0.2, 0: 0.1, 2: 0.1 },          warmth: 0.15, greenness: 0.0, edges: 0.15, sat: 0.30, val: 0.80 },
  bread:           { hues: { 1: 0.3, 5: 0.1 },                   warmth: 0.15, greenness: 0.0, edges: 0.45, sat: 0.25, val: 0.80 },
  potato:          { hues: { 1: 0.1, 5: 0.0 },                   warmth: 0.05, greenness: 0.0, edges: 0.20, sat: 0.10, val: 0.88 },
  oats:            { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.15, sat: 0.15, val: 0.85 },

  // Vegetables
  // After the bucket fix: "green" = bucket 2 (yellow-green 120..180°).
  broccoli:        { hues: { 2: 0.9, 1: 0.0, 0: 0.0 },          warmth: 0.0, greenness: 0.9,  edges: 0.50, sat: 0.65, val: 0.55 },
  spinach:         { hues: { 2: 0.9, 5: 0.0 },                   warmth: 0.0, greenness: 0.9,  edges: 0.30, sat: 0.55, val: 0.40 },
  salad_mix:       { hues: { 2: 0.9, 1: 0.05, 5: 0.0 },         warmth: 0.0, greenness: 0.9,  edges: 0.40, sat: 0.50, val: 0.65 },
  tomato:          { hues: { 0: 0.95, 1: 0.0 },                  warmth: 0.6, greenness: 0.0,  edges: 0.25, sat: 0.80, val: 0.70 },
  cucumber:        { hues: { 2: 0.6, 3: 0.2 },                   warmth: 0.0, greenness: 0.7,  edges: 0.20, sat: 0.30, val: 0.85 },
  carrot:          { hues: { 1: 0.95, 0: 0.05 },                 warmth: 0.6, greenness: 0.0,  edges: 0.30, sat: 0.85, val: 0.70 },
  bell_pepper_red: { hues: { 0: 0.95, 1: 0.05 },                 warmth: 0.7, greenness: 0.0,  edges: 0.30, sat: 0.85, val: 0.70 },
  bell_pepper_green: { hues: { 2: 0.9, 1: 0.0 },                 warmth: 0.0, greenness: 0.9,  edges: 0.30, sat: 0.70, val: 0.65 },
  bell_pepper_yellow: { hues: { 1: 0.95, 0: 0.05 },              warmth: 0.4, greenness: 0.0,  edges: 0.30, sat: 0.85, val: 0.80 },
  onion:           { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.20, sat: 0.15, val: 0.92 },
  mushroom:        { hues: { 5: 0.2, 1: 0.1 },                   warmth: 0.05, greenness: 0.0, edges: 0.30, sat: 0.20, val: 0.65 },

  // Fruits
  apple:           { hues: { 0: 0.6, 2: 0.3, 1: 0.1 },          warmth: 0.2, greenness: 0.3,  edges: 0.40, sat: 0.55, val: 0.75 },
  banana:          { hues: { 1: 0.95, 0: 0.05 },                 warmth: 0.3, greenness: 0.0,  edges: 0.25, sat: 0.75, val: 0.88 },
  orange:          { hues: { 1: 0.95, 0: 0.05 },                 warmth: 0.7, greenness: 0.0,  edges: 0.30, sat: 0.85, val: 0.80 },
  berries_mix:     { hues: { 5: 0.6, 0: 0.3, 4: 0.1 },          warmth: 0.1, greenness: 0.0,  edges: 0.40, sat: 0.85, val: 0.55 },
  grapes:          { hues: { 5: 0.7, 3: 0.2 },                   warmth: 0.0, greenness: 0.2,  edges: 0.30, sat: 0.55, val: 0.55 },
  avocado:         { hues: { 2: 0.6, 1: 0.3 },                   warmth: 0.0, greenness: 0.6,  edges: 0.30, sat: 0.55, val: 0.70 },

  // Dairy
  cheese:          { hues: { 1: 0.6, 0: 0.3 },                   warmth: 0.4, greenness: 0.0,  edges: 0.30, sat: 0.55, val: 0.88 },
  yogurt:          { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.05, sat: 0.10, val: 0.95 },
  milk:            { hues: { 5: 0.0 },                           warmth: 0.0, greenness: 0.0,  edges: 0.00, sat: 0.05, val: 0.98 },
  butter:          { hues: { 1: 0.95 },                          warmth: 0.4, greenness: 0.0,  edges: 0.10, sat: 0.85, val: 0.92 },

  // Prepared dishes (multi-signal)
  pizza:           { hues: { 0: 0.4, 1: 0.2, 2: 0.2, 5: 0.2 }, warmth: 0.4, greenness: 0.0,  edges: 0.55, sat: 0.65, val: 0.65 },
  burger:          { hues: { 1: 0.5, 5: 0.2, 0: 0.1, 2: 0.1 }, warmth: 0.2, greenness: 0.1,  edges: 0.55, sat: 0.45, val: 0.55 },
  salad_bowl:      { hues: { 2: 0.7, 1: 0.1, 0: 0.1, 0: 0.1 }, warmth: 0.0, greenness: 0.7,  edges: 0.45, sat: 0.55, val: 0.65 },
  stir_fry:        { hues: { 2: 0.4, 1: 0.2, 0: 0.2, 5: 0.1 }, warmth: 0.1, greenness: 0.4,  edges: 0.40, sat: 0.50, val: 0.65 },
  soup:            { hues: { 1: 0.4, 2: 0.2, 0: 0.2 },          warmth: 0.4, greenness: 0.2,  edges: 0.10, sat: 0.35, val: 0.70 },
  curry:           { hues: { 1: 0.7, 0: 0.2, 2: 0.1 },          warmth: 0.5, greenness: 0.0,  edges: 0.25, sat: 0.60, val: 0.60 },
  sushi:           { hues: { 5: 0.4, 0: 0.2, 2: 0.2, 1: 0.1 }, warmth: 0.05, greenness: 0.2, edges: 0.30, sat: 0.45, val: 0.75 },
  fries:           { hues: { 1: 0.7, 2: 0.3 },                   warmth: 0.4, greenness: 0.0,  edges: 0.45, sat: 0.55, val: 0.75 },
  sandwich:        { hues: { 1: 0.4, 2: 0.2, 0: 0.2, 5: 0.2 }, warmth: 0.2, greenness: 0.2,  edges: 0.55, sat: 0.50, val: 0.70 },
  pancake:         { hues: { 1: 0.6, 2: 0.3 },                   warmth: 0.4, greenness: 0.0,  edges: 0.35, sat: 0.55, val: 0.78 },
  oatmeal_bowl:    { hues: { 5: 0.0, 1: 0.0, 2: 0.0 },         warmth: 0.0, greenness: 0.0,  edges: 0.10, sat: 0.20, val: 0.85 },
  smoothie:        { hues: { 2: 0.4, 0: 0.3, 5: 0.2 },          warmth: 0.0, greenness: 0.4,  edges: 0.10, sat: 0.55, val: 0.65 },
  ramen:           { hues: { 1: 0.5, 2: 0.2, 0: 0.1, 2: 0.1 }, warmth: 0.3, greenness: 0.1,  edges: 0.30, sat: 0.50, val: 0.70 },

  // Aliases for the 87-item DB
  rice_bowl:       { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.10, sat: 0.10, val: 0.85 },
  couscous:        { hues: { 1: 0.3, 5: 0.0 },                   warmth: 0.10, greenness: 0.0, edges: 0.10, sat: 0.15, val: 0.85 },
  zucchini:        { hues: { 2: 0.7, 1: 0.2 },                   warmth: 0.0, greenness: 0.7,  edges: 0.20, sat: 0.30, val: 0.80 },
  brussels_sprouts: { hues: { 2: 0.7, 1: 0.3 },                  warmth: 0.0, greenness: 0.7,  edges: 0.35, sat: 0.50, val: 0.70 },
  green_beans:     { hues: { 2: 0.8, 1: 0.0 },                   warmth: 0.0, greenness: 0.8,  edges: 0.30, sat: 0.45, val: 0.70 },
  aubergine:       { hues: { 5: 0.5, 0: 0.2, 2: 0.2 },          warmth: 0.0, greenness: 0.1,  edges: 0.30, sat: 0.50, val: 0.50 },
  kiwi:            { hues: { 2: 0.6, 1: 0.3 },                   warmth: 0.1, greenness: 0.5,  edges: 0.25, sat: 0.55, val: 0.75 },
  pineapple:       { hues: { 1: 0.9, 0: 0.05 },                  warmth: 0.4, greenness: 0.0,  edges: 0.30, sat: 0.80, val: 0.80 },
  sweet_potato:    { hues: { 1: 0.7, 0: 0.2 },                   warmth: 0.5, greenness: 0.0,  edges: 0.30, sat: 0.55, val: 0.70 },
  nuts_mix:        { hues: { 1: 0.5, 5: 0.2, 0: 0.2 },          warmth: 0.2, greenness: 0.0,  edges: 0.40, sat: 0.40, val: 0.65 },
  peanut_butter:   { hues: { 1: 0.6, 5: 0.2 },                   warmth: 0.3, greenness: 0.0,  edges: 0.10, sat: 0.60, val: 0.70 },
  olive_oil:       { hues: { 1: 0.8 },                           warmth: 0.4, greenness: 0.0,  edges: 0.0,  sat: 0.70, val: 0.85 },
  seeds:           { hues: { 5: 0.3, 1: 0.3, 0: 0.1 },          warmth: 0.0, greenness: 0.0,  edges: 0.30, sat: 0.30, val: 0.60 },
  chocolate_dark:  { hues: { 5: 0.3, 1: 0.3 },                   warmth: 0.0, greenness: 0.0,  edges: 0.30, sat: 0.55, val: 0.40 },
  chocolate_milk:  { hues: { 1: 0.5, 5: 0.2 },                   warmth: 0.2, greenness: 0.0,  edges: 0.20, sat: 0.50, val: 0.55 },
  cookies:         { hues: { 1: 0.5, 5: 0.2 },                   warmth: 0.2, greenness: 0.0,  edges: 0.45, sat: 0.45, val: 0.70 },
  rice_cake:       { hues: { 5: 0.0, 1: 0.0 },                   warmth: 0.0, greenness: 0.0,  edges: 0.30, sat: 0.10, val: 0.92 },
  popcorn:         { hues: { 1: 0.5, 2: 0.3 },                   warmth: 0.3, greenness: 0.0,  edges: 0.40, sat: 0.30, val: 0.85 },
  kebab:           { hues: { 1: 0.5, 0: 0.2, 2: 0.2 },          warmth: 0.3, greenness: 0.1,  edges: 0.45, sat: 0.50, val: 0.55 },
  lasagna:         { hues: { 0: 0.4, 1: 0.2, 2: 0.2, 5: 0.2 }, warmth: 0.4, greenness: 0.0,  edges: 0.50, sat: 0.55, val: 0.60 },
  poke_bowl:       { hues: { 2: 0.4, 0: 0.2, 1: 0.2, 5: 0.2 }, warmth: 0.1, greenness: 0.4,  edges: 0.35, sat: 0.50, val: 0.70 },
};

let _database = null;
export function getDatabase() {
  if (_database) return _database;
  // Lazy import to keep this file's footprint small.
  // The real DB is /root/calorix/src/data/food.js
  // (loaded by the main app).
  throw new Error('Food DB not loaded. Call setDatabase(foods) from the app entry first.');
}
export function setDatabase(foods) {
  // Each item must be { id, name, kcal, protein, carb, fat, group, ... }.
  // We expect the food.js DB to have a `visionId` field matching VISUAL_TAGS keys.
  _database = foods;
}
