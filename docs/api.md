# API Reference

Calorix is a UI, but every module is a pure function. You can import them in Node, in tests, or in your own tool.

## `nutrition/`

### `foodDb.js`

The food database. 87 curated items, public-domain data from Open Food Facts and USDA FoodData Central.

```js
import { foodDb, getFoodById, getFoodsByCategory, searchFoods } from './src/nutrition/foodDb.js';
```

**`foodDb: Food[]`**

A flat array of food entries. See the shape below.

**`getFoodById(id: string): Food | null`**

Returns the food with the given id, or `null` if not found.

**`getFoodsByCategory(category: string): Food[]`**

Filters the DB by category. Valid categories: `protein`, `carb`, `vegetable`, `fruit`, `fat`, `dairy`, `drink`, `snack`, `prepared`.

**`searchFoods(query: string, limit?: number): Food[]`**

Fuzzy search over `name` + `aliases`, case-insensitive, diacritic-insensitive. Returns the top `limit` results (default 8), ordered by relevance (exact > prefix > substring).

```js
searchFoods('haehnchen');         // → [Hähnchenbrust (gegart), ...]
searchFoods('HÄHNCHEN');         // → [Hähnchenbrust (gegart), ...]
searchFoods('hahnchen');         // → [Hähnchenbrust (gegart), ...]  (NFD fold)
searchFoods('xyznotfound');      // → []
```

#### Food shape

```ts
type Food = {
  id: string;          // e.g. 'p01'
  name: string;         // German, present tense
  aliases: string[];    // search terms, lowercase
  category: 'protein' | 'carb' | 'vegetable' | 'fruit' | 'fat' | 'dairy' | 'drink' | 'snack' | 'prepared';
  kcal: number;         // per 100 g
  protein: number;      // g per 100 g
  carb: number;         // g per 100 g
  fat: number;           // g per 100 g
  defaultPortion: number;  // grams
};
```

### `portions.js`

```js
import { portionToGrams, resolvePortionGrams } from './src/nutrition/portions.js';
```

**`portionToGrams(description: string, category?: string): number | null`**

Maps a free-text portion hint to grams, with category awareness. Returns `null` for "klein"/"groß" (caller multiplies default).

| Hint | Protein | Carb | Fat | Vegetable | Default |
|---|---|---|---|---|---|
| "eine Hand voll" | 120g | 80g | 15g | 100g | 100g |
| "eine Faust" | — | 180g | — | 200g | 200g |
| "Daumen" | — | — | 15g | — | 15g |
| "⅓ Teller" | 50g | 83g | — | 133g | 133g |
| "150g" | 150g | 150g | 150g | 150g | 150g |
| "1 Becher" | 250g | 250g | 250g | 250g | 250g |
| "1 EL" | 15g | 15g | 15g | 15g | 15g |
| "1 TL" | 5g | 5g | 5g | 5g | 5g |

**`resolvePortionGrams(description: string, food: Food): number`**

Combines `portionToGrams` with the food's `defaultPortion`. Handles "klein" (0.7×) and "groß" (1.3×) by scaling the default.

### `estimator.js`

```js
import { estimateFromGrams, estimateFromPortion, sumMacros, macroPct, defaultTargetKcal } from './src/nutrition/estimator.js';
```

**`estimateFromGrams(food: Food, grams: number): Macros`**

```js
{
  kcal: number;      // rounded
  protein: number;   // 1 decimal
  carb: number;      // 1 decimal
  fat: number;       // 1 decimal
  grams: number;
}
```

**`estimateFromPortion(food: Food, portion: 'small' | 'medium' | 'large' | number): Macros`**

Maps `small` → 0.7× default, `large` → 1.3× default, `medium` or undefined → default.

**`sumMacros(entries: Macros[]): Macros`**

Element-wise sum. Empty array returns `{ kcal: 0, protein: 0, carb: 0, fat: 0 }`.

**`macroPct(actual: Macros, target: Macros): { kcal, protein, carb, fat }`**

Percentage of each macro against target, clamped to 100. Returns 0 if target is 0.

**`defaultTargetKcal(sex?, weightKg?, heightCm?, age?, activity?): { kcal, protein, carb, fat }`**

