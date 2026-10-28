import { cloudPath, safePoint, type Artwork, type Point, type StickerKind } from './rules';
export const COLORS = ['cream', 'pink', 'mint', 'blue'] as const;
export type CloudColor = typeof COLORS[number];
export type CloudArt = Artwork & {
    color: CloudColor;
    hole: boolean;
    secondColor?: CloudColor;
};
export type Shape = 'round' | 'wide' | 'tall' | 'heart' | 'star' | 'crescent' | 'flower' | 'diamond' | 'hat' | 'rabbit' | 'cup' | 'scarf';
export const SHAPES: readonly Shape[] = ['round', 'wide', 'tall', 'heart', 'star', 'crescent', 'flower', 'diamond', 'hat', 'rabbit', 'cup', 'scarf'];
export type Order = Readonly<{
    id: number;
    stage: number;
    shape: Shape;
    color: CloudColor;
    hole: boolean;
    sticker: StickerKind | null;
    count: number;
    secondColor?: CloudColor;
    wind: boolean;
    customer: 'dodo' | 'lili' | 'pip';
}>;
const recipes: readonly [
    Shape,
    CloudColor,
    boolean,
    StickerKind | null,
    number,
    CloudColor?
][] = [
    ['round', 'cream', false, null, 0], ['wide', 'cream', false, null, 0], ['tall', 'cream', false, null, 0], ['heart', 'cream', false, null, 0], ['hat', 'cream', false, null, 0], ['rabbit', 'cream', false, null, 0], ['star', 'cream', false, null, 0], ['cup', 'cream', false, null, 0],
    ['round', 'pink', true, 'star', 1], ['flower', 'mint', false, 'rain', 1], ['crescent', 'blue', false, 'star', 1], ['hat', 'pink', false, 'rainbow', 1], ['rabbit', 'mint', false, 'star', 1], ['cup', 'blue', true, 'rain', 1], ['scarf', 'pink', false, 'rainbow', 1], ['diamond', 'mint', true, 'star', 1],
    ['round', 'pink', true, 'star', 2, 'mint'], ['hat', 'blue', false, 'rainbow', 2, 'pink'], ['rabbit', 'mint', false, 'rain', 2, 'cream'], ['heart', 'pink', true, 'star', 2, 'blue'], ['scarf', 'blue', false, 'rainbow', 2, 'mint'], ['cup', 'mint', true, 'rain', 2, 'pink'], ['flower', 'pink', true, 'star', 2, 'cream'], ['crescent', 'blue', false, 'rainbow', 2, 'pink']
];
export const ORDERS: readonly Order[] = recipes.map(([shape, color, hole, sticker, count, secondColor], i) => ({ id: i + 1, stage: Math.floor(i / 8), shape, color, hole, sticker, count, secondColor, wind: i >= 20, customer: (['dodo', 'lili', 'pip'] as const)[i % 3] }));
const N = 64;
export function shapePoints(shape: Shape): Point[] { return Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2 - Math.PI / 2; let r = .29, x = 0, y = 0; if (shape === 'star')
    r = .23 + .085 * Math.cos(5 * (a + Math.PI / 2)); if (shape === 'flower')
    r = .26 + .045 * Math.cos(6 * a); if (shape === 'diamond')
    r = .33 / (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a))); if (['hat', 'rabbit', 'cup', 'scarf'].includes(shape)) {
    const poly: Point[] = shape === 'hat' ? [{ x: .16, y: .65 }, { x: .16, y: .55 }, { x: .32, y: .55 }, { x: .34, y: .22 }, { x: .66, y: .22 }, { x: .68, y: .55 }, { x: .84, y: .55 }, { x: .84, y: .65 }] : shape === 'rabbit' ? [{ x: .30, y: .74 }, { x: .24, y: .47 }, { x: .33, y: .38 }, { x: .32, y: .11 }, { x: .43, y: .11 }, { x: .47, y: .36 }, { x: .53, y: .36 }, { x: .57, y: .11 }, { x: .68, y: .11 }, { x: .67, y: .38 }, { x: .76, y: .47 }, { x: .70, y: .74 }] : shape === 'cup' ? [{ x: .27, y: .26 }, { x: .65, y: .26 }, { x: .67, y: .34 }, { x: .83, y: .35 }, { x: .86, y: .55 }, { x: .67, y: .61 }, { x: .61, y: .75 }, { x: .32, y: .75 }] : [{ x: .18, y: .30 }, { x: .78, y: .30 }, { x: .78, y: .47 }, { x: .61, y: .47 }, { x: .68, y: .78 }, { x: .49, y: .81 }, { x: .44, y: .47 }, { x: .18, y: .47 }];
    const t = i / N * poly.length, j = Math.floor(t), f = t - j, p = poly[j], q = poly[(j + 1) % poly.length];
    return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f };
} if (shape === 'heart') {
    const t = i / N * 2 * Math.PI;
    x = .020 * Math.pow(Math.sin(t), 3) * 16;
    y = -.020 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: .5 + x, y: .49 + y };
} x = Math.cos(a) * r * (shape === 'wide' ? 1.38 : shape === 'tall' ? .68 : 1); y = Math.sin(a) * r * (shape === 'tall' ? 1.23 : shape === 'wide' ? .70 : 1); if (shape === 'crescent' && x > 0)
    x -= .13 * (1 - Math.abs(y) / .29); return { x: .5 + x, y: .5 + y }; }); }
