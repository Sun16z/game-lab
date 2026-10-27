import { initialArtwork, type Artwork, type StickerKind } from "./rules";

const kinds: readonly StickerKind[] = ["star", "rain", "rainbow"];
const n = (value: number) => Math.round(value * 1000);

/** The fragment remains on the device; only bounded numbers and known icons are accepted. */
export function encodeArtwork(art: Artwork): string {
  return JSON.stringify([1, art.points.map(p => [n(p.x), n(p.y)]), art.stickers.map(s => [kinds.indexOf(s.kind), n(s.point.x), n(s.point.y)])]);
}

export function decodeArtwork(value: string): Artwork | undefined {
  if (!value || value.length > 1200) return undefined;
  try {
    const data: unknown = JSON.parse(value);
    if (!Array.isArray(data) || data.length !== 3 || data[0] !== 1 || !Array.isArray(data[1]) || data[1].length !== initialArtwork().points.length || !Array.isArray(data[2]) || data[2].length > 12) return undefined;
    const coordinate = (x: unknown, y: unknown) => typeof x === "number" && typeof y === "number" && Number.isInteger(x) && Number.isInteger(y) && x >= 40 && x <= 960 && y >= 80 && y <= 920;
    if (!data[1].every((p: unknown) => Array.isArray(p) && p.length === 2 && coordinate(p[0],p[1]))) return undefined;
    if (!data[2].every((s: unknown) => Array.isArray(s) && s.length === 3 && Number.isInteger(s[0]) && s[0] >= 0 && s[0] < kinds.length && coordinate(s[1],s[2]))) return undefined;
    return { points: data[1].map(([x,y]: number[]) => ({x:x/1000,y:y/1000})), stickers: data[2].map(([kind,x,y]: number[],id: number) => ({id,kind:kinds[kind],point:{x:x/1000,y:y/1000}})) };
  } catch { return undefined; }
}
