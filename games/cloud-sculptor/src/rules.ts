/** Normalized coordinates make artwork portable between screen sizes. */
export type Point = Readonly<{ x: number; y: number }>;
export type StickerKind = "star" | "rain" | "rainbow";
export type Sticker = Readonly<{ id: number; kind: StickerKind; point: Point }>;
export type Artwork = Readonly<{ points: readonly Point[]; stickers: readonly Sticker[] }>;

export const initialArtwork = (): Artwork => ({
  points: [{ x: .12, y: .59 }, { x: .19, y: .36 }, { x: .32, y: .42 }, { x: .4, y: .19 }, { x: .54, y: .3 }, { x: .65, y: .22 }, { x: .82, y: .39 }, { x: .88, y: .61 }, { x: .5, y: .73 }],
  stickers: []
});

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
export const safePoint = (point: Point): Point => ({ x: clamp(point.x, .04, .96), y: clamp(point.y, .08, .92) });

export function movePoint(art: Artwork, index: number, point: Point): Artwork {
  if (!Number.isInteger(index) || index < 0 || index >= art.points.length) return art;
  return { ...art, points: art.points.map((old, i) => i === index ? safePoint(point) : old) };
}

export function addSticker(art: Artwork, kind: StickerKind, id: number): Artwork {
  if (art.stickers.length >= 12 || art.stickers.some(sticker => sticker.id === id)) return art;
  return { ...art, stickers: [...art.stickers, { id, kind, point: { x: .5, y: .5 } }] };
}

export function moveSticker(art: Artwork, id: number, point: Point): Artwork {
  if (!art.stickers.some(sticker => sticker.id === id)) return art;
  return { ...art, stickers: art.stickers.map(sticker => sticker.id === id ? { ...sticker, point: safePoint(point) } : sticker) };
}

/** Quadratic midpoint interpolation closes the silhouette without jagged straight corners. */
export function cloudPath(points: readonly Point[], width: number, height: number): string {
  if (points.length < 3) return "";
  const middle = (a: Point, b: Point) => `${(a.x + b.x) * width / 2} ${(a.y + b.y) * height / 2}`;
  return `M ${middle(points[points.length - 1], points[0])} ` + points.map((point, i) => `Q ${point.x * width} ${point.y * height} ${middle(point, points[(i + 1) % points.length])}`).join(" ") + " Z";
}