export function blankArt(): CloudArt { return { points: shapePoints('round'), stickers: [], color: 'cream', hole: false }; }
export function targetArt(order: Order): CloudArt { return { points: shapePoints(order.shape), color: order.color, hole: order.hole, secondColor: order.secondColor, stickers: Array.from({ length: order.count }, (_, id) => ({ id, kind: order.sticker!, point: { x: .43 + id * .14, y: .50 } })) }; }
export function sculpt(art: CloudArt, anchor: Point, delta: Point, radius = .17): CloudArt { return { ...art, points: art.points.map(p => { const distance = Math.hypot(p.x - anchor.x, p.y - anchor.y), w = Math.exp(-distance * distance / (radius * radius)); return safePoint({ x: p.x + delta.x * w, y: p.y + delta.y * w }); }) }; }
export function scaleArt(art: CloudArt, factor: number): CloudArt { const f = Number.isFinite(factor) ? Math.max(.5, Math.min(2, factor)) : 1; return { ...art, points: art.points.map(p => safePoint({ x: .5 + (p.x - .5) * f, y: .5 + (p.y - .5) * f })) }; }
function center(points: readonly Point[]): Point { const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y)); return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }; }
function normalized(points: readonly Point[]): Point[] { const c = center(points), span = Math.max(Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)), Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)), .001); return points.map(p => ({ x: (p.x - c.x) / span, y: (p.y - c.y) / span })); }
/** Bidirectional contour distance removes handle-count/placement bias while preserving aspect and lobes. */
export function silhouetteSimilarity(a: readonly Point[], b: readonly Point[]): number { if (a.length < 3 || b.length < 3)
    return 0; const aa = normalized(a), bb = normalized(b); const mean = (p: Point[], q: Point[]) => p.reduce((sum, x) => sum + Math.min(...q.map(y => Math.hypot(x.x - y.x, x.y - y.y))), 0) / p.length; return Math.max(0, 1 - (mean(aa, bb) + mean(bb, aa)) * 2.5); }
export function silhouetteMinimum(shape: Shape): number { return shape === 'scarf' ? .74 : shape === 'cup' ? .77 : shape === 'rabbit' ? .82 : shape === 'hat' ? .84 : .83; }
export function scoreOrder(art: CloudArt, order: Order) { const similarity = silhouetteSimilarity(art.points, shapePoints(order.shape)); const silhouette = similarity >= silhouetteMinimum(order.shape); const topology = art.hole === order.hole && (!art.hole || holeFits(art.points)); const detail = art.color === order.color && art.secondColor === order.secondColor && art.stickers.length === order.count && art.stickers.every(s => s.kind === order.sticker); const stars = Number(silhouette) + Number(topology) + Number(detail); return { silhouette, topology, detail, similarity, stars, passed: silhouette && topology && detail }; }
export function holeFits(points: readonly Point[]): boolean {
    const inside = (p: Point) => { let yes = false; for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const a = points[i], b = points[j];
        if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
            yes = !yes;
    } return yes; };
    return Array.from({ length: 12 }, (_, i) => ({ x: .5 + Math.cos(i / 12 * 2 * Math.PI) * .072, y: .5 + Math.sin(i / 12 * 2 * Math.PI) * .072 })).every(inside);
}
export function artPath(art: CloudArt, w = 1000, h = 700): string { return cloudPath(art.points, w, h) + (art.hole && holeFits(art.points) ? ` M ${w * .57} ${h * .5} A ${w * .07} ${h * .07} 0 1 0 ${w * .43} ${h * .5} A ${w * .07} ${h * .07} 0 1 0 ${w * .57} ${h * .5} Z` : ''); }
export function dailyOrder(day: string): number { let hash = 2166136261; for (const ch of `cloud-cafe:${day}`) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
} return (hash >>> 0) % 24; }
export function pushUndo(history: readonly CloudArt[], art: CloudArt): CloudArt[] { return [...history.slice(-39), art]; }
export function freeDescription(art: CloudArt): {
    shape: Shape;
    similarity: number;
} { return SHAPES.map(shape => ({ shape, similarity: silhouetteSimilarity(art.points, shapePoints(shape)) })).sort((a, b) => b.similarity - a.similarity)[0]; }
/** Readable partial forms introduce feature editing without solving the silhouette. */
export function starterArt(order: Order): CloudArt {
    const art = blankArt();
    if (order.shape === 'hat')
        return { ...art, points: shapePoints('hat').map(p => ({ ...p, y: p.y < .54 ? .48 : p.y })) };
    if (order.shape === 'rabbit')
        return { ...art, points: shapePoints('rabbit').map(p => ({ ...p, y: p.y < .35 ? .35 : p.y })) };
    if (order.shape === 'cup')
        return { ...art, points: shapePoints('cup').map(p => ({ ...p, x: p.x > .67 ? .67 : p.x })) };
    if (order.shape === 'scarf')
        return { ...art, points: shapePoints('scarf').map(p => ({ ...p, y: p.y > .48 ? .5 : p.y })) };
    return art;
}
