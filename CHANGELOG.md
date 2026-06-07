# Changelog

All notable changes to Calorix are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- v0.3.0 — import/export as JSON, multi-device sync without a server
- v0.4.0 — barcode scanner via `BarcodeDetector` API
- v0.5.0 — recipe builder
- v0.6.0 — trend lines (7d / 30d / 90d rolling averages)
- v0.7.0 — localization (EN/DE switch)
- v0.8.0 — food DB contribution form
- v1.0.0 — when 5+ contributors have shipped a feature each

## [0.2.0] - 2026-06-07

### Added
- On-device food-photo recognition pipeline: PreProcessor, ColorHistogram, EdgeDetector, PlateDetector, SpatialAnalyzer, Scorer
- `PhotoLogger.jsx`: camera/upload entry point with top-3 candidates, confidence bars, and human-readable reasons
- Visual signatures for food categories in `src/vision/dbBridge.js`
- Food DB annotation layer (`foodMapping.js`) mapping items to `visionId` and shape
- `docs/vision-architecture.md` with Mermaid diagram, performance budget, failure modes, and extension guide
- Deterministic Node smoke tests for the vision pipeline (`tests/vision-smoke.mjs`, `tests/vision-e2e.mjs`)

### Fixed
- Service worker v6 now uses network-first for HTML/JS/CSS so stale bundles are not served after deploy
- iOS visual layout separation: panels now use explicit backgrounds and shadows
- `npm test` now runs Vitest plus the vision smoke suite without Vitest collecting the standalone Node smoke file

## [0.1.0] - 2026-06-07

### Added
- 87-item curated food database (Open Food Facts + USDA FoodData Central, public domain)
- Natural-language portion parser (hand/fist/plate/gram, German + English, diacritic-folding)
- Macro ring with 4-arc SVG layout (kcal, protein, carbs, fat)
- Coach engine with 4 psychological frameworks: CBT (Beck 1976), ACT (Hayes 1999), SDT (Deci/Ryan 2000), MI (Miller & Rollnick 1991)
- Streak calendar (14 days, no gamification)
- Weekly report with observation, no judgement
- Settings: manual target or BMR-based (Mifflin-St Jeor)
- PWA: installable, offline after first load
- Service worker with same-origin shell cache, versioned
- 3 Vitest test files, 20 tests passing
- 0 network calls at runtime, 0 tracking, 0 account
- `docs/api.md`, `docs/ARCHITECTURE.md` — long-form reference
- `examples/cli-coach.js`, `examples/macro-counter.js`, `examples/trend-report.js` — programmatic use
- GitHub Actions CI: test (Node 20 + 22), build, bundle-size check
- `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`

### Design decisions
- No external LLM. Coach is deterministic and template-driven.
- No account, no tracking. `localStorage` is the only state.
- No paid dependencies. The full `package.json` is an `npm install` and a coffee.

[Unreleased]: https://github.com/TS-1709/calorix/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/TS-1709/calorix/releases/tag/v0.2.0
[0.1.0]: https://github.com/TS-1709/calorix/releases/tag/v0.1.0
