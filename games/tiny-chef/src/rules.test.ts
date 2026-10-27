import { describe, expect, it } from 'vitest';
import { emptyPlate, matches, orders, put, remove } from './rules';
describe('restaurant orders', () => {
  it('requires requested items with enough occurrences and rejects forbidden ones', () => {
    expect(matches(orders[1], ['lemon', null, null, null])).toBe(false);
    expect(matches(orders[1], ['leaf', 'lemon', null, null])).toBe(true);
    expect(matches(orders[3], ['tomato', 'leaf', 'lemon', null])).toBe(false);
    expect(matches({required:['tomato','tomato'],forbidden:[],ordered:false}, ['tomato',null,null,null])).toBe(false);
  });
  it('checks ordered positions even when there are empty slots', () => {
    expect(matches(orders[3], ['leaf','tomato',null,null])).toBe(false);
    expect(matches(orders[3], ['tomato','leaf',null,null])).toBe(true);
  });
  it('places and removes immutably and ignores invalid positions', () => {
    const initial=emptyPlate(); const next=put(initial,0,'tomato');
    expect(initial[0]).toBeNull();expect(next[0]).toBe('tomato');
    expect(remove(next,0)).toEqual(initial);expect(put(initial,-1,'leaf')).toBe(initial);
  });
  it('provides at least one valid arrangement for every order', () => {
    for (const order of orders) expect(matches(order,[...order.required, ...Array(4-order.required.length).fill(null)])).toBe(true);
  });
});