Mifflin-St Jeor BMR × activity factor. Default split: 30% protein, 40% carb, 30% fat. If biometrics are missing, returns a safe 2000 kcal.

```js
defaultTargetKcal('male', 80, 180, 35, 'moderate');
// → { kcal: 2748, protein: 206, carb: 275, fat: 92 }
```

## `coach/`

### `frameworks.js`

```js
import { FRAMEWORKS, getTemplate } from './src/coach/frameworks.js';
```

**`FRAMEWORKS: Record<FrameworkId, Framework>`**

The four frameworks with metadata. Use this if you want to enumerate them or render a settings UI.

**`getTemplate(frameworkId, state): ((state) => string) | null`**

Returns the template function for a given framework + state bucket. Lower-level than `engine.js`.

### `engine.js`

```js
import { generateCoachMessage, buildState, pickFramework, macroBadge, dayIndex } from './src/coach/engine.js';
```

**`generateCoachMessage({ macros, target, streak, mood, date? }): { framework, text, state }`**

The high-level entry. Returns the framework, the rendered text, and the state snapshot for UI badges.

**`buildState({ macros, target, streak, mood, date? }): CoachState`**

The internal state object. Exposed for testing and for UI components that want to inspect the state.

**`pickFramework(state): FrameworkId`**

Returns the framework id for a given state. ACT is preferred on rough mood; otherwise the daily rotation is used.

**`macroBadge(actual: Macros, target: Macros): { kcal, protein, carb, fat }`**

Convenience wrapper for the macro ring UI, with `current`, `target`, and `pct` per macro.

**`dayIndex(date?: Date): number`**

Stable integer per calendar day. Used to make coach message selection deterministic per day.

## `engine/storage.js`

```js
import { readJSON, writeJSON, todayKey, loadDay, saveDay, listDayKeys, streakFromKeys } from './src/engine/storage.js';
```

All functions are defensive against quota errors and corrupted JSON. The `calorix:` prefix is added automatically; pass the unprefixed key.

**`todayKey(date?: Date): string`**

Returns `YYYY-MM-DD` for the given date (default: now).

**`loadDay(key?: string): { entries: Entry[] }`**

Loads a day's entries. Default key: today.

**`saveDay(key: string, value: { entries: Entry[] }): boolean`**

Persists a day. Returns `true` on success.

**`listDayKeys(): string[]`**

Returns all day keys in `localStorage`, sorted ascending.

**`streakFromKeys(keys: string[]): number`**

Counts the consecutive days (ending today) for which the key is present. Allows today not yet logged without breaking the streak.

## Cookbook

### Compute the macros for a meal

```js
import { getFoodById, estimateFromPortion } from './src/nutrition/estimator.js';
const chicken = getFoodById('p01');
const meal = estimateFromPortion(chicken, 'medium');
// → { kcal: 248, protein: 46.5, carb: 0, fat: 5.4, grams: 150 }
```

### Build a day's intake from a list of meals

```js
import { sumMacros, estimateFromGrams } from './src/nutrition/estimator.js';
import { getFoodById } from './src/nutrition/foodDb.js';

const items = [
  { foodId: 'p01', grams: 200 },
  { foodId: 'c01', grams: 150 },
  { foodId: 'v01', grams: 200 }
];
const total = sumMacros(
  items.map((it) => estimateFromGrams(getFoodById(it.foodId), it.grams))
);
// → { kcal: 502, protein: 76.4, carb: 67.0, fat: 8.4, grams: 550 }
```

### Render today's coach message

```js
import { generateCoachMessage } from './src/coach/engine.js';
import { defaultTargetKcal } from './src/nutrition/estimator.js';

const target = defaultTargetKcal('male', 80, 180, 35, 'moderate');
const coach = generateCoachMessage({
  macros: { kcal: 1500, protein: 80, carb: 180, fat: 50 },
  target,
  streak: 3,
  mood: 'good'
});

console.log(coach.framework.shortName, '·', coach.framework.citation);
console.log(coach.text);
```

### Build a target from BMR

```js
import { defaultTargetKcal } from './src/nutrition/estimator.js';

const t = defaultTargetKcal('female', 65, 168, 32, 'high');
// → { kcal: 2381, protein: 179, carb: 238, fat: 79 }
```
