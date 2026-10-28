import { initialArtwork, type Artwork, type StickerKind } from "./rules";
const kinds: readonly StickerKind[] = ["star", "rain", "rainbow"];
const n = (value: number) => Math.round(value * 1000);
/** The fragment remains on the device; only bounded numbers and known icons are accepted. */
export function encodeArtwork(art: Artwork): string {
    return JSON.stringify([art.points.length === 9 && !art.color ? 1 : 2, art.points.map(p => [n(p.x), n(p.y)]), art.stickers.map(s => [kinds.indexOf(s.kind), n(s.point.x), n(s.point.y)]), ...(art.points.length === 9 && !art.color ? [] : [art.color ?? "cream", art.hole ?? false, art.secondColor ?? null])]);
}
export function decodeArtwork(value: string): Artwork | undefined {
    if (!value || value.length > 2400)
        return undefined;
    try {
        const data: unknown = JSON.parse(value);
        if (!Array.isArray(data) || !((data[0] === 1 && data.length === 3) || (data[0] === 2 && (data.length === 5 || data.length === 6))) || !Array.isArray(data[1]) || !((data[0] === 1 && data[1].length === initialArtwork().points.length) || (data[0] === 2 && data[1].length >= 9 && data[1].length <= 64)) || !Array.isArray(data[2]) || data[2].length > 12)
            return undefined;
        const coordinate = (x: unknown, y: unknown) => typeof x === "number" && typeof y === "number" && Number.isInteger(x) && Number.isInteger(y) && x >= 40 && x <= 960 && y >= 80 && y <= 920;
        if (!data[1].every((p: unknown) => Array.isArray(p) && p.length === 2 && coordinate(p[0], p[1])))
            return undefined;
        if (!data[2].every((s: unknown) => Array.isArray(s) && s.length === 3 && Number.isInteger(s[0]) && s[0] >= 0 && s[0] < kinds.length && coordinate(s[1], s[2])))
            return undefined;
        if (data[0] === 2 && (!["cream", "pink", "mint", "blue"].includes(data[3]) || typeof data[4] !== "boolean"))
            return undefined;
        if (data[5] != null && !["cream", "pink", "mint", "blue"].includes(data[5]))
            return undefined;
        return { ...(data[0] === 2 ? { color: data[3], hole: data[4], secondColor: data[5] ?? undefined } : {}), points: data[1].map(([x, y]: number[]) => ({ x: x / 1000, y: y / 1000 })), stickers: data[2].map(([kind, x, y]: number[], id: number) => ({ id, kind: kinds[kind], point: { x: x / 1000, y: y / 1000 } })) };
    }
    catch {
        return undefined;
    }
}
