import { describe, expect, it } from 'vitest';
import { project } from './render';
describe('snow perspective', () => {
  it('keeps distant objects smaller and higher than near objects', () => {
    const near = project(0, 1), far = project(180, 1);
    expect(near.y).toBeGreaterThan(far.y); expect(near.scale).toBeGreaterThan(far.scale);
    expect(project(50, -1).x).toBeLessThan(240); expect(project(50, 1).x).toBeGreaterThan(240);
  });
});
