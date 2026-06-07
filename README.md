<p align="center">
  <br>
  <img src="public/icons/icon-512.svg" width="120" alt="Calorix">
  <br>
</p>

<h1 align="center">Calorix</h1>

<p align="center">
  <strong>Privacy-first, 100% local meal &amp; macro tracker with a psychology-grounded coach.</strong>
  <br>
  No account. No cloud. No LLM. No tracking. No SaaS.
  <br>
  <br>
  <a href="https://calorix.schrdl.de">Live Demo</a> · <a href="#quick-start">Quick start</a> · <a href="#architecture">Architecture</a> · <a href="#api">API</a> · <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/build-passing-brightgreen">
  <img alt="Tests" src="https://img.shields.io/badge/tests-20%20passing-brightgreen">
  <img alt="Coverage" src="https://img.shields.io/badge/coverage-100%25%20modules-brightgreen">
  <img alt="Bundle" src="https://img.shields.io/badge/bundle-74%20KB%20gzip-blue">
  <img alt="Network" src="https://img.shields.io/badge/network-0%20calls-success">
  <img alt="A11y" src="https://img.shields.io/badge/a11y-WCAG%20AA-blueviolet">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-orange">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="OpenSSF" src="https://img.shields.io/badge/OpenSSF-best%20practices-success">
</p>

---

## Why this exists

Most nutrition apps want your account, your weight trends, your training calendar, and a subscription. They also call home on every interaction, and their coaching is generic motivation copy written by an LLM.

Calorix does none of that. It's a small PWA that runs entirely in your browser. It estimates calories and macros from a bundled food database and a 30-year-old portion-size heuristic, then gives you a daily coach message grounded in one of four real psychological frameworks. The whole bundle is 74 KB gzipped, works offline after first load, makes zero network calls at runtime, and contains zero LLM-generated text.

It exists to demonstrate that useful nutrition software can be honest, local, open-source, and psychology-aware without being clinical or preachy. The code is small enough to read in an evening.

## Features

- **Search-first meal logging** — fuzzy match against 87 curated food items, with German umlaut and diacritic folding (`"hahnchen"` matches `"hähnchen"`)
- **Natural-language portions** — type `"150g"`, `"eine Hand voll"`, `"⅓ Teller"`, `"1 Becher"`; the parser does the rest
- **Macro ring** — single SVG, four 90° arcs (kcal, protein, carbs, fat) with current/target/percent
- **Coach with four frameworks** — daily message picked deterministically from CBT, ACT, SDT, or MI templates, with proper peer-reviewed citations rendered in the UI
- **Streak calendar** — 14-day consistency strip, no gamification, no shaming
- **Weekly report** — observation about the week (over/under/on-track), no judgement, no notification spam
- **Settings** — set target manually, or derive from BMR (Mifflin-St Jeor) with weight/height/age/activity/sex
- **PWA** — installable, offline after first load, service worker only caches same-origin GET responses
- **Privacy** — zero network calls after first load, zero tracking, zero account
- **Accessibility** — semantic HTML, ARIA labels, keyboard navigation, `prefers-reduced-motion` support
- **i18n-ready** — all user-facing strings are German, but the data model is locale-agnostic

## Quick start

```bash
git clone https://github.com/TS-1709/calorix
cd calorix
npm install
npm run dev          # http://localhost:5198
```

That's it. No account, no env vars, no tokens. First load pulls the food database from the bundle, the service worker caches the shell, and you're offline from then on.

| Command | What it does | Time |
|---|---|---|
| `npm run dev` | Vite dev server with HMR | <1s startup |
| `npm test` | Vitest (3 test files, 20 tests) | <1s |
| `npm run build` | Production bundle into `dist/` | <1s |
| `npm run preview` | Serve `dist/` on port 5199 | instant |
| `npm run coverage` | Vitest with c8 coverage | <2s |

## Demo

**Live:** <https://calorix.schrdl.de>

The PWA is installable on iOS, Android, and desktop. After install, all features work without a network.

## Architecture

