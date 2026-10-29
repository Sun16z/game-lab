# Lexi-Jet — continuous-flight design draft, 2026-10-29

Public G024, internal C004. Current Mode A is a continuous word-class shoot ’em up. Grade suggestions and tuning remain hypotheses awaiting teacher, child/caregiver, native-language and physical-device review; no learning outcome is claimed.

## Core loop and pillars

Fly Dodo’s folded-paper jet, aim upward at short English context cards, and switch among noun, verb and adjective beams. The selected gun fires automatically. A matching beam opens the word cloud; another beam bounces and gives a brief inline type hint. The same physical target remains available to retry with another gun. Gameplay never opens a question modal or asks the player to press Continue.

1. Continuous flight comes first: movement, hazards, targets and auto-fire share one live scene.
2. English type decisions have physical meaning: choose a gun and align the jet; a wrong gun cannot clear a word.
3. Context stays truthful: nouns retain their real determiner/context, verbs their real subject, adjectives their described noun. No invented article is added to uncountable nouns or contextual homographs.
4. A generous, telegraphed safe lane gives a readable primary path. Stars are optional branches. Dodo pilots, Lili explains optional result examples, and Pip navigates.
5. Everything remains local and optional: no accounts, ads, names, schools, leaderboards, purchases, streak pressure or runtime AI.

## Mission rules and pacing

A route lasts `60 + 2 × level` seconds: 60–82 seconds for routes 1–12. Open at least eight word clouds in the middle band or ten in the upper band, and retain at least one shield. Clearing the live guardian adds bonus points; it is not a separate win gate. The HUD always shows opened words against the route goal, shields, score and remaining time.

One short word card is requested about every three seconds. A readable per-lane queue delays arrivals until there is at least 110 logical pixels between card centers. Each lane holds at most two ordinary words plus one reserved guardian slot; existing wrong words are never discarded to make room. The guardian has arrival priority during the final 15 seconds. Cards occupy one of three visible flight lanes and remain physical moving targets; full English sentence context is shown inline near the weapon rack without stopping flight. The three persistent guns use localized word-class labels and keyboard 1–3. The beam fires straight upward and resolves against the nearest aligned card at least 35 pixels above the actual jet position. The inline context uses that exact shared cannon selector when aligned, or the nearest approachable word with the same vertical clearance otherwise. Wrong hits are rate-limited, reset combo and record the item ID; they do not damage shields or delete the card. A different gun can open that same card on a later shot. Target expiration is normal movement off screen, not an answer transition.

Five consecutive correct opens produce Word Frenzy sparks and a short optional sound. Frenzy does not skip words, change answers, clear hazards, or stop movement. Correct words earn 100 points, optional stars 25, peak combo contributes ten per step, and the two-hit guardian adds 250 when both words are opened. Scores are bounded at 20000 in challenge and profile contracts. No fake ranking is presented.

Eight hazard stretches divide each mission spatially, without interstitial screens. Their calm lanes change among the three target lanes. Each change clears the old bubble curtain, then gives 1.2 seconds of warning before the new pattern begins. Targets and their safe lane align so the guaranteed controller can keep all shields while actively aiming and selecting the correct gun. Four actual layouts vary straight curtains, offset clusters, sparse diagonal clusters and staggered broken curtains. Lane widths decrease gently across routes but never below the documented safety margin.

Five shields permit mistakes. A collision damages at most once per hazard stretch, with brief invulnerability; gun mistakes never add another shield penalty. One bomb removes actual bubbles once per run, preserving every word target. The last 15 seconds introduce one cloud-book guardian with two sequential, live word targets; flight continues during both hits. There is no boss popup.

## Curriculum and zones

| Routes | Zone and spatial intent | Active word material |
| --- | --- | --- |
| 1–4 | Cloud Orchard: welcoming clouds and wide safe lanes | Middle: 36 contextual POS items; upper: 12 contextual POS homographs |
| 5–8 | Petal Sunset: drifting petals and offset curtains | Same band-specific POS pool, seeded shuffle and longer mission |
| 9–12 | Moon Library: glowing book towers and mixed visible patterns | Same POS pool; apply the same gun skill for a longer flight |

