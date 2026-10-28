import { describe, expect, it } from 'vitest';
import { checkOrder, emptyPlate, matches, orders, put, remove } from './rules';
describe('restaurant orders', () => {
  it('distinguishes missing, extra, forbidden and wrong-position ingredients', () => {
    expect(checkOrder(orders[1], ['lemon', null, null, null])).toBe('missing');
    expect(checkOrder(orders[0], ['tomato', 'star', null, null])).toBe('extra');
    expect(checkOrder(orders[3], ['tomato', 'leaf', 'lemon', null])).toBe('forbidden');
    expect(checkOrder(orders[3], ['leaf', 'tomato', null, null])).toBe('position');
    expect(checkOrder(orders[3], ['tomato', 'leaf', null, null])).toBe('correct');
    expect(checkOrder(orders[4], ['tomato', null, null, null])).toBe('missing');
  });
  it('places and removes immutably and ignores invalid positions', () => {
    const initial=emptyPlate(); const next=put(initial,0,'tomato');
    expect(initial[0]).toBeNull();expect(next[0]).toBe('tomato');
    expect(remove(next,0)).toEqual(initial);expect(put(next,0,'tomato')).toEqual(initial);expect(put(initial,-1,'leaf')).toBe(initial);
  });
  it('has twelve solvable, diverse orders', () => {
    expect(orders).toHaveLength(12);
    expect(new Set(orders.map(o=>JSON.stringify(o))).size).toBe(12);
    for (const order of orders) expect(matches(order,[...order.required, ...Array(4-order.required.length).fill(null)])).toBe(true);
  });
});