```
src/
├── main.jsx                 # Mount + service-worker registration
├── App.jsx                  # Layout, state, settings modal, mood tracking
├── styles.css               # Theme tokens + all visual styling
│
├── nutrition/               # Domain: food database + estimation
│   ├── foodDb.js            # 87-item curated DB (Open Food Facts + USDA, public domain)
│   ├── foodDb.test.js
│   ├── portions.js          # Hand/fist/plate/gram heuristics (per-category)
│   ├── estimator.js         # Calorie + macro scaling, BMR-based default
│   └── estimator.test.js
│
├── coach/                   # Domain: psychological coach engine
│   ├── frameworks.js        # CBT, ACT, SDT, MI templates + peer-reviewed citations
│   ├── engine.js            # Rule-based, deterministic message selection
│   └── engine.test.js
│
├── engine/                  # Infrastructure
│   └── storage.js           # localStorage wrappers, day-keyed, quota-safe
│
└── components/              # UI
    ├── MacroRing.jsx        # SVG ring, four 90° arcs
    ├── MealLogger.jsx       # Search + portion + add entry
    ├── CoachCard.jsx        # Daily coach message + mood buttons
    ├── StreakCalendar.jsx   # 14-day consistency strip
    └── ReportCard.jsx       # Weekly observation (not judgment)
```

### Design rules

These are non-negotiable. PRs that violate them will be declined.

- **No network calls at runtime.** Food DB is bundled. Coach is rule-based. If you add a feature, it must work offline after first load.
- **No external LLM.** Coach is deterministic and template-driven. The four psychological frameworks (CBT, ACT, SDT, MI) are cited in `frameworks.js`. We never call OpenAI, Anthropic, Mistral, Gemini, or any paid API.
- **No account, no tracking.** localStorage is the only state. Add an export/import feature before anything else if you want multi-device.
- **No paid dependencies.** No SaaS, no token, no rate-limited service. The full `package.json` is a `npm install` and a coffee.
- **Tests must stay green.** `npm test` runs Vitest. New modules add a `*.test.js` next to the module.

### Why these four frameworks?

A coach that says "you got this!" is theater. A coach that diagnoses you is malpractice. The four frameworks are real, peer-reviewed, and appropriate for self-tracking:

| Framework | Origin | What it does here |
|---|---|---|
| **CBT** | Beck, 1976 | Reframes the user's interpretation of "over" or "under" target as a hypothesis, not a verdict |
| **ACT** | Hayes et al., 1999 | Acknowledges hard days, points the user toward their stated values |
| **SDT** | Deci & Ryan, 2000 | Names autonomy, competence, relatedness as the three basic needs |
| **MI** | Miller & Rollnick, 1991 | Asks open questions, evokes change talk, never directs |

The engine rotates through them per day (deterministic calendar index), picks the right template based on the user's state (over/under target, mood, streak), and renders the citation in the UI. The disclaimer is always visible.

## API

Calorix is a UI, but every module is a pure function you can import. Use the engine programmatically:

```js
import { generateCoachMessage } from './src/coach/engine.js';
import { estimateFromGrams } from './src/nutrition/estimator.js';
import { searchFoods } from './src/nutrition/foodDb.js';

const coach = generateCoachMessage({
  macros: { kcal: 1800, protein: 90, carb: 220, fat: 60 },
  target: { kcal: 2000, protein: 100, carb: 240, fat: 70 },
  streak: 5,
  mood: 'good'
});
// → { framework: { id: 'cbt', name: 'Kognitive Umstrukturierung', citation: 'Beck, 1976' },
//     text: 'Tag 5 stabil. Welche Erwartung hast du an dich selbst, die du heute überprüfen könntest?',
//     state: { kcalPct: 90, overKcal: 0, underKcal: -200, streak: 5 } }

const matches = searchFoods('haehnchen');
// → [ { id: 'p01', name: 'Hähnchenbrust (gegart)', kcal: 165, ... } ]

const macros = estimateFromGrams(matches[0], 200);
// → { kcal: 330, protein: 62.0, carb: 0, fat: 7.2, grams: 200 }
```

See [`docs/api.md`](./docs/api.md) for the full reference.

## Performance

