# Game Lab working rules

- Read `docs/PRD.md` and `docs/ROADMAP.md` before implementing a game.
- Keep every game playable as a standalone static HTML5 bundle without the portal or an analytics server.
- Keep game text in locale dictionaries; validate mobile layouts and RTL when adding a language. Localized search pages need their own URL and complete translated content.
- Use `knowledge/locale-voice/catalog.json` and `@game-lab/locale-voice` for reusable celebration copy. Record locale, region, register, cue and native-review status; do not infer a player's ethnicity or apply region-specific slang without a matching locale.
- Do not add synchronous network work to the render loop, input handling, scoring or retry path. Keep production builds deployable as static files through a CDN.
- Put deterministic game rules in testable pure functions. Keep rendering, input, audio and platform adapters separate.
- Use the shared run lifecycle and event types. A retry creates a fresh run; each started run emits one `game_start` and one `game_end`.
- Every new game's result screen uses `@game-lab/game-share` for a locally generated score card and a language-preserving replay link; keep sharing optional and outside the gameplay loop.
- The first release has no accounts, public leaderboard, advertisements or collection of children's names, schools or classes.
- Do not mark a game as playable in the portal until its start, play, end and retry flow works on touch and keyboard.
- Run `pnpm typecheck`, `pnpm test` and `pnpm build` after implementation changes.
