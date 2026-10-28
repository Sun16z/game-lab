import { it, expect } from 'vitest';
import { ORDERS, starterArt, sculpt, scoreOrder, type CloudArt } from './cafe-rules';
/** Simulate the actual input algorithm over a continuous pointer drag. */
const drag = (a: CloudArt, x: number, y: number, dx: number, dy: number, radius = .17) => { for (let i = 0; i < 15; i++)
    a = sculpt(a, { x: x + dx * i / 15, y: y + dy * i / 15 }, { x: dx / 15, y: dy / 15 }, radius); return a; };
it('makes later partial silhouettes reachable with one to two broad gestures', () => {
    for (const name of ['hat', 'rabbit', 'cup', 'scarf'] as const) {
        const o = ORDERS.find(o => o.shape === name)!;
        let a = starterArt(o);
        expect(scoreOrder(a, o).silhouette).toBe(false);
        if (name === 'hat')
            a = drag(a, .5, .48, 0, -.26);
        if (name === 'rabbit')
            for (const x of [.375, .625])
                a = drag(a, x, .35, 0, -.24, .1);
        if (name === 'cup')
            a = drag(a, .67, .46, .16, 0);
        if (name === 'scarf')
            a = drag(a, .58, .50, 0, .27);
        expect(scoreOrder(a, o).silhouette, name).toBe(true);
    }
});
