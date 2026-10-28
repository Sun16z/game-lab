# G001 / G002 / G007 / G008: visible island friends

Date: 2026-10-29 (Taipei).

Production before the change had loaded assets, but in-play portraits were too small (G002 about34px wide), or were outside the playfield (G001, G008). This is a visibility fix; the friends remain companions rather than controllable avatars.

- G001: move the cast from the below-canvas panel into the stage foreground; retain a compact ready-panel cast on mobile.
- G002: enlarge the hangar crew, away from answer buttons.
- G007: enlarge the garden foreground cast below the flower controls.
- G008: move and enlarge the launch crew inside the postcard.
- Shared service worker: online navigation obtains current HTML, with cached offline fallback. The previous cache-first document policy could show an older layout on a return visit. Hashed asset caching is unchanged.

## Validation

- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm size:check` passed locally. Existing dependencies were reused with `--config.verify-deps-before-run=false`; the clean CI install also runs the checks.
- Three service-worker regression tests: online document update, offline query-link fallback, online404 preserved.
- Chromium at375×812 (touch),800×600 (keyboard),1024×768 (tablet viewport): all12 in-play cast images load; each image box is at least70px in both dimensions, no horizontal overflow, cast has `pointer-events:none`.
- G001 drop/pause/resume, G002 correct-answer score update, G008 launch and throw-counter update verified at all three sizes.
- Screenshots here show the local production bundles. PR preview and production verification are recorded in the PR before/after merging. No physical iPad or Safari session was available in this check.

|Game|Phone375×812|Desktop800×600|
|---|---|---|
|G001|[Phone](perfect-stack-brand-mobile.png)|[Desktop](perfect-stack-brand-desktop.png)|
|G002|[Phone](monster-math-brand-mobile.png)|[Desktop](monster-math-brand-desktop.png)|
|G007|[Phone](rhythm-garden-brand-mobile.png)|[Desktop](rhythm-garden-brand-desktop.png)|
|G008|[Phone](paper-plane-brand-mobile.png)|[Desktop](paper-plane-brand-desktop.png)|
