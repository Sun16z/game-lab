import { describe, expect, it } from 'vitest';
import { decodeSave, save } from './save';
describe('local progress', () => {
  it('validates versions, bounds and ingredient values', () => {
    expect(decodeSave('{"version":1,"completed":1,"plate":["tomato",null,null,null]}')?.completed).toBe(1);
    for (const raw of ['{', '{"version":2,"completed":0,"plate":[null,null,null,null]}', '{"version":1,"completed":5,"plate":[null,null,null,null]}', '{"version":1,"completed":0,"plate":["bad",null,null,null]}']) expect(decodeSave(raw)).toBeUndefined();
  });
  it('restores and validates the total placements for resumed challenges', () => {
    expect(decodeSave('{"version":1,"completed":2,"plate":[null,null,null,null],"moves":5}')?.moves).toBe(5);
    expect(decodeSave('{"version":1,"completed":2,"plate":[null,null,null,null]}')?.moves).toBe(0);
    expect(decodeSave('{"version":1,"completed":2,"plate":[null,null,null,null],"moves":-1}')).toBeUndefined();
  });
  it('keeps free plates separate from guest progress', () => {
    const data = new Map<string,string>();
    const store = { setItem(key:string,value:string) { data.set(key,value) } };
    const guest={version:1 as const,completed:1,plate:['tomato',null,null,null] as const};
    const free={version:1 as const,completed:0,plate:['star',null,null,null] as const};
    expect(save(store,guest)).toBe(true);
    expect(save(store,free,'game-lab:tiny-chef:free:v1')).toBe(true);
    expect(decodeSave(data.get('game-lab:tiny-chef:v1') ?? null)?.plate[0]).toBe('tomato');
    expect(decodeSave(data.get('game-lab:tiny-chef:free:v1') ?? null)?.plate[0]).toBe('star');
  });
  it('keeps play possible when storage is unavailable', () => {
    expect(save({setItem(){throw new Error('blocked')}},{version:1,completed:0,plate:[null,null,null,null]})).toBe(false);
  });
});
