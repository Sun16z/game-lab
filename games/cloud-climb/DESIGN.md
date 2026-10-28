# 朵朵栗栗的跳跳雲 / Dodo & Lili Cloud Climb

Version1, 2026-10-29. Internal candidate C003, catalog display G023. Standalone Vite static bundle. Implementation checklist references: `docs/design-agents/README.md`, `game-designer.md`, `level-designer.md`, with the project’s child-safety overrides. Parent owns catalog, workspace integration, deployment and browser evidence.

## Player experience and core loop

Hold left/right or drag to guide an automatically jumping friend toward the next readable cloud. Land near the middle for a small score bonus and a short sound; choose a golden side cloud for an optional star. Reach the sky cottage, see height/stars/center landings, and choose another route or retry. There is no timer pressure, score submission, public ranking, account, ad or purchase. Completion records unlock the next route locally; finishing every route unlocks an endless sky.

Design pillars:

1. Predictable movement: fixed gravity, jump and steering; score/combo never changes physics.
2. A visible safe route: pale broad clouds lead upward; optional gold clouds are visibly separate.
3. Kind recovery: Pip catches the first fall; the HUD always shows whether that rescue remains.
4. A toy-like place: shaded cloud volumes, floating islands, character sprites, sunlight and distinct biome props.
5. Accessible retries: touch and keyboard, pause, persistent Home, nine locales and optional local sharing.

Onboarding checklist: the first white cloud is180px wide; autojump begins immediately; one row of lateral control is enough for the first success; no action button is required. Jelly appears after ordinary clouds, ice and moving clouds enter later routes, and repeated wide still-cloud rest pads separate three acts. The help drawer names all cloud types and controls before play. The first optional gold branch teaches exploration without blocking completion. Tutorial route bot time≈30seconds; later routes≈47–59seconds. These are deterministic controller measurements, not child-playtest observations.

## Mechanics and tuning

World width480logical pixels, fixed step1/120s, gravity1000px/s², normal jump540px/s, jelly jump610.2px/s. A normal jump peaks at145.8px. Horizontal acceleration850px/s², maximum225px/s; releasing input applies exponential drag5/s. Hard horizontal bounds16…464 keep the character on screen. Both characters have identical physics and collision widths. Jump/camera baseline does not change with combo.

Cloud kinds:

- White: regular autojump. The cloud’s highest art surface matches its physical top.
- Jelly: a visible purple face gives a13% higher jump for that landing only.
- Ice: visibly cracked cyan cloud disappears after its first landing; that landing still launches a full jump.
- Moving: marked↔, predictable sinusoidal movement with amplitude18px and angular speed1.2rad/s. Collision position is evaluated at the exact crossing time.
- Gold: smaller62px optional branch, +1star the first time it is landed on. The branch can rejoin the main route. No star is required to win.

All main jumps use authored vertical intervals80…106px; lateral motifs stay within a reachable corridor. Apprentice widens ordinary clouds to135px; Standard narrows from118px toward98.2px by later routes. Wide rest pads are180px in both difficulties. The layout determines difficulty; physics remains identical.

Feet are swept through platform tops only while descending. The solver checks player horizontal position and moving-cloud position at the crossing fraction, then selects the earliest intersected top. Ascending through the underside never lands. The tolerance is half cloud width+11px. Render sprite width80px is cosmetic and does not change collision.

Every unique center landing within18px adds20points; each unique gold-cloud star adds80points. Height adds floor(highest y). Center combo increments only on a center landing and resets on another landing. Every third center landing uses `@game-lab/locale-voice` praise; it changes text/sound only. UI locale is passed without inferring a region. `knowledge/locale-voice/catalog.json` supplies friendly register, region-neutral fallback, cue `perfect_streak_3`, native-review-pending status. No new region slang, voice asset or runtime TTS is introduced.

Wind is displayed in the HUD with direction, seconds until the next phase and upcoming direction. Biome0is calm. Other biomes repeat12seconds:3s calm →3s right26px/s² →3s calm →3s left26px/s². It is deterministic, never random gust damage.

The first fall below highest−430px (Standard) or highest−490px (Apprentice), with an initial floor−180px, triggers Pip. The character is returned to its highest main-route landing checkpoint with zero horizontal speed and a normal jump. Pip appears beside the character and a localized message states the rescue. The HUD changes from1remaining to used. A second fall ends the run. Rescue does not respawn a consumed ice cloud; its fresh jump can reach the next cloud.

