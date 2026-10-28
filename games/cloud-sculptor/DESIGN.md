# Cloud Café / G018

2026-10-29 implementation. Standalone static bundle; no accounts, remote gameplay work, ads or score uploads.

## Core loop and pillars

Read a friend's illustrated order with no timer → begin → push and pull the soft cloud contour, adjust its features → serve → compare three visible criteria → retry or open the next order after three stars. Free creation stays untimed and accepts legacy artwork links.

1. A direct, forgiving craft: every contour region responds, undo restores the previous artwork, and elapsed time never deletes work.
2. A readable café: Dodo, Lili and Pip appear as existing branded images; the target, order number and criteria sit beside the work area. Cream paper, striped awning, watercolor sky and a wooden counter frame the craft.
3. New choices introduced in stages: shape first, then color/holes/stickers, then two-color blends and predictable breeze.
4. A portable local creation: bounded album, actual-art image sharing and reproducible same-order links; no competition or streak pressure.

Onboarding checklist: core drag visible immediately; order01 provides a safe first success; order02/03 introduce starter proportions; incomplete hat/rabbit/cup/scarf scaffolds expose the feature to pull; dashed optional target shows the goal; practice is always available. These are design hypotheses awaiting child/real-device observation, rather than a claim of successful playtesting.

## Authored orders and pacing

| Stage | Orders | Intent / new feature | Pacing |
|---|---|---|---|
| Morning bites | 01 round,02 wide,03 tall,04 heart,05 hat,06 rabbit,07 star,08 cup | Match a silhouette. Hats need a broad brim/tall crown; rabbits need two ears. Only three basic starter molds are offered in orders. | Read freely →45s craft or untimed practice →quiet result. |
| Afternoon tea | 09 round donut,10 flower,11 crescent,12 hat,13 rabbit,14 cup,15 scarf,16 diamond | Color, an explicit hole/no-hole condition, exactly one requested sticker. Scarf introduces a hanging tail. | Same timer; more feature choices, no hidden pressure. |
| Starlight specials | 17 round donut,18 hat,19 rabbit,20 heart,21 scarf,22 cup,23 flower,24 crescent | Two-color gradients and exactly two requested stickers. Final four add an alternating telegraphed breeze every six active seconds. | Read →craft with visible countdown/forecast →result. Practice removes wind and timer. |

Standard is45 seconds; quick challenge30; practice/free has no timer. The clock starts only after Begin. Pause and hidden-page transitions freeze time and wind. On timeout, artwork remains visible behind the overlay: serve it now or continue that same run untimed. Exit remains in the fixed header, outside overlays.

## Geometry and scoring

`rules.ts` retains the original nine-point API. `cafe-rules.ts` uses64 samples, continuous Gaussian falloff deformation, normalized point bounds and two-pointer uniform scaling. Pointer capture supports a finger moving beyond the original hit area. Quadratic midpoint interpolation closes the contour. Release has a short elastic visual response and respects reduced motion.

Three independent star criteria:

- Silhouette: bidirectional mean nearest-contour distance after centering and uniform scale normalization. This preserves aspect ratio and lobes, while ignoring placement and overall size. Similarity is `max(0,1−2.5×(distanceAB+distanceBA))`. Required similarity is84% for hat,82% rabbit,77% cup,74% scarf and83% otherwise. The final result shows actual/required percentages.
- Topology: hole state must match the illustrated request.
- Details: exact base/secondary color and exact requested sticker kind/count. Extra stickers fail this criterion. Sticker positions are expressive, not graded.

Three stars are required for the Next Order button; every result allows retry and the order book permits independent practice. Color/sticker requirements are explicit; free artwork receives a nearest-shape description and sticker count rather than a quality grade.

Thresholds are initial tuning hypotheses. They reject every basic round/wide/tall starter for heart/star/crescent/flower/hat/rabbit/cup/scarf in tests, and accept reproducible hand gestures for the partial forms. Browser/child testing remains important for fairness; this is contour similarity, not image recognition or semantic AI.

### Reproducible gestures

Coordinates below are normalized to the board's inner sky. Continuous15-step pointer paths are tested in `gesture-probe.test.ts`.

