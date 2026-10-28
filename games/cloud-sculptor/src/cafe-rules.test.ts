import { describe, it, expect } from 'vitest';
import { ORDERS, SHAPES, blankArt, targetArt, scoreOrder, silhouetteSimilarity, shapePoints, sculpt, scaleArt, pushUndo, dailyOrder, artPath, freeDescription } from './cafe-rules';
import { decodeArtwork, encodeArtwork } from './challenge';
import { ServiceClock } from './clock';
describe('authored café orders', () => {
    it('has 24 progressively introduced and solvable orders with three clear criteria', () => {
        expect(ORDERS).toHaveLength(24);
        expect(new Set(ORDERS.map(o => JSON.stringify([o.shape, o.color, o.hole, o.sticker, o.count, o.secondColor]))).size).toBe(24);
        for (const o of ORDERS) {
            const target = targetArt(o);
            expect(scoreOrder(target, o)).toMatchObject({ silhouette: true, topology: true, detail: true, stars: 3, passed: true });
            expect(target.points).toHaveLength(64);
            expect(target.points.every(p => p.x >= .04 && p.x <= .96 && p.y >= .08 && p.y <= .92)).toBe(true);
            if (o.stage === 0)
                expect([o.color, o.count, o.hole, o.secondColor]).toEqual(['cream', 0, false, undefined]);
            if (o.stage === 2)
                expect(o.secondColor).toBeTruthy();
        }
    });
    it('does not let a circular cloud impersonate a hat, rabbit, teacup or scarf', () => {
        for (const shape of ['hat', 'rabbit', 'cup', 'scarf'] as const) {
            const o = ORDERS.find(o => o.shape === shape)!;
            const art = { ...targetArt(o), points: shapePoints('round') };
            expect(scoreOrder(art, o).silhouette, shape).toBe(false);
        }
    });
    it('does not let every basic starter impersonate detailed silhouettes', () => { for (const shape of ['heart', 'star', 'crescent', 'flower', 'hat', 'rabbit', 'cup', 'scarf'] as const) {
        const o = ORDERS.find(o => o.shape === shape)!;
        for (const starter of ['round', 'wide', 'tall'] as const)
            expect(scoreOrder({ ...targetArt(o), points: shapePoints(starter) }, o).silhouette, shape + ' / ' + starter).toBe(false);
    } });
    it('scores holes, exact sticker kind/count and the second color separately', () => {
        const o = ORDERS[16], target = targetArt(o);
        expect(scoreOrder({ ...target, hole: false }, o)).toMatchObject({ silhouette: true, topology: false, detail: true, stars: 2, passed: false });
        expect(scoreOrder({ ...target, stickers: [] }, o).detail).toBe(false);
        expect(scoreOrder({ ...target, secondColor: 'blue' }, o).detail).toBe(false);
        expect(scoreOrder({ ...target, stickers: target.stickers.map(s => ({ ...s, kind: 'rain' })) }, o).detail).toBe(false);
    });
    it('normalizes placement and uniform size without erasing aspect ratio', () => {
        const p = shapePoints('hat'), q = p.map(p => ({ x: p.x * .65 + .12, y: p.y * .65 + .11 }));
        expect(silhouetteSimilarity(p, q)).toBeCloseTo(1, 8);
        expect(silhouetteSimilarity(shapePoints('wide'), shapePoints('tall'))).toBeLessThan(.8);
    });
    it('continuously deforms neighboring contour samples, keeps boundaries and supports pinch', () => {
        const a = blankArt(), b = sculpt(a, a.points[0], { x: .08, y: -.03 });
        expect(b.points.filter((p, i) => Math.hypot(p.x - a.points[i].x, p.y - a.points[i].y) > .001).length).toBeGreaterThan(3);
        expect(a.points).not.toEqual(b.points);
        const large = scaleArt(b, 900);
        expect(large.points.every(p => p.x >= .04 && p.x <= .96 && p.y >= .08 && p.y <= .92)).toBe(true);
        expect(scaleArt(a, 1).points).toEqual(a.points);
        let history: typeof a[] = [];
        for (let i = 0; i < 70; i++)
            history = pushUndo(history, a);
        expect(history).toHaveLength(40);
    });
    it('round-trips each target, gradients and hole geometry through a bounded share fragment', () => {
        for (const o of ORDERS) {
            const target = targetArt(o);
            const decoded = decodeArtwork(encodeArtwork(target));
            expect(decoded?.points).toHaveLength(64);
            expect(decoded?.hole).toBe(o.hole);
            expect(decoded?.secondColor).toBe(o.secondColor);
            expect(decoded?.color).toBe(o.color);
        }
        expect(artPath(targetArt(ORDERS[16]))).toContain(' A ');
        expect(artPath(blankArt())).not.toContain(' A ');
        expect(freeDescription(blankArt()).shape).toBe('round');
        expect(new Set(SHAPES).size).toBe(12);
    });
    it('uses stable UTC daily assignment with variation and bounded valid indices', () => { expect(dailyOrder('2026-10-29')).toBe(dailyOrder('2026-10-29')); const dates = Array.from({ length: 31 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`); expect(new Set(dates.map(dailyOrder)).size).toBeGreaterThan(8); for (const date of dates)
        expect(dailyOrder(date)).toBeGreaterThanOrEqual(0); });
});
describe('service clock', () => {
    it('charges only active play and preserves art-independent timer expiry', () => { const c = new ServiceClock(); c.start(2, 0); expect(c.tick(1000, false)).toBe(false); expect(c.remaining).toBe(2); expect(c.tick(2000, true)).toBe(false); expect(c.remaining).toBe(1); expect(c.tick(3000, true)).toBe(true); expect(c.remaining).toBe(0); c.start(null, 3000); expect(c.tick(9000, true)).toBe(false); expect(c.remaining).toBeNull(); });
});
describe('manual onboarding silhouettes', () => {
    it('gives partial hats and rabbits that need visible contour work', async () => { const { starterArt } = await import('./cafe-rules'); for (const name of ['hat', 'rabbit', 'cup', 'scarf'] as const) {
        const o = ORDERS.find(o => o.shape === name)!;
        const art = starterArt(o);
        expect(scoreOrder({ ...art, color: o.color, hole: o.hole, stickers: targetArt(o).stickers }, o).silhouette, name).toBe(false);
    } });
});
it('requires a real enclosed hole rather than a detached circle outside the cloud', () => { const o = ORDERS[8], art = targetArt(o); const moved = { ...art, points: art.points.map(p => ({ x: p.x * .5 + .45, y: p.y * .5 + .3 })) }; expect(scoreOrder(moved, o).topology).toBe(false); expect(artPath(moved)).not.toContain(' A '); });