The camera tracks the highest position at a fixed offset and never changes jump strength or follows a fall downward. Parallax and squish/air tilt are rendering-only; reduced motion removes decorative drift and avatar stretch/rotation. Collision and animation do no synchronous network work. Music is optional and pauses with play/visibility.

## Authored route intents, pacing and readability

Each route has three acts: establish its lateral motif → mirrored reply → final reprise; wide stationary clouds separate the acts. The route’s interval pattern changes its vertical rhythm. Optional gold branches recur at marked junctions. Primary white/jelly/ice/ribbon clouds form the continuous route; gold branches remain small and offset. The sky cottage is the high-contrast endpoint. Offscreen clouds are culled from drawing.

| Route | Biome / intent | Main clouds | Goal height | Standard bot time | Three-act pacing |
| --- | --- | ---: | ---: | ---: | --- |
|1|Morning garden; learn short corrections|34|2652|29.92s|gentle drift → mirror → cottage|
|2|Morning garden; broad left/right arcs|61|4956|53.92s|arcs → wide rests → full arc|
|3|Morning garden; first jelly launch|61|5040|47.75s|jelly read → safe reprise → mixed jumps|
|4|Sunset islands; first moving ribbon|61|5100|47.55s|visible ribbon → rest → ribbon/jelly|
|5|Sunset islands; longer alternating arcs|64|5416|47.02s|long arc → mirror → return|
|6|Sunset islands; first one-use ice|64|5490|46.68s|ice read → wide recovery → mixed types|
|7|Crystal sky; close inward turns|64|5472|46.52s|inward turn → outward reply → mixed turn|
|8|Crystal sky; alternating edge visits|67|5756|49.20s|edge arc → central rest → return arc|
|9|Crystal sky; high/low interval rhythm|67|5768|49.12s|variable heights → rest → combine|
|10|Starlight observatory; long pendulum|70|6052|52.99s|sweep → mirrored sweep → finish|
|11|Starlight observatory; high crystal steps|70|6106|54.01s|taller steps → broad rest → combine|
|12|Starlight observatory; final mixed route|73|6342|59.16s|all types → mirrored act → sky cottage|

The same steering bot completes all twelve in Apprentice as well, without consuming rescue. The controller uses the exact production `stepClimb`; it does not teleport, override outcomes or set position. Tests require tutorial>25seconds and all later routes>40seconds, with all<150seconds. Actual visual/touch/mobile readability is separately verified by the parent browser session. Native-locale and child observations remain pending.

Morning garden has leafy floating islands and a pastel balloon. Sunset has warm light, lighthouse islands and a lilac balloon. Crystal sky has ice prisms and snowy island caps. Starlight has moon, constellations and observatory telescopes. Parallax is gentle and does not obscure mandatory cloud silhouettes.

## Controls, UI and storage

- Desktop: hold physical ArrowLeft/ArrowRight or A/D. Release to slow down. Escape/P toggles pause. Canvas receives focus after start/resume.
- Desktop/tablet layout at721px and wider places the unchanged480×640world canvas in a left column, with route/pause, a2×2HUD, rescue status and arrow buttons on the right. Height-based sizing targets approximately343×457px of canvas at800×600 and469×625px at1024×768, subject to browser safe areas; narrower mobile keeps the vertical layout.
- Touch: hold the large physical←/→buttons, or drag over the sky to steer toward that horizontal position. Pointer capture keeps holds stable; pointerup, pointercancel and lost capture release them. Pointer buttons remain physically ordered in RTL.
- Blur/hidden tab: pause immediately and clear keyboard/hold/drag input. Resume is explicit. The fixed-step accumulator resets on resume, so no background catch-up occurs.
- Setup: character, difficulty, available route, controls and cloud legend. Route1available initially. Completed routes persist. Challenge links may open an authored locked route without granting skipped completion; only contiguous completed routes unlock normal selection. The ordinary endless menu remains locked until all twelve are completed. A valid explicit endless challenge starts the same seeded endless route even for a fresh friend; this per-run entry does not grant menu unlocks or authored completion. Changing difficulty leaves that explicit challenge and returns to authored mode while the ordinary endless menu is locked. A single selection resolver is used by start, menu, difficulty and next: only exact active seed/level/difficulty/mode challenges retain access; ordinary selection clamps to contiguous unlocked routes and the standard seed. Next is hidden when a challenge win has not unlocked that next ordinary route.
- Result: height, stars, center landings, score, difficulty-specific local best, retry/next/menu and optional share/copy. Each retry creates a new run without page reload.
- Home: shared mount outside game overlays; click ends a live run as abandoned. Pagehide also closes a live run, guarded against duplicate end events.
- Local storage: `game-lab:cloud-climb:v1` records twelve completion flags and validated best scores by difficulty/route. Invalid/throwing storage falls back to in-memory play. No save operation blocks movement or retry.

