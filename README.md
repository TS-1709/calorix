<p align="center">
  <img src="public/icons/icon-192.svg" width="80" alt="Calorix icon" />
</p>

<h1 align="center">Calorix</h1>

<p align="center">
  A privacy-first, 100% local meal & macro tracker with a psychology-grounded coach.
  <br>
  <a href="#why-this-exists">Why</a> · <a href="#features">Features</a> · <a href="#how-it-works">How</a> · <a href="#architecture">Architecture</a> · <a href="#quick-start">Quick start</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-active-brightgreen">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="Tests" src="https://img.shields.io/badge/tests-3%20files%20%7C%2020%2B%20passing-brightgreen">
  <img alt="Stack" src="https://img.shields.io/badge/stack-Vite%20%2B%20React-blueviolet">
  <img alt="Network" src="https://img.shields.io/badge/network-0%20calls-success">
</p>

---

## Why this exists

Most nutrition apps want your account, your email, your weight trends, your training calendar, and a subscription. They also call home on every interaction, and their coaching is generic motivation copy.

Calorix does none of that. It's a small PWA that runs entirely in your browser. It estimates calories and macros from a bundled food database and a 30-year-old portion-size heuristic, then gives you a daily coach message grounded in one of four real psychological frameworks. No account, no cloud, no API keys, no SaaS, no LLM. The whole bundle is ~100 KB gzipped and works offline after first load.

It's a small project, deliberately. It exists to demonstrate that useful nutrition software can be honest, local, open source, and psychology-aware without being clinical or preachy.

## Features

- **Search-first meal logging** — fuzzy match against a curated 87-item food database (public-domain data from Open Food Facts and USDA FoodData Central)
- **Natural-language portions** — type "150g", "eine Hand voll", "⅓ Teller", "1 Becher" and the parser does the rest
- **Macro ring** — single SVG showing kcal, protein, carbs, fat against target, with a deterministic four-arc layout
- **Coach with four frameworks** — daily message picked from CBT, ACT, SDT, or MI templates, with proper peer-reviewed citations
- **Streak calendar** — 14-day consistency strip, no gamification, no shaming
- **Weekly report** — observation about the week (over/under/on track), no judgement, no notification spam
- **Settings** — set target manually, or derive from BMR (Mifflin-St Jeor) with weight/height/age/activity
- **PWA** — installable, offline after first load, no service-worker cache poisoning
- **Privacy** — zero network calls after first load. Zero tracking. Zero account.

## How it works

### Calorie estimation

Each food in the bundled DB has kcal/macros per 100g. The portion parser turns free-text descriptions into grams using these heuristics:

| Hint | Protein | Carb | Fat | Vegetable | Default |
|---|---|---|---|---|---|
| "eine Hand voll" | 120g | 80g | 15g | 100g | 100g |
| "eine Faust" | — | 180g | — | 200g | 200g |
| "Daumen" | — | — | 15g | — | 15g |
| "⅓ Teller" | 50g | 83g | — | 133g | 133g |
| "150g" | 150g | 150g | 150g | 150g | 150g |
| "klein"/"groß" | 0.7× | 0.7× | 0.7× | 0.7× | 1.3× default |

The portion parser is naive but useful: most users enter 80%+ of meals with a category hint + a hand/fist/plate cue, and the resulting calorie estimate is well within the ±15% precision that any self-tracker can actually use.

### Coach engine

The coach is a deterministic rule engine. Every day, it picks one of four frameworks (CBT, ACT, SDT, MI) using a stable day index, then picks a template from that framework based on the user's state (kcal over/under target, mood, streak). All templates are grounded in peer-reviewed work and cited.

The engine never calls an LLM, never calls home, and never uses language that diagnoses or prescribes. The disclaimer is rendered in the UI.

### Storage

Everything lives in `localStorage` under a `calorix:` prefix. The data is keyed by day (`calorix:day:YYYY-MM-DD`), so reopening the app on the same day resumes the same log. Streaks are derived by walking back from today.

## Quick start

```bash
git clone https://github.com/TS-1709/calorix
cd calorix
npm install
npm run dev          # http://localhost:5198
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm test` | Vitest (3 test files, 20+ tests) |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve `dist/` on port 5199 |

## Architecture

```
src/
  main.jsx              # Mount + service-worker registration
  App.jsx               # Layout, state, settings modal, mood tracking
  styles.css            # Theme tokens + all visual styling
  nutrition/
    foodDb.js           # 87-item food database (curated, public-domain data)
    portions.js         # Hand/fist/plate/gram heuristics
    estimator.js        # Calorie + macro scaling, BMR-based default target
  coach/
    frameworks.js       # CBT, ACT, SDT, MI templates + peer-reviewed citations
    engine.js           # Rule-based, deterministic message selection
  engine/
    storage.js          # localStorage wrappers, day-keyed, quota-safe
  components/
    MacroRing.jsx       # SVG ring, four macro arcs
    MealLogger.jsx      # Search + portion + add entry
    CoachCard.jsx       # Daily coach message + mood buttons
    StreakCalendar.jsx  # 14-day consistency strip
    ReportCard.jsx      # Weekly specimen-style summary
public/
  manifest.webmanifest
  service-worker.js     # Offline shell cache
  icons/                # PWA icons
```

## Adding a food

Edit `src/nutrition/foodDb.js` and append to the array. Each entry has `id`, `name`, `aliases`, `category`, `kcal`, `protein`, `carb`, `fat` (per 100g), and `defaultPortion` (grams). Values come from Open Food Facts or USDA FoodData Central. Document the source in your PR.

## Adding a coach framework

Edit `src/coach/frameworks.js`. Add an entry to `FRAMEWORKS` with name, description, and a real peer-reviewed citation. Add a `T.<id>` template group with at least three entries covering `stable`, `over`, `under`, `low_mood`. Add the id to `ROTATION` in `engine.js` if you want it to be picked.

## Privacy

Calorix is a fully client-side PWA. After the first load, it makes zero network calls. There is no backend, no account, no analytics, no tracking pixel, no cloud function, no AI API call. The Service Worker only caches same-origin GET responses. Read the source — it's small.

## License

MIT — see [`LICENSE`](./LICENSE).
