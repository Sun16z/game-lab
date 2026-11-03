import type { Theme } from "./progress";

export interface StackPalette {
  background: number;
  blocks: readonly number[];
  accent: number;
}

const PALETTES: readonly StackPalette[] = [
  { background: 0x91ced7, blocks: [0xe2a96a, 0xd88669, 0x9ac2ad, 0xe8c574], accent: 0xffd575 },
  { background: 0x91ced7, blocks: [0x9ec7b7, 0xdda577, 0xb3bf97, 0xe5bc72], accent: 0xffd575 },
  { background: 0x91ced7, blocks: [0xe7be7b, 0xc58e7f, 0x8fbdc2, 0xe2a16f], accent: 0xffd575 }
];
const THEME_PALETTES: Record<Exclude<Theme, "classic">, StackPalette> = {
  neon: { background: 0x181d3d, blocks: [0x34e4e1, 0xff5fb7, 0xc37aff, 0x8affde], accent: 0xfaf46c },
  cosmos: { background: 0x111830, blocks: [0xbdaaff, 0x89b9ff, 0xffb9db, 0x8ce0e7], accent: 0xffe9a8 }
};

export function paletteFor(seed: string, theme: Theme): StackPalette {
  if (theme !== "classic") return THEME_PALETTES[theme];
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return PALETTES[(hash >>> 0) % PALETTES.length];
}
