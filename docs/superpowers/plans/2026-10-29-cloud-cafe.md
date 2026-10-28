# Cloud Café Implementation Plan

> For agentic workers: use subagent-driven-development with isolated file ownership and parent-managed integration, review and release.

**Goal:** Upgrade G018 into Cloud Café with24 progressive orders and unrestricted free creation.
**Architecture:** Existing standalone Vite bundle; separate pure shape/order/scoring rules, localized UI, Canvas renderer and DOM/input lifecycle. Reuse existing audio/share/home/event modules. Keep old nine-point artwork links readable in free mode.
**Tech Stack:** TypeScript, Canvas2D, pointer events, Vite, Vitest.

## Global Constraints
- Nine dictionaries: zh-Hant,en,es,pt-BR,fr,ar,sw,id,hi. New strings translated; no runtime translation or speech synthesis.
- No backend/accounts/ranking/ads; localStorage failure must not stop play. JS gzip≤150000bytes.
- Touch, keyboard, iPad/desktop, safe areas, RTL, reduced motion; home always reachable; prominent retry.
- Real artwork in locally generated shared card; same order/difficulty in challenge hash. UTC daily seed with no streak pressure.
- Sound/music only after a gesture; existing Bach track and credits retained. No unreviewed voice.

## Tasks
- [ ] Pure rules:24 orders in3 stages; continuous contour deformation, two-pointer scaling, hole and color state, bounded undo. Score explicit silhouette/topology/secondary feature criteria; normalized placement; abstract free creations receive descriptive feedback. Add tests for exact/incorrect shapes, transformations, holes, bounded edits and24 targets.
- [ ] UI/render:draw fluffy cloud with elastic release, café set dressing and recognizable Dodo/Lili/Pip; order card with target and criteria. Reading not timed. Practice untimed, standard45sec, challenge30sec. Deadline keeps work and offers serve/continue practice. Tools and pinch/drag plus keyboard controls, pause/visibility, lifecycle once per order.
- [ ] Progress/share:level select, best stars locally, next only with success plus practice option; bounded local album. Copy/share preserved artwork and order; free mode accepts original links.
- [ ] Validation:project typecheck/test/build. Parent runs whole-workspace checks, reviews diff, validates preview375×812/800×600/1024×768/RTL, reports screenshots, merges and verifies production. Change catalog title only once playable.
