import { describe, it, expect } from 'vitest';
import { PixelCelebrations, celebrationFor, celebrationPalette, type SuccessCues, type PixelSurface } from './pixel-celebrations';
import { composite, type Frame } from './vendor/pixelfx/core/index.js';
const cues = (kind: 'bullseye' | 'combo' | 'record'): SuccessCues => ({ bullseye: kind === 'bullseye', streakMilestone: kind === 'combo', justBeatRecord: kind === 'record' });
function harness() {
  let allocations = 0, clears = 0, presents = 0, lit = 0;
  const surface: PixelSurface = { present(frame: Frame) { presents++; const rgba = composite(frame, new Uint8ClampedArray(frame.w * frame.h * 4), null); lit = Math.max(lit, rgba.filter((_, i) => i % 4 === 3 && rgba[i] > 0).length); }, clear() { clears++; }, destroy() {} };
  const fx = new PixelCelebrations(() => { allocations++; return surface; });
  const trigger = (kind: 'bullseye' | 'combo' | 'record', reduced = false) => kind === 'record' ? fx.celebrateRecord(reduced, 'classic', [0x126080], 0xffb000) : fx.trigger(cues(kind), reduced, 'classic', [0x126080], 0xffb000, 240, 500);
  return { fx, trigger, counts: () => ({ allocations, clears, presents, lit }) };
}
describe('pixel success feedback', () => {
  it('selects combo over bullseye and leaves ordinary Perfect alone', () => {
    expect(celebrationFor({ bullseye: true, streakMilestone: true, justBeatRecord: true })).toBe('combo');
    expect(celebrationFor({ bullseye: true, streakMilestone: true, justBeatRecord: false })).toBe('combo');
    expect(celebrationFor({ bullseye: true, streakMilestone: false, justBeatRecord: false })).toBe('bullseye');
    expect(celebrationFor({ bullseye: false, streakMilestone: false, justBeatRecord: false })).toBeNull();
  });
  it('never allocates in reduced motion, and idle updates do no canvas work', () => {
    const h = harness(); for (const kind of ['record', 'combo', 'bullseye'] as const) h.trigger(kind, true);
    for (let i = 0; i < 20; i++) h.fx.update(1 / 60);
    expect(h.counts()).toEqual({ allocations: 0, clears: 0, presents: 0, lit: 0 });
  });
  it('replaces the previous effect and clears on retry/end or motion change', () => {
    const h = harness(); h.trigger('bullseye'); h.trigger('combo');
    expect(h.fx.snapshot().kind).toBe('combo'); h.trigger('bullseye');
    expect(h.fx.snapshot().kind).toBe('bullseye'); expect(h.counts().allocations).toBe(1);
    h.fx.update(.05); h.fx.clear(); const count = h.counts().presents; h.fx.update(.05);
    expect(h.counts().presents).toBe(count); expect(h.fx.snapshot().kind).toBeNull();
    h.trigger('combo'); h.trigger('record', true); expect(h.fx.snapshot().kind).toBeNull();
  });
  it('fades the star and clears within .8s', () => {
    const h = harness(); h.trigger('combo'); for (let i = 0; i < 5; i++) h.fx.update(.1);
    h.fx.update(.001); expect(h.fx.snapshot().stopped).toBe(true);
    for (let i = 0; i < 4; i++) h.fx.update(.1);
    expect(h.fx.snapshot().kind).toBeNull(); expect(h.counts().clears).toBe(1); expect(h.counts().lit).toBeGreaterThan(0);
  });
  for (const [kind, duration] of [['bullseye', .8], ['record', 3.4]] as const) it(`${kind} draws transparent pixels and ends at its declared duration`, () => {
    const h = harness(); h.trigger(kind); for (let i = 0; i < Math.ceil(duration / .1) + 1; i++) h.fx.update(.1);
    expect(h.fx.snapshot().kind).toBeNull(); expect(h.counts().lit).toBeGreaterThan(0); expect(h.counts().clears).toBe(1);
    const count = h.counts().presents; h.fx.update(.1); expect(h.counts().presents).toBe(count);
  });
  it('clips every gameplay pixel above the placed block', () => {
    let checked = 0; const fx = new PixelCelebrations(() => ({ present(frame) { checked++; expect(frame.color.slice(0, 250 * 240).some(Boolean)).toBe(false); expect(frame.light.slice(0, 250 * 240).some(Boolean)).toBe(false); }, clear() {}, destroy() {} }));
    fx.trigger(cues('combo'), false, 'classic', [0x123456], 0xffb000, 240, 500); for (let i = 0; i < 50; i++) fx.update(1 / 60); expect(checked).toBeGreaterThan(0);
  });
  it('uses darker classic colors and restrained light, with theme colors on dark scenes', () => {
    expect(celebrationPalette('classic', [], 0).light).toBe(.4);
    expect(celebrationPalette('neon', [0x012345], 0x123abc)).toEqual({ palette: ['#10132F', '#012345', '#123abc', '#FFFFFF'], light: 1 });
  });
});
