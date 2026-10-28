# Dodo & Lili Cloud Climb acceptance — 2026-10-29 Taipei

New candidate C003/G023 preserves the20original ideas and existing C001/C002. Standalone `/play/cloud-climb/`,12routes/fourbiomes,apprentice/standard, equalability characters, onePiprescue and unlockableendless. No backend/account/ranking/ads. Brand sprites and licensed Mozart arrangement are packaged locally.

## Verification
- Fullworkspace `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm size:check` passed. Newgame40tests; JS37,987bytesgzip/150,000budget.
- All12authored routes ×2difficulty simulations finish using actualsteering/collisionphysics withoutrescue. Tutorial≈29.92sec; later≈46.5–59.2sec. Tests cover sweptlanding/underside/ice/jelly,optionalrewarddetour,wind,500secondsboundedendless,profile/input/challenges.
- Browser375×812: actualpointerdragcontroller completedtutorial in29.925simulatedseconds, rescueunused; result/retry yieldedfreshRunID. Simulation usedvirtualclock plus actualDOMpointerevents, not direct state replacement.
- Browser800×600 and1024×768: keyboardsteer,pause/resume andscreenbounds verified; worldremains480×640. Desktopstage343×457 and469×625 respectively, controlsbesideit. Phone341×455stage. No horizontaloverflow.
-9locales start/pause verified; ArabicRTL,no missingstrings. Freshprofilecanacceptvalidendlesschallenge. Native-shareteststub received actual823,652bytePNGandconsistentfinished-runlink afterRetryduringencoding; fallback/export APIs shared withCafé.
- Independentwholegame review approved after fixing challengeaccessafterleaving,keyupfocusrelease and asynchronoussharemetadata. Input released onblur/cancel; hiddenpagepauses; historyrestore returnsendedrun tomenu.

## Files
- `games/cloud-climb/`:rules/profile/keyboard/presentation/UI/locales/tests,standaloneHTML/Vite/TSconfig,brandart,OG/favicon,music,DESIGN.md.
- Rootpackagebuildscript,lockimporter andcopy-game include thebundle.
- Sharedcatalog registersC003/G023 andcatalogtest keepsuniqueIDs.
- `knowledge/audio/credits.json`:Mozart CC BY-SA3.0 paths; visiblepagecredit.
- Implementationplan andthisQA folder.

Screenshots: [phone](mobile.png), [desktop](desktop.png), [result](result-mobile.png). Preview andproduction receipts are recorded in thePR. PhysicaliPad/foldhinge/Safari and native-language/nativeOSshare completion remain manual; childplaytesting stillneeded forrealdifficulty.
