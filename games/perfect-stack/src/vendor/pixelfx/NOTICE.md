# Notices

**Hugo Duprez.** `src/core/sim.js` and the effects that say so at the top of their file adapt Sprite Fusion's
open-source pixel art VFX (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT License.

**Hollow Crown.** `src/core/act.js` adapts how Hollow Crown plays its skills (poses on 12 fps steps, hit-stops, the springy
straw target), from
https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT License.

**Patch Pixel.** The font in `gallery/fonts` is Patch's own and is not covered by this repository's MIT license. See
`gallery/fonts/NOTICE.md`.

## Game Lab local adaptation (2026-10-31)

Pinned upstream commit: a84159688af3ca37a4be05a0d422b94451b2e24e.
Only rendering dependencies and collect-burst, power-star, confetti are included.
core/index.js is a minimal export barrel; unused stockActor fallback in fx.js and
unused text/measure methods and font import in painter.js were removed so no
actor/font/action assets are bundled. No gallery assets or proprietary fonts copied.
Other imported files retain upstream implementation and copyright comments.

2026-10-31: confetti popper origins moved from ±74 to ±112 pixels to sit beside the result card.
