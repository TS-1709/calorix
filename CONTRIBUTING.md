# Contributing

Calorix is a small, opinionated project. Read this before opening a PR.

## What this project is

A 100%-local meal & macro tracker with a psychology-grounded coach. No account, no cloud, no tracker scripts. Open source under MIT.

## Architecture (60 seconds)

```
src/
  main.jsx              # Mount + service-worker registration
  App.jsx               # Layout, state, settings modal
  styles.css            # Theme tokens + all visual styling
  nutrition/
    foodDb.js           # Curated food database (87 items, public-domain data)
    portions.js         # Hand/fist/plate heuristics
    estimator.js        # Calorie + macro scaling
    foodDb.test.js
    estimator.test.js
  coach/
    frameworks.js       # CBT, ACT, SDT, MI templates + citations
    engine.js           # Rule-based, deterministic message selection
    engine.test.js
  engine/
    storage.js          # localStorage wrappers, day-keyed, quota-safe
  components/
    MacroRing.jsx       # SVG ring, four macro arcs
    MealLogger.jsx      # Search + portion + add
    CoachCard.jsx       # Daily coach message + mood buttons
    StreakCalendar.jsx  # 14-day consistency strip
    ReportCard.jsx      # Weekly specimen-style summary
```

## Design rules

- **No network calls at runtime.** The food DB is bundled. The coach is rule-based. If you add a feature, it must work offline after first load.
- **No external LLM.** Coach is deterministic and template-driven. The four psychological frameworks (CBT, ACT, SDT, MI) are cited in `frameworks.js`.
- **No account, no tracking.** localStorage is the only state. Add an export/import feature before anything else if you want multi-device.
- **No paid APIs.** No SaaS, no token, no rate-limited service.
- **Tests must stay green.** `npm test` runs Vitest. New modules add a `*.test.js` next to the module.

## Adding a food

Edit `src/nutrition/foodDb.js`. Each entry has:

- `id` (unique, e.g. `p13`)
- `name` (German, present tense, e.g. `Hähnchenbrust (gegart)`)
- `aliases` (lowercase search terms, English OK)
- `category` (`protein` | `carb` | `vegetable` | `fruit` | `fat` | `dairy` | `drink` | `snack` | `prepared`)
- `kcal`, `protein`, `carb`, `fat` (numbers, g/100g)
- `defaultPortion` (grams)

Values come from Open Food Facts and USDA FoodData Central. Document the source in the PR description.

## Adding a coach framework

Edit `src/coach/frameworks.js`. Add an entry to `FRAMEWORKS` with name, description, and a real peer-reviewed citation. Add a `T.<id>` template group with at least three entries covering `stable`, `over`, `under`, `low_mood`. Add the id to `ROTATION` in `engine.js` if you want it to be picked.

## Pull request checklist

- [ ] `npm test` passes locally
- [ ] `npm run build` succeeds
- [ ] New modules have a sibling `*.test.js`
- [ ] No new runtime dependencies unless absolutely necessary (and explained)
- [ ] No network calls added
- [ ] No fake data added to the food DB
