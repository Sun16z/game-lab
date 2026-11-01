import { expect, it } from 'vitest';
import { SnowInput } from './input';
it('handles simultaneous steering sources, cancellation and one-shot jump', () => {
  const input = new SnowInput(); input.set('left', 'keyboard', true); input.set('right', 'touch', true);
  expect(input.read().steer).toBe(0); input.set('right', 'touch', false); expect(input.read().steer).toBe(-1);
  input.jump(); expect(input.read().jump).toBe(true); expect(input.read().jump).toBe(false);
  input.clear(); expect(input.read()).toEqual({ steer: 0, jump: false });
});
