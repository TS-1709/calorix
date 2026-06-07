# Architecture

This document is the long-form companion to the README. It explains the design decisions in `src/`, the data flow, and the constraints that shape the code.

## High-level

Calorix is a single-page PWA. There is exactly one runtime path: the browser loads `index.html`, which loads the JS bundle, which mounts the React tree, which reads from `localStorage` and the bundled food database. No other path exists.

```
                ┌────────────────────────────────────────────────────┐
                │                                                    │
                │   Browser                                          │
                │                                                    │
   user ──────► │   ┌──────────┐    ┌──────────────┐                │
                │   │ service  │───►│ cached shell │                │
                │   │ worker   │    │ (offline)    │                │
                │   └──────────┘    └──────────────┘                │
                │        │                                          │
                │        ▼                                          │
                │   ┌──────────┐    ┌──────────────┐                 │
                │   │ React    │───►│ localStorage │                 │
                │   │ tree     │    │ (calorix:*)  │                 │
                │   └──────────┘    └──────────────┘                 │
                │        │                                          │
                │        ├──► src/nutrition/ (foodDb, estimator)   │
                │        ├──► src/coach/      (frameworks, engine)  │
                │        └──► src/components/ (React UI)            │
                │                                                    │
                └────────────────────────────────────────────────────┘
                          ▲
                          │ 0 network calls after first load
                          │
                       (no API)
```

## Modules

### `nutrition/`

The food database and the math that turns food + portion into calories and macros.

**`foodDb.js`** — A flat array of 87 entries. Each entry has kcal/macros per 100g, a category, aliases for search, and a default portion in grams. Sources: Open Food Facts and USDA FoodData Central (both public domain). The search function folds diacritics via Unicode NFD so `"hahnchen"` matches `"hähnchenbrust"`.

**`portions.js`** — Maps free-text portion hints to grams, with category-aware defaults. The data is informed by a 30-year-old dietetic heuristic (hand-sized protein, fist-sized vegetable, etc.) that's good enough for self-tracking. Precision matters less than getting the order of magnitude right.

**`estimator.js`** — Linear scaling from per-100g to per-portion, summing across entries, computing macro percentages against a target, and deriving a BMR-based target from sex/weight/height/age/activity using the Mifflin-St Jeor equation.

### `coach/`

A deterministic rule engine that picks a daily message from one of four psychological frameworks.

**`frameworks.js`** — The four frameworks (CBT, ACT, SDT, MI), each with a name, description, peer-reviewed citation, and a group of templates. Templates are organized by user state (stable, over, under, low_mood). The citation is rendered in the UI.

**`engine.js`** — A small orchestrator: `buildState()` derives the user's situation, `pickFramework()` chooses one of the four (rotating per day, ACT preferred on rough mood), `getTemplate()` returns the right template, and `generateCoachMessage()` returns `{ framework, text, state }`. Pure functions, deterministic per calendar day, zero LLM call.

### `engine/`

**`storage.js`** — Thin wrappers over `localStorage` with `calorix:` prefix, day-keyed (`calorix:day:YYYY-MM-DD`), quota-safe (try/catch on every read/write), and a `streakFromKeys()` helper that walks back from today.

### `components/`

Pure React. Five components, each focused on one job:

- **`MacroRing.jsx`** — Four 90° arcs on a single SVG, fed by current/target values. No chart library.
- **`MealLogger.jsx`** — Search input + suggestions + portion entry + add. The hot path for the user.
- **`CoachCard.jsx`** — Daily message, framework badge, citation, mood buttons.
- **`StreakCalendar.jsx`** — 14-day strip, derived from `listDayKeys()`.
- **`ReportCard.jsx`** — Collapsible weekly summary, observation-driven.

### `App.jsx`

The composition root. Holds the day's entries in state, derives derived values via `useMemo`, hands callbacks down. No business logic in `App.jsx` — it's pure orchestration.

## Data flow

A user action (`add entry`, `change mood`, `save target`) updates a single source of truth in `App.jsx`, which is then persisted to `localStorage`. All derived values (total macros, badge, coach, streak) recompute via `useMemo`.

```
user action
  ↓
App.jsx (setState)
  ↓
useMemo recomputes
  ├── totalMacros      ← sumMacros(day.entries)
  ├── badge            ← macroBadge(totalMacros, target)
  ├── streak           ← streakFromKeys(dayKeys)
  └── coach            ← generateCoachMessage({...})
  ↓
React re-renders affected components
  ↓
localStorage write (only on the triggering action)
```

## Why not <X>?

A short list of things we considered and rejected.

- **External food database (Open Food Facts API)** — would need a network call. Bundle is 87 items for now, plenty for self-tracking.
- **LLM coach (OpenAI, Anthropic, Mistral, Gemini)** — every call is a privacy leak, a rate limit, a subscription, and a hallucination risk. The four frameworks are enough.
- **Cloud sync** — requires a server, which means a database, which means a privacy policy, which means a lawyer. localStorage is the only state.
- **React Native / Capacitor** — would inflate the bundle by 5–10 MB. The PWA installs natively and works offline.
- **Charting library (Recharts, Chart.js)** — adds 100+ KB for one SVG. We render it by hand.
- **TypeScript** — would help, but it's also a barrier for new contributors. JSDoc is the migration path when the project outgrows this.
- **State management library (Redux, Zustand, Jotai)** — the entire app state fits in one `useState` in `App.jsx`. Adding a library would be overhead for no gain.

## Performance budget

| Resource | Budget | Current |
|---|---|---|
| Initial JS (gzipped) | <100 KB | 74 KB |
| Initial CSS (gzipped) | <5 KB | 3 KB |
| Images (icons) | <20 KB total | ~6 KB |
| Fonts | system stack, no web fonts | 0 KB |
| Service worker | <5 KB | 1.6 KB |
| **Total cold load** | **<200 KB** | **~85 KB** |

The bundle is small because we don't pull in a charting library, a UI framework, or a state manager. Every dependency is justified by a one-line comment in `package.json`.

## Constraints (the non-negotiables)

These come from the README and are repeated here because they shape every commit.

1. **No network calls at runtime.** The food DB is bundled. The coach is rule-based. The service worker only caches same-origin GETs.
2. **No external LLM.** Coach is deterministic. The four frameworks are cited in `frameworks.js`.
3. **No account, no tracking.** `localStorage` is the only state.
4. **No paid dependencies.** The full `package.json` is a `npm install` and a coffee.
5. **Tests must stay green.** New modules add a `*.test.js`.

If a feature can't be built under these constraints, the constraints win. That's the project.
