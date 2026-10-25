# Game audio contract

Every new game imports `@game-lab/game-audio` and `@game-lab/game-audio/ui` from its first playable version. Create one `GameAudio` with a small ZzFX cue table and optional `music` and approved `voice` URLs. Call `unlock()` from a user gesture, `resume()` when play begins, `pause()` when play stops, and `music("main")` to select the loop. Mount the shared sound button with `mountAudioControls()`.

Put audio files in `games/<slug>/public/audio/` and add every file to `knowledge/audio/credits.json`. `pnpm audio:check` checks credit metadata and size limits. Use `knowledge/locale-voice/catalog.json` for voice clips; only approved entries with existing files enter the generated runtime manifest. Every spoken line must also remain visible as text.

The service worker caches music after the first playback. It does not download audio during installation.
