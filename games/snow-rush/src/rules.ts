/** Deterministic downhill simulation; renderer, input and platform adapters stay separate. */
export type Course = 0 | 1 | 2;
export type FeatureKind = 'gate' | 'snowbank';
export interface Feature { id: number; distance: number; lane: number; kind: FeatureKind }
export interface SnowState { elapsed: number; distance: number; x: number; speed: number; jump: number; gates: number; hits: number; checked: number[] }
export interface SnowInput { steer: -1 | 0 | 1; jump: boolean }
export const DURATION = 90;
export function courseFeatures(course: Course): Feature[] {
  // 3 fixed courses, with a single clear lane at each obstacle beat.
  return Array.from({ length: 42 }, (_, id) => ({
    id, distance: 65 + id * 34,
    lane: (id * 7 + course * 5 + Math.floor(id / 4)) % 3 - 1,
    kind: id < 4 || id % 3 !== 2 ? 'gate' : 'snowbank'
  }));
}
export function initialSnowState(): SnowState {
  return { elapsed: 0, distance: 0, x: 0, speed: 12, jump: 0, gates: 0, hits: 0, checked: [] };
}
export function stepSnow(state: SnowState, input: SnowInput, features: readonly Feature[], delta: number): SnowState {
  if (state.elapsed >= DURATION) return state;
  const dt = Math.max(0, Math.min(.05, delta, DURATION - state.elapsed));
  const elapsed = state.elapsed + dt;
  const speed = Math.min(22, state.speed + dt * .2);
  const distance = state.distance + speed * dt;
  const x = Math.max(-1.4, Math.min(1.4, state.x + input.steer * dt * 1.8));
  const jump = input.jump && state.jump <= 0 ? .8 : Math.max(0, state.jump - dt);
  let gates = state.gates, hits = state.hits, nextSpeed = speed;
  const checked = [...state.checked];
  for (const feature of features) {
    if (feature.distance > state.distance && feature.distance <= distance && !checked.includes(feature.id)) {
      checked.push(feature.id);
      const aligned = Math.abs(x - feature.lane) < .42;
      if (feature.kind === 'gate' && aligned) gates++;
      if (feature.kind === 'snowbank' && aligned && jump <= .12) { hits++; nextSpeed = Math.max(12, speed - 3); }
    }
  }
  return { elapsed, distance, x, speed: nextSpeed, jump, gates, hits, checked };
}