- Order01: Begin →Serve. Safe three-star onboarding.
- Order02/03: select wide/tall starter mold →Serve.
- Hat05: drag top center `(0.50,0.48)` up to `(0.50,0.22)`; tested similarity≈87.7%, threshold84%.
- Rabbit06: drag left ear `(0.375,0.35)` to `(0.375,0.11)`, then right ear `(0.625,0.35)` to `(0.625,0.11)`; a narrower local brush preserves the gap,≈88.8%, threshold82%.
- Cup08: drag the flat handle region `(0.67,0.46)` to `(0.83,0.46)`,≈78.7%, threshold77%.
- Scarf15: drag short tail `(0.58,0.50)` to `(0.58,0.77)`,≈76.3%, threshold74%; then set pink plus one rainbow sticker.
- Donut09: round shape →pink →toggle hole →one star →Serve.
- Blend17: round shape →pink →secondary mint →toggle hole →two stars →Serve.

The DEV-only `window.__cloudCafe` exposes `inspect()`, `target()` and `expire()` for parent browser QA. `target()` installs the exact current recipe only in a Vite development build; production tree shaking removes the entire hook. It is not a production player action.

## Input, storage and lifecycle

`editor.ts` separates input from DOM rendering and rules. Drag any edge; pinch with two fingers. Eight focusable contour areas support Tab selection and arrow-key deformation; +/− and corresponding buttons scale. Sticker buttons can be dragged or moved with arrows. Tool/action buttons remain keyboard accessible. Arabic changes document direction; selection labels, shape names, colors and all new controls have nine explicit dictionaries. No speech synthesis or unreviewed voices run. Neutral result text avoids adding unsupported celebration/locale-voice phrases.

`cafe-storage.ts` saves24 best-star values and the latest12 artworks. Storage exceptions are caught, so private mode/quota failures leave gameplay working. Gallery entries reopen in free mode. `challenge.ts` validates bounded v1 legacy/v2 artwork payloads; second colors and holes survive links. A received order link shows the sender’s actual artwork in a separate preview card and offers Open in free creation; its ordinary Begin still starts the fresh partial order. Daily order uses a stable FNV hash of the UTC ISO day; its date/order/mode are preserved in the fragment, with no streak reward.

The shared GameRun transitions wrap each service/free session. One `game_start` and one `game_end` go through the shared no-op event sink per started run, including menu/home/page abandonment. Timeout continuation and pause keep the same run; retry makes a new run ID and emits retry_click. An additional local `game-lab:event` CustomEvent supports lifecycle inspection without transmission.

## Files and evidence

- `src/cafe-rules.ts`:24 recipes, shape geometry, score, undo bounds, daily hash, partial starter shapes.
- `src/editor.ts`, `render.ts`, `clock.ts`: pointer/keyboard work; matching SVG/Canvas gradients and hole rendering; monotonic service clock.
- `src/main.ts`: local UI, run lifecycle, mode selection, preview/play/result, shared audio/share integration.
- `src/cafe-i18n.ts`, `cafe-extra.ts`: nine complete café dictionaries and shape/color labels.
- `src/cafe-storage.ts`, `challenge.ts`: bounded album and portable/backwards-compatible art.
- `src/style.css`, `index.html`: café presentation, RTL-aware logical spacing, safe-area controls, compact desktop service row, prominent result replay and reduced motion.
- Existing public friends and Bach audio are reused. Footer retains Bach BWV846 / Mutopia MIDI / Game Lab arrangement attribution; audio starts after a gesture and stays behind shared sound/music controls.

Latest local validation: `pnpm --config.verify-deps-before-run=false --filter @game-lab/cloud-sculptor typecheck`, `test`, `build` pass.22 tests across6 files cover24 targets/unique recipes, wrong starter silhouettes, independent scoring, transforms, continuous neighboring deformation, bounds,40-entry undo, share validation/legacy behavior, daily assignment, timer freezing and actual simulated gesture reachability, corrupt album metadata and storage failure recovery. Build JS gzip≈41.5KB, below150KB. Parent runs integrated browser QA and release; deployment evidence belongs to the parent report.

## Limitations / remaining observation

Native speakers have not reviewed the nine new translations. iOS/Android physical-device multitouch, child difficulty/fairness, supported share-sheet behavior and artwork legibility need observation. The fixed centered hole is an intentional first-release tool; hole placement/size and sticker scoring positions are not editable recipe features. The soft cloud is rendered in SVG (and Canvas for share cards), with local deterministic geometry rather than a fluid simulation. Desktop below750px height uses a compact board and fixed action row; other tools can scroll. No claims of production verification are made here.