The active material is 48 POS items: 36 middle-band and 12 upper-band. The bank’s 36 synonym, antonym and gap items are retained as future material and cannot appear in current normal or review missions. UI labels describe word classes and contextual POS, not a grammar quiz. Grade 3–4 and grade 5–6 suggestions are not placement assessments. English cards and inline sentences remain LTR inside Arabic UI; weapon labels and optional explanation templates follow the selected UI language.

Onboarding before flight explains movement, auto-fire, the three guns, wrong-hit retry, live goal, stars and bomb. The first target arrives after three seconds, and the first bubble curtain has a 1.2-second warning. First-success and child comprehension still require observed playtesting. Parameters above are initial tuning hypotheses.

## Input, focus and pause

Relative one-finger XY dragging preserves horizontal position on touch-down and smoothly aims 75 logical pixels above the finger, bounded to y=280–560. Each axis is capped at 240 logical pixels/second; touching never teleports the jet. Bubble and star collision uses the actual x/y position. Arrows/WASD steer; 1–3 switch guns. Release/cancel enters slow focus. A new drag, steering key or focus toggle restores ordinary movement.

Focus slows target and hazard motion to 0.4× in gentle flight or 0.65× in brisk flight. Mission time, spawning and auto-fire keep advancing, so focus cannot extend a mission or freeze a word decision. Space toggles focus. Manual Pause, P/Escape, blur and hidden state freeze the whole simulation and clocks. The pause overlay is outside the canvas wrapper, fixed above play controls, with a visible Resume and Route Menu on every viewport. Aside controls become inert while paused. Home remains available above it. Keyup always clears steering even after focus moves into a form.

## Results, review and replay

At the end, Retry is prominent. At most three missed word explanations are available in optional collapsed details, with full original English sentences and localized reasons. There is no explanation gate before a retry.

Each band has 12 independent contiguous local route unlocks. Missed IDs are validated, de-duplicated and bounded; only current POS IDs are accepted. A separate continuous review mission draws only that band’s stored POS misses, uses gentle focus and cannot unlock routes or alter ordinary best scores. Review does not create canonical challenge links, because its question subset differs.

A validated share hash captures exact version, band, route, seed, pace flag and target score; language stays in the query. The exact active challenge grants that route only. Returning to normal selection restores ordinary contiguous permissions. Score, route, band, art and link metadata are captured before asynchronous PNG encoding. Cards are generated locally and visibly include Dodo, Lili and Pip. Corrupt or unavailable storage falls back gracefully.

Each start and retry creates a distinct game-core run with one start/end pair through the no-op analytics sink. Home/pagehide ends an active run once. Restoring an ended run through BFCache returns to the menu. No backend or synchronous network call is needed to play.

## Presentation and verification

Shaded clouds, translucent bubbles, petal shapes, moon towers and a folded-paper jet give three distinct storybook zones. Target cards use actual context and highlighted English words. The 480×640 logical world retains native 3:4 aspect on phone and desktop. Mobile keeps persistent guns and critical controls near the canvas; desktop/tablet places the HUD and guns beside it. Safe-area padding, RTL, minimum 44px controls, reduced-motion decoration and independent audio/music controls are supported.

Pure tests use the actual movement, aim, gun selection, target spawning, auto-fire and collision controller to win all 24 route/band combinations with all shields. They also verify no-input loss on every route, wrong-gun retention and retry, continuous focus clocks, bomb preserving targets, live two-hit guardian, four safe patterns, altitude collisions, score bounds, deterministic seeds, contextual phrase construction and profile/challenge restoration. Parent browser QA owns actual touch/keyboard flow, lifecycle and screenshot confirmation. Physical Safari/iPad/multitouch, child/caregiver testing, teacher assessment and nine native-language reviews remain manual follow-ups.

The static bundle uses existing project dependencies and local crew portraits. Mozart K.545 uses the project’s licensed Mutopia-derived adaptation, with visible HTML and project credits.
