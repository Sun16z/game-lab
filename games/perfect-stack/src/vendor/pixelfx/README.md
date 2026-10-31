# pixelfx minimal vendored subset

Source: https://github.com/patch-gg/pixelfx
Commit: `a84159688af3ca37a4be05a0d422b94451b2e24e` (2026-10-31).
License: MIT; see LICENSE and NOTICE.md for upstream credits and local changes.

Included: core frame, effect lifecycle, painter, math, color, simulation and
particle/shape dependencies; pickups/collect-burst, pickups/power-star and
ui/confetti. No npm/GitHub install, runtime network, gallery fonts or character
rig/action/pose/font modules. core/index.js and two unused API removals are
explained in NOTICE.md. The adapter imports these local sources directly.

Review: imported sources contain no network requests, DOM access, eval or dynamic
code execution. License strings and original Sprite Fusion provenance remain.
To update, repeat the subset review and size/performance acceptance; do not pull
upstream automatically.
