# Examples

Calorix is a UI, but every module is a pure function. These examples show how to use the engine from the command line, in tests, or in your own tools.

## CLI coach

Print today's coach message and macro totals.

```bash
node examples/cli-coach.js
```

Output:

```
Calorix · 2026-06-07
Ziel:    2468 kcal · 185P · 247C · 82F
Heute:   1850 kcal · 92.0P · 215.0C · 58.0F
Streak:  4 Tage

Coach (ACT, Hayes et al., 1999):
  4 Tage bewusst. Welcher Wert steht dahinter, der größer ist als nur "gesund essen"?
```

## Macro counter

Read items from stdin, print per-item macros and totals.

```bash
echo "p01 200
Reis 1 Tasse
v01 150" | node examples/macro-counter.js
```

Output:

```
  Hähnchenbrust (gegart) · 200g · 330 kcal
  Reis (weiß, gekocht) · 250g · 325 kcal
  Brokkoli (gedämpft) · 150g · 53 kcal

Total:
  708 kcal · 78.0g P · 75.4g C · 7.9g F
```

## Trend report

Generate a 7-day report from an exported `localStorage` JSON snapshot.

```bash
# In the browser console, export your data:
#   JSON.stringify(Object.fromEntries(
#     Object.entries(localStorage).filter(([k]) => k.startsWith('calorix:'))
#   ))
# Save to calorix-storage.json, then:

node examples/trend-report.js calorix-storage.json
```

Output:

```
Date         kcal     P        C        F
---------------------------------------------
2026-06-01   2100   110.0    220.0     70.0
2026-06-02   1980    95.0    240.0     65.0
2026-06-03   2300   120.0    250.0     80.0
2026-06-04   1850    90.0    210.0     60.0
2026-06-05   2050   105.0    230.0     70.0
2026-06-06   2200   115.0    245.0     75.0
2026-06-07   1850    92.0    215.0     58.0
---------------------------------------------
Average:     2047   103.9    230.0     68.3
```

## Programmatic use

Use any module from a Node script:

```js
import { generateCoachMessage } from 'calorix/src/coach/engine.js';
import { defaultTargetKcal } from 'calorix/src/nutrition/estimator.js';
import { searchFoods } from 'calorix/src/nutrition/foodDb.js';

const target = defaultTargetKcal('unspecified', 75, 175, 35, 'moderate');
const coach = generateCoachMessage({
  macros: { kcal: 1800, protein: 90, carb: 220, fat: 60 },
  target,
  streak: 5,
  mood: 'good'
});
console.log(coach.text);

const matches = searchFoods('haehnchen');
console.log(matches[0].name, matches[0].kcal, 'kcal/100g');
```

See [`docs/api.md`](../docs/api.md) for the full reference.
