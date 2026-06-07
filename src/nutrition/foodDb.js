// Calorix FoodDB (curated, offline-bundled).
// Inspired by Open Food Facts + USDA FoodData Central (both public domain).
// Values are kcal and macros per 100 g unless stated otherwise. Sources are
// typical retail products; individual variation can be ±15%.
//
// Adding items: append to the array. Each item MUST have a unique id,
// a non-empty name, kcal, protein, carb, fat (all numbers, g/100g).
// `category` is one of: protein, carb, vegetable, fruit, fat, dairy, drink, snack, prepared.

export const foodDb = [
  // Proteine (Tierisch & Pflanzlich)
  { id: 'p01', name: 'Hähnchenbrust (gegart)', aliases: ['hähnchen', 'chicken breast'], category: 'protein', kcal: 165, protein: 31, carb: 0, fat: 3.6, defaultPortion: 150 },
  { id: 'p02', name: 'Rindersteak (Lenden, mager)', aliases: ['rind', 'beef sirloin'], category: 'protein', kcal: 206, protein: 29, carb: 0, fat: 9, defaultPortion: 180 },
  { id: 'p03', name: 'Lachs (gegart)', aliases: ['salmon', 'lachsfilet'], category: 'protein', kcal: 208, protein: 22, carb: 0, fat: 13, defaultPortion: 150 },
  { id: 'p04', name: 'Thunfisch (Dose, in Wasser)', aliases: ['tuna'], category: 'protein', kcal: 116, protein: 26, carb: 0, fat: 1, defaultPortion: 100 },
  { id: 'p05', name: 'Ei (gekocht)', aliases: ['ei', 'egg'], category: 'protein', kcal: 155, protein: 13, carb: 1.1, fat: 11, defaultPortion: 60 },
  { id: 'p06', name: 'Eiklar', aliases: ['egg white'], category: 'protein', kcal: 52, protein: 11, carb: 0.7, fat: 0.2, defaultPortion: 100 },
  { id: 'p07', name: 'Tofu (natur)', aliases: ['tofu'], category: 'protein', kcal: 76, protein: 8, carb: 1.9, fat: 4.8, defaultPortion: 100 },
  { id: 'p08', name: 'Tempeh', aliases: ['tempeh'], category: 'protein', kcal: 192, protein: 20, carb: 7.6, fat: 11, defaultPortion: 100 },
  { id: 'p09', name: 'Griechischer Joghurt (0,2% Fett)', aliases: ['joghurt', 'greek yogurt'], category: 'dairy', kcal: 59, protein: 10, carb: 3.6, fat: 0.4, defaultPortion: 150 },
  { id: 'p10', name: 'Skyr', aliases: ['skyr'], category: 'dairy', kcal: 63, protein: 11, carb: 4, fat: 0.2, defaultPortion: 150 },
  { id: 'p11', name: 'Quark (Magerstufe)', aliases: ['quark', 'cottage cheese'], category: 'dairy', kcal: 72, protein: 12, carb: 4, fat: 0.3, defaultPortion: 150 },
  { id: 'p12', name: 'Hüttenkäse', aliases: ['cottage cheese'], category: 'dairy', kcal: 98, protein: 11, carb: 3.4, fat: 4.3, defaultPortion: 100 },

  // Kohlenhydrate (Beilagen)
  { id: 'c01', name: 'Reis (weiß, gekocht)', aliases: ['rice', 'jasmin'], category: 'carb', kcal: 130, protein: 2.7, carb: 28, fat: 0.3, defaultPortion: 150 },
  { id: 'c02', name: 'Reis (braun, gekocht)', aliases: ['brown rice'], category: 'carb', kcal: 112, protein: 2.6, carb: 24, fat: 0.9, defaultPortion: 150 },
  { id: 'c03', name: 'Pasta (gekocht)', aliases: ['nudeln', 'spaghetti', 'penne'], category: 'carb', kcal: 158, protein: 5.8, carb: 31, fat: 0.9, defaultPortion: 150 },
  { id: 'c04', name: 'Vollkornpasta (gekocht)', aliases: ['whole wheat pasta'], category: 'carb', kcal: 124, protein: 5, carb: 26, fat: 1.1, defaultPortion: 150 },
  { id: 'c05', name: 'Haferflocken (trocken)', aliases: ['hafer', 'oats', 'oatmeal'], category: 'carb', kcal: 379, protein: 13, carb: 67, fat: 7, defaultPortion: 60 },
  { id: 'c06', name: 'Brot (Vollkorn)', aliases: ['whole grain bread'], category: 'carb', kcal: 247, protein: 9, carb: 41, fat: 4.2, defaultPortion: 50 },
  { id: 'c07', name: 'Brot (Weiß)', aliases: ['white bread', 'toast'], category: 'carb', kcal: 265, protein: 9, carb: 49, fat: 3.2, defaultPortion: 50 },
  { id: 'c08', name: 'Kartoffel (gekocht)', aliases: ['potato'], category: 'carb', kcal: 87, protein: 1.9, carb: 20, fat: 0.1, defaultPortion: 200 },
  { id: 'c09', name: 'Süßkartoffel (gebacken)', aliases: ['sweet potato'], category: 'carb', kcal: 90, protein: 2, carb: 21, fat: 0.1, defaultPortion: 200 },
  { id: 'c10', name: 'Quinoa (gekocht)', aliases: ['quinoa'], category: 'carb', kcal: 120, protein: 4.4, carb: 21, fat: 1.9, defaultPortion: 150 },
  { id: 'c11', name: 'Couscous (gekocht)', aliases: ['couscous'], category: 'carb', kcal: 112, protein: 3.8, carb: 23, fat: 0.2, defaultPortion: 150 },

  // Gemüse
  { id: 'v01', name: 'Brokkoli (gedämpft)', aliases: ['broccoli'], category: 'vegetable', kcal: 35, protein: 2.4, carb: 7.2, fat: 0.4, defaultPortion: 150 },
  { id: 'v02', name: 'Spinat (gegart)', aliases: ['spinach'], category: 'vegetable', kcal: 23, protein: 3, carb: 3.6, fat: 0.3, defaultPortion: 100 },
  { id: 'v03', name: 'Karotten (roh)', aliases: ['carrot', 'möhren'], category: 'vegetable', kcal: 41, protein: 0.9, carb: 9.6, fat: 0.2, defaultPortion: 100 },
  { id: 'v04', name: 'Paprika (rot, roh)', aliases: ['bell pepper'], category: 'vegetable', kcal: 31, protein: 1, carb: 6, fat: 0.3, defaultPortion: 100 },
  { id: 'v05', name: 'Tomate (roh)', aliases: ['tomato'], category: 'vegetable', kcal: 18, protein: 0.9, carb: 3.9, fat: 0.2, defaultPortion: 100 },
  { id: 'v06', name: 'Gurke (roh)', aliases: ['cucumber'], category: 'vegetable', kcal: 15, protein: 0.7, carb: 3.6, fat: 0.1, defaultPortion: 100 },
  { id: 'v07', name: 'Zucchini (gegart)', aliases: ['zucchini'], category: 'vegetable', kcal: 17, protein: 1.2, carb: 3.1, fat: 0.3, defaultPortion: 150 },
  { id: 'v08', name: 'Rosenkohl (gegart)', aliases: ['brussels sprouts'], category: 'vegetable', kcal: 36, protein: 2.6, carb: 7.1, fat: 0.5, defaultPortion: 100 },
  { id: 'v09', name: 'Grüne Bohnen (gegart)', aliases: ['green beans'], category: 'vegetable', kcal: 35, protein: 1.9, carb: 7.9, fat: 0.2, defaultPortion: 100 },
  { id: 'v10', name: 'Aubergine (gegart)', aliases: ['eggplant'], category: 'vegetable', kcal: 25, protein: 0.8, carb: 5.9, fat: 0.2, defaultPortion: 150 },
  { id: 'v11', name: 'Paprika (grün, roh)', aliases: ['green bell pepper'], category: 'vegetable', kcal: 20, protein: 0.9, carb: 4.6, fat: 0.2, defaultPortion: 100 },

  // Obst
  { id: 'f01', name: 'Apfel', aliases: ['apple'], category: 'fruit', kcal: 52, protein: 0.3, carb: 14, fat: 0.2, defaultPortion: 150 },
  { id: 'f02', name: 'Banane', aliases: ['banana'], category: 'fruit', kcal: 89, protein: 1.1, carb: 23, fat: 0.3, defaultPortion: 120 },
  { id: 'f03', name: 'Beerenmix (gemischt)', aliases: ['berries', 'blaubeeren', 'erdbeeren'], category: 'fruit', kcal: 50, protein: 0.7, carb: 12, fat: 0.3, defaultPortion: 100 },
  { id: 'f04', name: 'Orange', aliases: ['orange'], category: 'fruit', kcal: 47, protein: 0.9, carb: 12, fat: 0.1, defaultPortion: 130 },
  { id: 'f05', name: 'Trauben', aliases: ['grapes'], category: 'fruit', kcal: 69, protein: 0.7, carb: 18, fat: 0.2, defaultPortion: 100 },
  { id: 'f06', name: 'Avocado', aliases: ['avocado'], category: 'fat', kcal: 160, protein: 2, carb: 9, fat: 15, defaultPortion: 100 },
  { id: 'f07', name: 'Kiwi', aliases: ['kiwi'], category: 'fruit', kcal: 61, protein: 1.1, carb: 15, fat: 0.5, defaultPortion: 100 },
  { id: 'f08', name: 'Ananas', aliases: ['pineapple'], category: 'fruit', kcal: 50, protein: 0.5, carb: 13, fat: 0.1, defaultPortion: 100 },

  // Fette & Nüsse
  { id: 'fa01', name: 'Mandeln', aliases: ['almonds'], category: 'fat', kcal: 579, protein: 21, carb: 22, fat: 50, defaultPortion: 30 },
  { id: 'fa02', name: 'Walnüsse', aliases: ['walnuts'], category: 'fat', kcal: 654, protein: 15, carb: 14, fat: 65, defaultPortion: 30 },
  { id: 'fa03', name: 'Erdnussbutter (natur)', aliases: ['peanut butter'], category: 'fat', kcal: 588, protein: 25, carb: 20, fat: 50, defaultPortion: 20 },
  { id: 'fa04', name: 'Olivenöl', aliases: ['olive oil', 'öl'], category: 'fat', kcal: 884, protein: 0, carb: 0, fat: 100, defaultPortion: 10 },
  { id: 'fa05', name: 'Butter', aliases: ['butter'], category: 'fat', kcal: 717, protein: 0.9, carb: 0.1, fat: 81, defaultPortion: 10 },
  { id: 'fa06', name: 'Chiasamen', aliases: ['chia seeds'], category: 'fat', kcal: 486, protein: 17, carb: 42, fat: 31, defaultPortion: 15 },
  { id: 'fa07', name: 'Leinsamen', aliases: ['flax seeds'], category: 'fat', kcal: 534, protein: 18, carb: 29, fat: 42, defaultPortion: 15 },

  // Käse & Milchprodukte
  { id: 'd01', name: 'Hüttenkäse light', aliases: ['cottage cheese'], category: 'dairy', kcal: 81, protein: 12, carb: 2.7, fat: 2.3, defaultPortion: 100 },
  { id: 'd02', name: 'Mozzarella (light)', aliases: ['mozzarella'], category: 'dairy', kcal: 254, protein: 24, carb: 2.8, fat: 16, defaultPortion: 60 },
  { id: 'd03', name: 'Feta', aliases: ['feta'], category: 'dairy', kcal: 264, protein: 14, carb: 4, fat: 21, defaultPortion: 50 },
  { id: 'd04', name: 'Milch (1,5% Fett)', aliases: ['milk'], category: 'dairy', kcal: 47, protein: 3.4, carb: 4.8, fat: 1.5, defaultPortion: 200 },
  { id: 'd05', name: 'Parmesan', aliases: ['parmesan', 'parmigiano'], category: 'dairy', kcal: 431, protein: 38, carb: 4.1, fat: 29, defaultPortion: 20 },
  { id: 'd06', name: 'Frischkäse (light)', aliases: ['cream cheese'], category: 'dairy', kcal: 150, protein: 8, carb: 6, fat: 10, defaultPortion: 30 },

  // Hülsenfrüchte
  { id: 'l01', name: 'Linsen (gekocht)', aliases: ['lentils'], category: 'protein', kcal: 116, protein: 9, carb: 20, fat: 0.4, defaultPortion: 150 },
  { id: 'l02', name: 'Kichererbsen (gekocht)', aliases: ['chickpeas', 'garbanzo'], category: 'protein', kcal: 164, protein: 8.9, carb: 27, fat: 2.6, defaultPortion: 150 },
  { id: 'l03', name: 'Schwarze Bohnen (gekocht)', aliases: ['black beans'], category: 'protein', kcal: 132, protein: 8.9, carb: 24, fat: 0.5, defaultPortion: 150 },
  { id: 'l04', name: 'Kidneybohnen (gekocht)', aliases: ['kidney beans'], category: 'protein', kcal: 127, protein: 8.7, carb: 23, fat: 0.5, defaultPortion: 150 },

  // Getränke
  { id: 'b01', name: 'Wasser', aliases: ['water'], category: 'drink', kcal: 0, protein: 0, carb: 0, fat: 0, defaultPortion: 250 },
  { id: 'b02', name: 'Kaffee (schwarz)', aliases: ['coffee', 'kaffee'], category: 'drink', kcal: 2, protein: 0.3, carb: 0, fat: 0, defaultPortion: 200 },
  { id: 'b03', name: 'Tee (ungesüßt)', aliases: ['tea'], category: 'drink', kcal: 1, protein: 0, carb: 0.3, fat: 0, defaultPortion: 250 },
  { id: 'b04', name: 'Cola', aliases: ['coke'], category: 'drink', kcal: 42, protein: 0, carb: 11, fat: 0, defaultPortion: 330 },
  { id: 'b05', name: 'Orangensaft', aliases: ['oj', 'orange juice'], category: 'drink', kcal: 45, protein: 0.7, carb: 10, fat: 0.2, defaultPortion: 250 },
  { id: 'b06', name: 'Bier (pils, 4,9%)', aliases: ['beer', 'pils'], category: 'drink', kcal: 43, protein: 0.5, carb: 3.6, fat: 0, defaultPortion: 330 },
  { id: 'b07', name: 'Rotwein', aliases: ['red wine', 'wein'], category: 'drink', kcal: 85, protein: 0.1, carb: 2.6, fat: 0, defaultPortion: 150 },
  { id: 'b08', name: 'Hafermilch (ungesüßt)', aliases: ['oat milk'], category: 'drink', kcal: 47, protein: 0.4, carb: 7.5, fat: 1.5, defaultPortion: 200 },
  { id: 'b09', name: 'Mandelmilch (ungesüßt)', aliases: ['almond milk'], category: 'drink', kcal: 13, protein: 0.4, carb: 0.6, fat: 1.1, defaultPortion: 200 },
  { id: 'b10', name: 'Proteinshake (Whey, Standard)', aliases: ['protein shake', 'whey'], category: 'drink', kcal: 120, protein: 24, carb: 3, fat: 1.5, defaultPortion: 300 },

  // Snacks
  { id: 's01', name: 'Müsliriegel (Standard)', aliases: ['granola bar'], category: 'snack', kcal: 420, protein: 8, carb: 65, fat: 14, defaultPortion: 35 },
  { id: 's02', name: 'Erdnussflips', aliases: ['peanut flips'], category: 'snack', kcal: 510, protein: 14, carb: 50, fat: 28, defaultPortion: 30 },
  { id: 's03', name: 'Bitterschokolade (85%)', aliases: ['dark chocolate'], category: 'snack', kcal: 600, protein: 8, carb: 22, fat: 53, defaultPortion: 20 },
  { id: 's04', name: 'Vollkornkeks', aliases: ['whole grain cookie'], category: 'snack', kcal: 460, protein: 7, carb: 65, fat: 18, defaultPortion: 20 },
  { id: 's05', name: 'Reiswaffel', aliases: ['rice cake'], category: 'snack', kcal: 380, protein: 8, carb: 80, fat: 3, defaultPortion: 20 },
  { id: 's06', name: 'Popcorn (luftgepoppt)', aliases: ['popcorn'], category: 'snack', kcal: 387, protein: 12, carb: 78, fat: 4, defaultPortion: 30 },

  // Zubereitete Gerichte (für typische Außer-Haus-Schätzungen)
  { id: 'm01', name: 'Pizza Margherita (1 Stück)', aliases: ['pizza'], category: 'prepared', kcal: 266, protein: 11, carb: 33, fat: 10, defaultPortion: 200 },
  { id: 'm02', name: 'Caesar Salad', aliases: ['salad'], category: 'prepared', kcal: 158, protein: 7, carb: 8, fat: 11, defaultPortion: 250 },
  { id: 'm03', name: 'Burger (Classic, mit Pommes)', aliases: ['hamburger'], category: 'prepared', kcal: 540, protein: 25, carb: 40, fat: 28, defaultPortion: 350 },
  { id: 'm04', name: 'Sushi-Rolle (8 Stück)', aliases: ['sushi'], category: 'prepared', kcal: 255, protein: 9, carb: 38, fat: 7, defaultPortion: 200 },
  { id: 'm05', name: 'Pad Thai (mit Hähnchen)', aliases: ['nudeln asia'], category: 'prepared', kcal: 380, protein: 18, carb: 50, fat: 12, defaultPortion: 350 },
  { id: 'm06', name: 'Buddha Bowl (vegetarisch)', aliases: ['bowl'], category: 'prepared', kcal: 480, protein: 16, carb: 60, fat: 18, defaultPortion: 400 },
  { id: 'm07', name: 'Döner Kebap (mit Fleisch)', aliases: ['kebap'], category: 'prepared', kcal: 600, protein: 30, carb: 50, fat: 28, defaultPortion: 350 },
  { id: 'm08', name: 'Lasagne (klassisch)', aliases: ['lasagna'], category: 'prepared', kcal: 165, protein: 9, carb: 14, fat: 8, defaultPortion: 300 },
  { id: 'm09', name: 'Bowl mit Reis, Lachs, Avocado', aliases: ['poke'], category: 'prepared', kcal: 520, protein: 28, carb: 55, fat: 18, defaultPortion: 400 },
  { id: 'm10', name: 'Müsli mit Milch (Standard)', aliases: ['muesli'], category: 'prepared', kcal: 220, protein: 9, carb: 38, fat: 4, defaultPortion: 300 }
];

// Helpers
export function getFoodById(id) {
  return foodDb.find((f) => f.id === id) || null;
}

export function getFoodsByCategory(cat) {
  return foodDb.filter((f) => f.category === cat);
}

// Fuzzy search: case-insensitive, diacritic-insensitive substring over
// name + aliases. Returns matches with a basic relevance score (exact > prefix > substring).
// Unicode NFD + diacritic strip handles ä/ö/ü/ß: "hähnchen" matches "hahnchen".
function fold(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');
}

export function searchFoods(query, limit = 8) {
  if (!query || query.length < 1) return [];
  const q = fold(query).trim();
  const results = [];
  for (const f of foodDb) {
    const name = fold(f.name);
    const aliases = (f.aliases || []).map(fold);
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (aliases.some((a) => a === q)) score = 75;
    else if (name.includes(q)) score = 50;
    else if (aliases.some((a) => a.includes(q))) score = 40;
    if (score > 0) results.push({ food: f, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.food);
}