Nine full UI dictionaries: zh-Hant, en, es, pt-BR, fr, ar, sw, id, hi. Arabic sets document directionRTL. All new mechanics/control/result/help strings are dictionary entries. No new language is added to the portal by this package.

## Lifecycle, audio and challenge sharing

Shared `createRun` / `transitionRun` lifecycle, gameIdC003. One `game_start` and one `game_end` per started run, including menu/Home/navigation abandon. Pause changes state without ending the run. `retry_click` is distinct. Events use the existing no-op sink; no collection backend is added.

`GameAudio` controls shared persisted SFX/music/quiet settings. Local synthesized cues accompany landings, jelly, stars, Pip and results. Planned music source paths are `./audio/mozart-k545.webm` and `.mp3`; parent copies licensed Mozart assets and credits before integration, to avoid an intermediate all-public audio audit failure. No runtime TTS.

Result card uses `@game-lab/game-share` to generate a local PNG with chosen character, Pip, biome palette, height/stars/score and route. Link preserves language and includes a validated version1challenge hash with seed, level, difficulty, target score and endless flag. It recreates the same route; only the target changes. No percentile or comparison with other players is claimed. Card metadata, challenge link, character and biome artwork are captured as one snapshot before asynchronous PNG generation, so Retry/Next cannot pair an old card with a new run’s link. Sharing is optional and outside play; native-share cancellation returns quietly, and link/download failure has localized feedback.

## Verification and reproducible manual steps

Automated (2026-10-29):

```
pnpm --config.verify-deps-before-run=false --filter @game-lab/cloud-climb typecheck
pnpm --config.verify-deps-before-run=false --filter @game-lab/cloud-climb test
pnpm --config.verify-deps-before-run=false --filter @game-lab/cloud-climb build
```

40tests pass:24full-route simulations, swept fast descent, underside pass, ice one-use, jelly impulse, one-rescue/second-fall, deterministic seed/moving motion, validated challenge hash and fresh-friend endless challenge entry preserving exact seeded route, finite bounds, cosmetic combo, gold-detour completion, profile/unlock/corruption, leaving late authored/endless challenges through menu/difficulty/next, keyboard release after focus changes and paused-key suppression, all locale dictionaries and500seconds of actual endless bot play beyond45,000height with rescue unused. Endless streams bounded segments and drops sufficiently old cloud objects. All rules are pure and rendering/input/audio/platform adapters remain separate.

At375×812, start Apprentice route1; hold right then release; drag left; pointercancel; check character follows and release slows. Pause, wait2seconds, verify unchanged height/time, then resume. Switch tabs and return; resume button must be shown. Fall twice: first Pip message and rescue counter change, then result. Retry: fresh run and controls work without reload. Complete route1with keyboard or steering bot: result, next route enabled, menu marks route1complete. Reload: unlock remains. Inject throwing storage: start/retry still work. Repeat with Standard and Lili to confirm equal physics and narrower platforms.

At800×600 and an iPad-sized portrait/landscape viewport, check Home/language/audio remain usable, canvas and controls fit, no horizontal overflow and labels wrap. Repeat setup/play/pause/result in Arabic and reduced motion. Open a copied authored challenge in a clean context and confirm seed/level/difficulty/target. On a result, download/share a card and inspect character/biome art. Verify standalone `dist` with portal and analytics unavailable.

Development-only read-only inspection: `window.cloudClimb.snapshot()` returns cloned state, route, screen and run. Parent browser steering tests may read this and dispatch real keys/drag events; it cannot mutate gameplay and is absent from production. Parent records screenshots and deployment smoke separately. Current known pending verification: native speaker/child review, real iOS/Android devices and integrated release receipt.
