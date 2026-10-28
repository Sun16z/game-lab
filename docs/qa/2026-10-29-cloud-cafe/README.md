# Cloud Café acceptance — 2026-10-29 Taipei

G018 upgrades the existing `/play/cloud-sculptor/` route, preserving legacy artwork fragments.24 authored orders,12 free-form templates, practice/45s/30s modes, stage-gated color/hole/sticker/blend tools and predictable wind. No backend, account or global ranking.

## Evidence
- Workspace typecheck,tests,build passed; final café project typecheck,22tests,build passed after review fixes. G018 JS≈42KB gzip versus150KB budget.
- Actual browser pointer gesture: hat05 starts incomplete, drag(.50,.48)→(.50,.22) in15steps yields88% vs84% required,3stars. Repeated at375×812,800×600,1024×768; Serve and Retry remain inside viewport. Compact desktop tools above board/service row.
- All24orders: exacttarget supplied through DEV-only hook to exercise start/serve/next/result;24unique starts and24ends, no page errors. This proves lifecycle/targetscoring, not manual child difficulty.
- Nine locales: stage3 start/result, correctRTL forArabic, no missingstrings/horizontaloverflow.
- Pause clock freezes; timeout retains art and supports continuation without timer. Storage getter denied still permits complete/retry.
- Actual PNG rendered and fallback downloaded as cloud-cafe.png; native-share support invokes OS share flow instead. Copiedorderlink previews actualsenderart and opens it infreecreation whilechallenge starts fresh.
- Persisted pagehide/pageshow simulation returns ended run to menu, nextstart has newrunID.
- Independent scoped and whole-branch review approved after incoming-art, corrupted-metadata and browser-history fixes. Export snapshots URL/labels before asynchronous encoding.

## Changed files
- `games/cloud-sculptor/`: HTML,metadata/OG,packageanalyticsdependency,main/styles,legacy rules/challenge codec, newcafe rules/locales/editor/render/clock/storage and tests,DESIGN.md.
- `packages/game-core/src/index.ts`: G018 title/summary; C003type reserved for the separately released cloud-climb.
- `pnpm-lock.yaml`: café analytics workspace dependency.
- `docs/superpowers/plans/2026-10-29-cloud-cafe.md`, this QA folder.

Screenshots: [phone](mobile.png), [desktop](desktop.png), [blendtools](blend-desktop.png).

Physical iPad/multitouch, nativeOSshare completion and native-language review remain manual checks. Progress is device-local. Child playtesting is needed to tune shape tolerance; no therapeutic outcomes are claimed. Preview and production receipts are recorded in the PR before/after merge.
