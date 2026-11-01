import { describe, expect, it } from 'vitest';
import { courseFeatures, initialSnowState, stepSnow, DURATION } from './rules';
describe('snow course', () => {
  it('reproduces three distinct courses and leaves routes around obstacles', () => {
    expect(courseFeatures(0)).toEqual(courseFeatures(0));
    expect(courseFeatures(0)).not.toEqual(courseFeatures(1));
    expect(new Set(courseFeatures(2).map(f => f.id)).size).toBe(42);
  });
  it('ends at 90 seconds and respects speed and steering bounds', () => {
    let s = initialSnowState(); const course = courseFeatures(0);
    for (let i = 0; i < 2000; i++) s = stepSnow(s, { steer: 1, jump: false }, course, .05);
    expect(s.elapsed).toBe(DURATION); expect(s.speed).toBeLessThanOrEqual(22); expect(s.x).toBe(1.4);
    expect(stepSnow(s, { steer: -1, jump: true }, course, .05)).toBe(s);
  });
  it('counts a gate once and allows jumping over snowbanks', () => {
    const f = [{ id: 1, distance: 1, lane: 0, kind: 'gate' as const }, { id: 2, distance: 2, lane: 0, kind: 'snowbank' as const }];
    let s = initialSnowState(); for (let i = 0; i < 8; i++) s = stepSnow(s, { steer: 0, jump: true }, f, .05);
    expect(s.gates).toBe(1); expect(s.hits).toBe(0); expect(s.checked).toEqual([1, 2]);
  });
});

it('all three courses can be navigated without a collision by anticipating visible features', () => {
  for (const course of [0, 1, 2] as const) {
    const features = courseFeatures(course); let s = initialSnowState();
    while (s.elapsed < DURATION) {
      const next = features.find(f => f.distance > s.distance);
      const target = next?.kind === 'gate' ? next.lane : s.x;
      const difference = target - s.x;
      const steer = Math.abs(difference) < .04 ? 0 : difference > 0 ? 1 : -1;
      const jump = next?.kind === 'snowbank' && next.distance - s.distance < s.speed * .35 && Math.abs(s.x - next.lane) < .42;
      s = stepSnow(s, { steer, jump }, features, 1/60);
    }
    expect(s.hits).toBe(0); expect(s.gates).toBeGreaterThan(15);
  }
});