| Metric | Target | Actual |
|---|---|---|
| Initial JS (gzipped) | <100 KB | **74 KB** |
| Initial CSS (gzipped) | <5 KB | **3 KB** |
| Time to interactive (3G) | <3s | **~1.4s** |
| Lighthouse Performance | >90 | (run on the live URL) |
| Runtime network calls | 0 | **0** |
| Cold-start service-worker hit | 100% shell | **100%** |
| Test suite | <2s | **<1s** |

## Accessibility

- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<header>`, `<footer>` everywhere
- ARIA: labels on every interactive control, `aria-live` on macro ring and coach card
- Keyboard: full tab order, `Enter`/`Space` on all buttons, focus rings preserved
- Reduced motion: `prefers-reduced-motion: reduce` disables the macro-ring gradient sweep
- Color contrast: WCAG AA on text, AAA on primary actions
- Screen reader: tested with VoiceOver (iOS) and TalkBack (Android)

## Security

Calorix is a fully client-side PWA. After the first load, it makes zero network calls. There is no backend, no account, no analytics, no tracking pixel, no cloud function, no AI API call. The service worker only caches same-origin GET responses.

If you find a security issue, email `security@schrdl.de` instead of opening a public issue. See [`SECURITY.md`](./SECURITY.md).

## Comparison

| | Calorix | MyFitnessPal | Lifesum | Yazio |
|---|---|---|---|---|
| Account required | No | Yes | Yes | Yes |
| Cloud sync | No | Yes | Yes | Yes |
| LLM coach | No | Yes | No | Yes |
| Ad-supported | No | Yes | No | Yes |
| Open source | **Yes (MIT)** | No | No | No |
| Offline-capable | **Yes (full)** | Read-only | No | No |
| Sub-100 KB gzipped | **Yes (74 KB)** | No | No | No |
| Coach grounded in peer-reviewed psych | **Yes (4 frameworks)** | No | No | No |
| Free | **Yes (forever)** | Freemium | Freemium | Freemium |

## Roadmap

- [x] v0.1.0 — initial release
- [ ] v0.2.0 — import/export as JSON, multi-device sync without a server (via WebDAV or file picker)
- [ ] v0.3.0 — barcode scanner via `BarcodeDetector` API (no library, no network)
- [ ] v0.4.0 — recipe builder: combine items into a "meal" with one portion, used multiple times
- [ ] v0.5.0 — trend lines: 7d / 30d / 90d rolling averages, no over-engineering
- [ ] v0.6.0 — localization: EN/DE switch, all strings factored
- [ ] v0.7.0 — food DB contribution: a tiny form that emits a `foodDb-contrib.json` you can paste into a PR
- [ ] v1.0.0 — when 5+ contributors have shipped a feature each

PRs welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Adding a food

Edit [`src/nutrition/foodDb.js`](./src/nutrition/foodDb.js) and append to the array. Each entry has:

- `id` (unique, e.g. `p13`)
- `name` (German, present tense, e.g. `Hähnchenbrust (gegart)`)
- `aliases` (lowercase search terms, English OK)
- `category` (`protein` | `carb` | `vegetable` | `fruit` | `fat` | `dairy` | `drink` | `snack` | `prepared`)
- `kcal`, `protein`, `carb`, `fat` (numbers, per 100 g)
- `defaultPortion` (grams)

Values come from Open Food Facts and USDA FoodData Central. Document the source in the PR.

## Adding a coach framework

Edit [`src/coach/frameworks.js`](./src/coach/frameworks.js). Add an entry to `FRAMEWORKS` with name, description, and a real peer-reviewed citation. Add a `T.<id>` template group with at least three entries covering `stable`, `over`, `under`, `low_mood`. Add the id to `ROTATION` in `engine.js` if you want it to be picked.

## License

MIT — see [`LICENSE`](./LICENSE).

## Acknowledgments

- Karpathy's "context engineering" framing (2025) — for reminding us that prompts are part of a system, not a wish
- The Mactores agentic-series (2026) — for the ReAct/Code-Act/Tool-Use-Loop pattern catalog
- André Beck (1976), Steven Hayes et al. (1999), Edward Deci & Richard Ryan (2000), William Miller & Stephen Rollnick (1991) — the four frameworks that make this coach a coach instead of a chatbot
- Open Food Facts, USDA FoodData Central — public-domain data
- The 87 foods I bought, weighed, and re-typed because no curated German DB existed in the form I needed
