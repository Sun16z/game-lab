# Dodo & Lili Cloud Climb Implementation Plan

> For agentic workers: use subagent-driven-development; parent owns catalog, workspace integration and release.

**Goal:** New standalone cloud-climb game with12 authored playable routes and an unlockable endless mode.
**Architecture:** Pure fixed-step physics with swept descending platform collisions; seeded authored route layout and solver/bot tests. Canvas2D with shaded toy-like clouds and brand sprites, DOM controls and shared adapters.
**Tech Stack:** TypeScript, Canvas2D, Vite, Vitest; no new external dependency.

## Global Constraints
- Nine locales; local-only progress; no invented percentile or backend; JS gzip≤150000bytes.
- Home always, pause/hidden-tab freeze, touch/keyboard, RTL, safe areas and reduced motion. No auto reload retry.
- Dodo/Lili same ability; Pip one clear rescue. Baseline jump/camera stable; combo changes sound/effects only.
- All mandatory paths reachable; optional risk branches never required. Ice one landing then gone, moving platforms predictable, wind telegraphed. Difficulty through layouts.

## Tasks
- [ ] Pure rules and tests:12 levels in4 biomes, platform types normal/bounce/ice/moving/star; steering acceleration/friction, fixed-step jump/gravity, swept collisions, finite bounds. Deterministic route seed, reachable main route, optional rewards, one rescue and meaningful height/stars/perfect score. Tests cover tunneling, underside, ice consumption, rescue, deterministic generation,12 actual bot-completable routes.
- [ ] Full start/play/result/retry:level select saved unlocks, character select, apprentice/standard; themed sky props, squish/stretch, shadows, stable camera, clear controls, winning endpoint, endless only after12levels. Keyboard Arrow/A,D, touch hold and drag; release on cancel/blur; pause clock correctly.
- [ ] Audio/share/events:reuse GameAudio and local cards including character/biome; challenge hash carries version/seed/level/difficulty/target; emit one start/end for each run, track abandoned. Parent supplies copied licensed audio and catalog registration after first game's release.
- [ ] Parent review and verification:all checks and size, preview play at375×812 and800×600 with screenshots reported before merge, official site smoke after deployment. Save evidence and changed files in game DESIGN.md and QA docs.
